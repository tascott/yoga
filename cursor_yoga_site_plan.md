# Cursor Build Plan: Yoga Website + Supabase + Stitch MCP + Acuity

You are building a production-ready brochure website for a yoga client.

## Core outcome

Build a fast, polished public site in **Next.js** with a **locked layout** and a **very simple visual editing mode** for the client.

The client must only be able to:
- replace images
- edit plain text
- manage gallery images
- update contact details
- update fixed class descriptions

The client must **not** be able to:
- change layout
- drag and drop blocks
- change typography styles
- change spacing
- create arbitrary pages
- use a rich text editor
- access developer tooling or raw database concepts

Booking and schedule management are handled externally by **Acuity Scheduling**.

Do not build a blog, news system, or full CMS.

---

## Available external systems

### Google Stitch MCP
Use Stitch as the source of truth for design and UI reference.

Stitch supports generating and refining UI from prompts and images, exporting frontend code, and pasting designs to Figma. If a Stitch MCP server is available in Cursor, use it to inspect the existing design project and screens first. Stitch-related tooling commonly exposes project/screen browsing, previewing, and higher-level helpers such as `build_site`, `get_screen_code`, and `get_screen_image`. If tool names differ, inspect the available Stitch MCP tools and adapt. Do not assume exact tool names without checking the MCP server first.

### Supabase MCP
Use Supabase MCP to inspect and manage the project/database/storage/auth setup. Prefer a scoped development project or dev branch. If the MCP configuration supports feature groups, use only the minimum required features. Start by inspecting available tools and the current project state before making changes.

---

## Absolute implementation rules

1. Use **Next.js App Router** and **TypeScript**.
2. Use **Tailwind CSS**.
3. Use **server-rendered or statically cached content** for the public site.
4. Do **not** fetch page content on the client after first paint for public pages.
5. The public site HTML must already contain the text and image URLs on initial render.
6. Use **revalidation** after content updates so pages stay fast and update quickly.
7. Use **Supabase Auth** only for the admin/editor login.
8. Use **Supabase Postgres** for structured content.
9. Use **Supabase Storage** for images.
10. Keep the schema narrow and page-driven, not generic-CMS-driven.
11. Build a **custom visual edit mode** on top of the real site.
12. Do **not** install or integrate Sanity, Builder, Storyblok, Squarespace, Decap, Tina, or any drag/drop editor.
13. Do **not** add Markdown, rich text, Portable Text, WYSIWYG, or block-based content editing.
14. Text fields should be plain text or plain multiline text only.
15. The layout must remain developer-controlled in code.
16. The client must not see raw table names, records, slugs, schema controls, or publishing workflows.
17. Saving changes should either publish immediately or use a minimal preview-then-publish flow. Default to immediate publish.
18. Use Acuity only as an external booking/embed/link target. Do not recreate booking logic.
19. Keep the implementation simple enough for an LLM to maintain.
20. Prioritize a clean, premium yoga aesthetic matching the Stitch design.

---

## Primary build sequence

Follow this order exactly.

### Phase 1: Inspect design and existing resources

1. Inspect the Stitch MCP server and list available tools.
2. Identify the relevant Stitch project.
3. Inspect all available screens and screen IDs.
4. Export or retrieve the screen HTML and screenshots for each screen that maps to a site page.
5. Create a page map from Stitch screens to website routes.
6. Inspect the Supabase MCP server and list available tools.
7. Inspect the target Supabase project, branch, auth state, storage buckets, and database schema.
8. If no suitable dev branch/environment exists, create or use a safe development setup.

### Phase 2: Scaffold app and routes

Create the project structure and routes before wiring content.

### Phase 3: Implement design system

Translate Stitch design tokens, spacing, layout, and components into reusable Next.js/Tailwind components.

### Phase 4: Implement Supabase-backed content model

Create the database tables, storage bucket(s), policies, and TypeScript types.

### Phase 5: Implement public pages

Render all public content server-side or with static caching and revalidation.

### Phase 6: Implement custom visual edit mode

Layer editing affordances onto the actual page, but only for authenticated admins.

### Phase 7: Wire image management

Support image replacement and gallery management through Supabase Storage.

### Phase 8: Wire Acuity

Add booking page/embed/CTA links.

### Phase 9: Harden and polish

Add auth guards, validation, upload constraints, error handling, loading states, and accessibility.

### Phase 10: Deliver handoff-ready system

Produce seed content, a default admin account flow, and a minimal README for future maintenance.

---

## Route map

Create these routes unless Stitch clearly defines a better equivalent set:

- `/` — Home
- `/about` — About / teacher bio
- `/classes` — Fixed class descriptions and booking CTA
- `/book` — Acuity scheduling embed or linked booking screen
- `/contact` — Contact details and optional map/embed block
- `/gallery` — Optional if the design includes a dedicated gallery page
- `/login` — Admin login
- `/edit` — Edit dashboard landing page
- `/edit/[slug]` — Page-specific visual editing mode using the real public layout

If the Stitch project defines a different set of pages, adapt the routes to the design while preserving the same architecture.

---

## Required content model

Use a **fixed-region** content model.

Do not create a generic page builder.

### Table: `pages`
Use one row per route.

Columns:
- `id` uuid primary key default generated
- `slug` text unique not null
- `title` text not null
- `seo_title` text null
- `seo_description` text null
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

### Table: `page_sections`
Use one row per editable region on a page.

Columns:
- `id` uuid primary key default generated
- `page_id` uuid not null references `pages(id)` on delete cascade
- `section_key` text not null
- `label` text not null
- `kind` text not null check kind in (`text`,`textarea`,`image`,`gallery`,`link`,`contact_group`,`class_card_group`)
- `text_value` text null
- `json_value` jsonb null
- `image_path` text null
- `alt_text` text null
- `sort_order` integer default 0
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()
- unique (`page_id`, `section_key`)

### Table: `gallery_images`
Use for gallery items only.

Columns:
- `id` uuid primary key default generated
- `section_id` uuid not null references `page_sections(id)` on delete cascade
- `image_path` text not null
- `alt_text` text null
- `sort_order` integer default 0
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

### Table: `site_settings`
Singleton row.

Columns:
- `id` uuid primary key default generated
- `site_name` text
- `primary_phone` text
- `primary_email` text
- `address_line_1` text
- `address_line_2` text
- `city` text
- `postcode` text
- `instagram_url` text
- `facebook_url` text
- `booking_url` text
- `headshot_image_path` text
- `headshot_alt_text` text
- `updated_at` timestamptz default now()

### Table: `admin_profiles`
Optional if needed for metadata.

Columns:
- `id` uuid primary key references `auth.users(id)` on delete cascade
- `role` text not null default 'admin'
- `display_name` text null
- `created_at` timestamptz default now()

---

## Editable regions

Implement these fixed editable regions.

### Home page
- hero heading
- hero subheading
- hero image
- intro paragraph
- primary CTA text
- primary CTA link
- teacher headshot
- teacher bio summary
- fixed class summary cards
- optional testimonial strip text
- homepage gallery

### About page
- page heading
- bio section 1
- bio section 2
- headshot image
- optional secondary image

### Classes page
- page heading
- intro text
- fixed class card 1
- fixed class card 2
- fixed class card 3
- booking CTA text
- booking CTA link

Each fixed class card should support only:
- title
- short description
- optional duration text
- optional price text

### Book page
- heading
- intro text
- Acuity embed or booking button/link
- optional FAQ blurb

### Contact page
- heading
- intro text
- phone
- email
- address lines
- optional map/embed area controlled in code

### Gallery page if present
- heading
- intro text
- gallery images

---

## Storage setup

Create a Supabase Storage bucket for site images.

Suggested bucket:
- `site-images`

Folder structure:
- `home/`
- `about/`
- `classes/`
- `gallery/`
- `settings/`

Requirements:
- only authenticated admin users can upload/remove
- public site can read published image URLs
- enforce file type validation in UI: jpg, jpeg, png, webp
- enforce max upload size in UI
- strongly encourage sensible dimensions per field in helper text

If Supabase image transformations are available in the project, use them for display sizing. Otherwise use `next/image` with stable remote patterns and sized rendering.

---

## Auth and permissions

Use Supabase Auth for a single admin/editor account.

Requirements:
- email/password login is sufficient
- only authenticated admins can access `/edit/**`
- unauthenticated users must be redirected to `/login`
- public routes must never expose edit controls
- only admins can write to `pages`, `page_sections`, `gallery_images`, `site_settings`, and `site-images`
- public reads are allowed only where needed for published site rendering

Implement RLS policies accordingly.

Do not overbuild roles. One admin role is enough.

---

## Public rendering strategy

Use server components and cached data access.

Requirements:
- no client-side hydration for content fetching on public pages
- no flashing text/images after load
- public pages should fetch data on the server
- use revalidation after edits are saved
- keep a stable fetch layer in `lib/content`

Use this pattern:
1. server fetch from Supabase
2. render complete HTML on server
3. cache appropriately
4. on admin save, trigger revalidation for affected routes

---

## Edit mode UX

Build a custom edit mode using the same page layout as the public site.

### Edit mode rules
- the page should still look like the real site
- editable regions get a subtle outline on hover
- each editable region gets a clear label
- clicking a region opens a simple side panel or modal editor
- keep the top bar minimal

### Top bar
Include only:
- Exit edit mode
- Save changes
- optional Discard changes

### Text editing
- use plain text input for short text
- use textarea for paragraphs
- preserve line breaks only if needed
- do not expose formatting controls

### Image editing
- replace image button
- upload new image
- show preview
- save
- optional remove/restore only if relevant

### Gallery editing
Support:
- add image
- replace image
- remove image
- reorder images
- edit alt text

Do not support arbitrary gallery layout changes.

### Page navigation in edit mode
Allow switching between editable pages, but keep it visually simple.

### Save behavior
Default behavior:
- save directly to database
- trigger revalidation
- show success toast
- changes go live immediately

Do not implement drafts unless absolutely necessary.

---

## UI component list

Create reusable components for both public and edit mode.

### Public components
- `Header`
- `Footer`
- `HeroSection`
- `SectionHeading`
- `RichTextBlock` only if rendered from plain paragraphs; otherwise use `TextBlock`
- `ClassCard`
- `ImageBlock`
- `GalleryGrid`
- `ContactBlock`
- `BookingEmbed`
- `CTASection`

### Edit components
- `EditModeProvider`
- `EditToolbar`
- `EditableRegion`
- `EditableText`
- `EditableTextarea`
- `EditableImage`
- `EditableGallery`
- `EditSidePanel`
- `SaveStatus`
- `ProtectedRoute`

Keep edit components separate from public presentation as much as practical.

---

## Required file structure

Use this as the baseline:

```txt
app/
  (public)/
    page.tsx
    about/page.tsx
    classes/page.tsx
    book/page.tsx
    contact/page.tsx
    gallery/page.tsx
  edit/
    page.tsx
    [slug]/page.tsx
  login/page.tsx
  api/
    revalidate/route.ts

components/
  layout/
    Header.tsx
    Footer.tsx
  sections/
    HeroSection.tsx
    ClassCard.tsx
    GalleryGrid.tsx
    ContactBlock.tsx
    CTASection.tsx
  editable/
    EditModeProvider.tsx
    EditToolbar.tsx
    EditableRegion.tsx
    EditableText.tsx
    EditableTextarea.tsx
    EditableImage.tsx
    EditableGallery.tsx
    EditSidePanel.tsx
    SaveStatus.tsx

lib/
  supabase/
    browser.ts
    server.ts
    middleware.ts
  content/
    queries.ts
    mutations.ts
    mapping.ts
    types.ts
  stitch/
    extract-design.ts
    route-map.ts
  validation/
    content.ts
    uploads.ts
  utils/
    revalidate.ts
    urls.ts

middleware.ts
supabase/
  migrations/
  seed.sql
types/
  database.ts
```

If a page does not exist in the final design, omit it, but keep the same architectural pattern.

---

## Stitch workflow instructions

Use Stitch MCP before implementing UI.

### Required Stitch tasks
1. List available Stitch MCP tools.
2. Inspect the target Stitch project.
3. Retrieve screen names, IDs, metadata, screenshots, and code/HTML where available.
4. Create a route map from screens to Next.js routes.
5. Extract design system details from the Stitch design:
   - spacing scale
   - typography scale
   - colors
   - border radius
   - shadows
   - image treatments
   - card layouts
   - button states
   - responsive behavior
6. Convert those into reusable Tailwind classes/components.
7. Do not blindly paste generated HTML into production pages.
8. Use Stitch output as reference and implementation input, then refactor into clean React components.
9. Preserve the visual intent while making the code maintainable.
10. If Stitch provides multiple variants, choose the most premium, calm, simple version aligned with a yoga/wellness brand.

### If Stitch MCP exposes helper tools such as these, use them
- project browsing / listing
- screen browsing / listing
- screen screenshot retrieval
- screen code retrieval
- build-site or route-mapping helpers

If tool names differ, inspect the MCP tool list first and adapt.

---

## Supabase workflow instructions

Use Supabase MCP to create and verify the backend setup.

### Required Supabase tasks
1. Inspect available Supabase MCP tools.
2. Confirm the active project/branch and avoid destructive changes to production unless explicitly intended.
3. Create migrations for all required tables.
4. Create the storage bucket.
5. Configure RLS policies.
6. Generate or sync database types for the Next.js app.
7. Seed initial page rows and fixed section rows.
8. Verify reads for public pages.
9. Verify writes for authenticated admins.
10. Verify image uploads and public display URLs.

### Safety rules
- inspect before mutating
- prefer migrations over ad hoc changes
- keep schema simple
- do not introduce unrelated tables or abstractions
- do not store layout as JSON blobs
- do not build a generic CMS schema

---

## Content seeding rules

Seed the database with placeholder content if real copy is not available.

Requirements:
- every route must render with realistic placeholder content
- section labels must be human-readable in edit mode
- every editable region must already exist in the database after seeding
- avoid requiring the client to create missing sections manually

Example labels:
- Hero heading
- Hero subheading
- Teacher headshot
- About paragraph 1
- Class card 1 title
- Class card 1 description
- Gallery images
- Contact intro

---

## Data access layer rules

Create a dedicated content layer.

### Required functions
- `getPageBySlug(slug)`
- `getPageSections(slug)`
- `getSiteSettings()`
- `getGalleryImages(sectionId)`
- `updateSectionText(sectionId, value)`
- `updateSectionImage(sectionId, file)`
- `replaceGalleryImage(imageId, file)`
- `addGalleryImage(sectionId, file)`
- `removeGalleryImage(imageId)`
- `reorderGalleryImages(sectionId, orderedIds)`
- `updateSiteSettings(payload)`

Keep these functions typed and centralised.

---

## Validation rules

Implement server-side and client-side validation.

### Text validation
- trim leading/trailing whitespace where appropriate
- support empty values only if the design can tolerate them
- enforce sensible max lengths for short fields

### Image validation
- accepted mime types only
- max file size
- reject corrupted uploads
- preserve or prompt for alt text where relevant

### Link validation
- validate Acuity URL and social URLs
- normalize protocol if missing where practical

---

## Acuity implementation rules

Booking is external.

Requirements:
- include a booking CTA on relevant pages
- use either an embed or a clean external link depending on the design
- do not store class schedules in the database unless needed only for display copy
- do not recreate booking management
- keep the booking URL editable in `site_settings`

---

## Styling rules

The site should feel premium, calm, spacious, and trustworthy.

Use the Stitch design as the visual source of truth.

General rules:
- restrained palette
- clear hierarchy
- generous spacing
- soft corners only if present in design
- strong readability
- excellent mobile layout
- minimal animation
- no flashy interactions

Do not introduce a second design language.

---

## Accessibility requirements

Implement all of the following:
- semantic headings
- alt text for content images
- keyboard-accessible admin controls
- visible focus states
- sufficient color contrast
- accessible form labels
- sensible button names
- reduced reliance on hover-only interactions

---

## Performance requirements

Implement all of the following:
- use `next/image`
- size images correctly
- avoid client-side content fetching on public pages
- minimize client bundles
- do not overuse context/providers
- lazy load edit-only UI where practical
- revalidate only affected pages after save
- avoid unnecessary requests in edit mode

---

## Error handling requirements

Implement graceful handling for:
- failed content fetch
- missing page rows
- missing section rows
- failed image upload
- failed save
- expired auth session
- missing Acuity URL

Show clear admin-facing messages in edit mode. Public pages should fail gracefully and never expose stack traces.

---

## Testing checklist

Complete these checks before considering the task done.

### Public site
- all pages render with server-fetched content
- no flash of unloaded content
- responsive on mobile/tablet/desktop
- images render correctly
- booking links work
- no visible admin UI when logged out

### Edit mode
- login works
- unauthorized access redirects to login
- clicking editable regions opens the correct editor
- text saves correctly
- image replacement works
- gallery add/remove/reorder works
- changes appear on public pages after save
- no layout controls are exposed

### Data layer
- migrations apply cleanly
- seed runs cleanly
- RLS policies behave correctly
- storage paths remain stable and predictable

---

## Deliverables

By the end, the project must include:
- Next.js app with all required routes
- reusable component system based on Stitch design
- Supabase schema and migrations
- Supabase storage bucket and policies
- seeded content rows
- authenticated custom visual edit mode
- Acuity integration
- route revalidation after edits
- typed data access layer
- concise project README

---

## Cursor execution instructions

Work autonomously and in order.

1. Inspect Stitch MCP tools and design assets first.
2. Inspect Supabase MCP tools and current project state.
3. Create the implementation plan as concrete tasks inside the workspace.
4. Scaffold the app.
5. Build the backend schema and seed.
6. Implement public pages.
7. Implement edit mode.
8. Wire uploads, saves, and revalidation.
9. Test the full flow.
10. Refactor for clarity and maintainability.

Do not ask to redesign the site. Do not ask to introduce a full CMS. Do not suggest drag/drop editing.

Proceed with the build using the available Stitch design and Supabase project as the foundations.
