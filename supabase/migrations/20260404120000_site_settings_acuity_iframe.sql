-- Run in Supabase SQL editor or via CLI migrate.
alter table public.site_settings
  add column if not exists acuity_iframe_src text,
  add column if not exists therapy_acuity_iframe_src text;
