# Accessible Yoga Hut

One-page Next.js site scaffolded with Supabase-backed fixed regions.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Ensure environment variables are present in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

3. Run the app:

```bash
npm run dev
```

4. Open:

- [http://localhost:3000](http://localhost:3000)

## Notes

- Public content on `/` is fetched server-side from Supabase (`pages`, `page_sections`, `site_settings`).
- Edit routes are available at `/login`, `/edit`, and `/edit/home` and are auth-gated.
- Booking/Acuity is currently placeholder-first until an Acuity account is available.

## Admin login setup

1. In Supabase Dashboard, create an Auth user (Email/Password) if you do not already have one.
2. Open `/login` locally and sign in with that account.
3. On first successful sign-in, the app auto-bootstraps the first `admin_profiles` row.
4. After login, `/edit` and `/edit/home` are accessible.