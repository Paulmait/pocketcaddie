// Supabase Edge Function: cleanup-videos
// Scheduled function to delete videos older than 24 hours
// Run via cron: 0 * * * * (every hour)

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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting video cleanup job...');

    const now = new Date().toISOString();

    // Get videos that are past their deletion time
    const { data: videosToDelete, error: fetchError } = await supabase
      .from('video_cleanup_queue')
      .select('*')
      .lt('delete_after', now)
      .eq('deleted', false);

    if (fetchError) {
      console.error('Error fetching videos to delete:', fetchError);
      throw fetchError;
    }

    if (!videosToDelete || videosToDelete.length === 0) {
      console.log('No videos to delete');
      return new Response(
        JSON.stringify({ message: 'No videos to delete', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${videosToDelete.length} videos to delete`);

    let deletedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const video of videosToDelete) {
      try {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('videos')
          .remove([video.video_path]);

        if (storageError) {
          console.error(`Error deleting video ${video.video_path}:`, storageError);
          errors.push(`${video.video_path}: ${storageError.message}`);
          errorCount++;
          continue;
        }

        // Mark as deleted in queue
        await supabase
          .from('video_cleanup_queue')
          .update({ deleted: true, deleted_at: new Date().toISOString() })
          .eq('id', video.id);

        // Update analysis record to remove video reference
        await supabase
          .from('analyses')
          .update({ video_path: null, video_deleted_at: new Date().toISOString() })
          .eq('video_path', video.video_path);

        deletedCount++;
        console.log(`Deleted: ${video.video_path}`);

      } catch (error) {
        console.error(`Error processing video ${video.video_path}:`, error);
        errors.push(`${video.video_path}: ${error.message}`);
        errorCount++;
      }
    }

    // Also clean up any orphaned videos (older than 48 hours without queue entry)
    const orphanCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: storageFiles } = await supabase.storage
      .from('videos')
      .list('', { limit: 100 });

    if (storageFiles) {
      for (const file of storageFiles) {
        // Check if file is a folder (user ID folder)
        if (!file.id) continue;

        // List files in user folder
        const { data: userFiles } = await supabase.storage
          .from('videos')
          .list(file.name, { limit: 100 });

        if (userFiles) {
          for (const userFile of userFiles) {
            if (userFile.created_at && new Date(userFile.created_at) < new Date(orphanCutoff)) {
              const filePath = `${file.name}/${userFile.name}`;

              // Check if it's in the cleanup queue
              const { data: queueEntry } = await supabase
                .from('video_cleanup_queue')
                .select('id')
                .eq('video_path', filePath)
                .single();

              if (!queueEntry) {
                console.log(`Deleting orphaned video: ${filePath}`);
                await supabase.storage
                  .from('videos')
                  .remove([filePath]);
                deletedCount++;
              }
            }
          }
        }
      }
    }

    const result = {
      message: 'Cleanup completed',
      deleted: deletedCount,
      errors: errorCount,
      errorDetails: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    };

    console.log('Cleanup result:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Cleanup job error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Cleanup failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
