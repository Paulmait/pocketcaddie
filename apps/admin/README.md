# SliceFix AI - Admin Portal

Internal admin portal for managing users, viewing audit logs, and performing administrative actions.

## Security

**CRITICAL**: This portal uses Supabase service_role key for privileged operations. The service_role key is NEVER exposed to the browser.

```
Browser (anon key only) → Next.js Server (service_role) → Supabase
```

## Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon key (safe for browser)
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key (SERVER ONLY)

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3001](http://localhost:3001)

## Admin Roles

Before using the portal, you must have an entry in `admin_roles` table:

```sql
INSERT INTO admin_roles (user_id, role, is_active)
VALUES ('your-user-id', 'admin', true);
```

| Role | Permissions |
|------|-------------|
| `support_readonly` | View users, view audit logs |
| `support_write_limited` | Above + disable/enable uploads |
| `admin` | Full access including delete users |

## Pages

| Page | Path | Description |
|------|------|-------------|
| Login | `/login` | Supabase Auth login |
| Dashboard | `/dashboard` | Overview stats and alerts |
| Users | `/users` | Search and browse users |
| User Detail | `/users/[uid]` | User profile, analyses, actions |
| Audit Log | `/audit` | Admin-only audit log viewer |

## Server Actions

All privileged operations use Next.js Server Actions:

- `deleteUser(userId)` - Delete a user account
- `toggleUploads(userId, disable)` - Enable/disable user uploads
- `exportUserData(userId)` - Export redacted debug summary

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (@supabase/ssr)
- Lucide React Icons
- date-fns

## Deployment

For production deployment:

1. Never commit `.env.local` or expose service_role key
2. Use environment variables in your hosting platform
3. Ensure proper network isolation
4. Consider IP allowlisting for admin portal access

## License

Internal use only - Cien Rios LLC
