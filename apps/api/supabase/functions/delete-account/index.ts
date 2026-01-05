// Supabase Edge Function: delete-account
// Handles complete account deletion for GDPR/App Store compliance

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Get the user's JWT from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token to verify identity
    const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get the user from the token
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    console.log(`Starting account deletion for user: ${userId}`);

    // Use service role client for deletion operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const deletionLog: string[] = [];

    // 1. Delete all user's videos from storage
    try {
      const { data: userVideos } = await supabaseAdmin.storage
        .from('swing-videos')
        .list(userId);

      if (userVideos && userVideos.length > 0) {
        const filePaths = userVideos.map(f => `${userId}/${f.name}`);
        await supabaseAdmin.storage
          .from('swing-videos')
          .remove(filePaths);
        deletionLog.push(`Deleted ${filePaths.length} videos from storage`);
      }
    } catch (e) {
      console.error('Error deleting videos:', e);
      deletionLog.push(`Video deletion error: ${e.message}`);
    }

    // 2. Delete analyses from database
    try {
      const { count } = await supabaseAdmin
        .from('analyses')
        .delete()
        .eq('user_id', userId);
      deletionLog.push(`Deleted ${count || 0} analyses`);
    } catch (e) {
      console.error('Error deleting analyses:', e);
    }

    // 3. Delete video cleanup queue entries
    try {
      await supabaseAdmin
        .from('video_cleanup_queue')
        .delete()
        .eq('user_id', userId);
      deletionLog.push('Deleted video cleanup queue entries');
    } catch (e) {
      console.error('Error deleting queue entries:', e);
    }

    // 4. Delete user profile data (if exists)
    try {
      await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);
      deletionLog.push('Deleted user profile');
    } catch (e) {
      // Profile table might not exist
      console.log('No profile to delete or table does not exist');
    }

    // 5. Delete the user's auth account
    try {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (deleteError) {
        throw deleteError;
      }
      deletionLog.push('Deleted auth account');
    } catch (e) {
      console.error('Error deleting auth account:', e);
      return new Response(
        JSON.stringify({ error: 'Failed to delete auth account', details: e.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Log the deletion for compliance
    try {
      await supabaseAdmin
        .from('account_deletions')
        .insert({
          user_id_hash: await hashUserId(userId), // Store hashed ID for audit
          deleted_at: new Date().toISOString(),
          deletion_log: deletionLog,
        });
    } catch (e) {
      // Audit log table might not exist, that's okay
      console.log('Could not log deletion (audit table may not exist)');
    }

    console.log(`Account deletion completed for user: ${userId}`);
    console.log('Deletion log:', deletionLog);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account and all associated data have been deleted',
        deletionLog,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Account deletion error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Account deletion failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Hash user ID for audit logging (we don't want to store actual IDs after deletion)
async function hashUserId(userId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(userId + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
