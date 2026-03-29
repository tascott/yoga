import { unstable_cache } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { HomePageContent, SectionKind, SectionValue } from "@/lib/content/types";
import type { Json } from "@/types/database";

type SectionRow = {
  section_key: string;
  label: string;
  kind: SectionKind;
  text_value: string | null;
  image_path: string | null;
  alt_text: string | null;
  is_active: boolean;
  sort_order: number;
  json_value: Json | null;
};

function resolveImageUrl(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  imagePath: string | null,
) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const { data } = supabase.storage.from("site-images").getPublicUrl(imagePath);
  return data.publicUrl;
}

function mapSections(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  rows: SectionRow[] | null | undefined,
) {
  return (rows ?? []).reduce<Record<string, SectionValue>>((acc, section) => {
    acc[section.section_key] = {
      key: section.section_key,
      label: section.label,
      kind: section.kind,
      textValue: section.text_value,
      imagePath: resolveImageUrl(supabase, section.image_path),
      altText: section.alt_text,
      isActive: section.is_active,
      sortOrder: section.sort_order,
      jsonValue: section.json_value,
    };
    return acc;
  }, {});
}

const getHomePageContentCached = unstable_cache(
  async (): Promise<HomePageContent> => {
    const supabase = createSupabaseServerClient();

    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select(
        `
        title,
        seo_title,
        seo_description,
        page_sections (
          section_key,
          label,
          kind,
          text_value,
          image_path,
          alt_text,
          is_active,
          sort_order,
          json_value
        )
      `,
      )
      .eq("slug", "home")
      .single();

    if (pageError) {
      throw new Error(`Failed to fetch home page: ${pageError.message}`);
    }

    const { data: settings, error: settingsError } = await supabase
      .from("site_settings")
      .select(
        "site_name, primary_phone, primary_email, address_line_1, address_line_2, city, postcode, instagram_url, facebook_url, linkedin_url, booking_url",
      )
      .limit(1)
      .maybeSingle();

    if (settingsError) {
      throw new Error(`Failed to fetch site settings: ${settingsError.message}`);
    }

    const sections = mapSections(supabase, (page.page_sections ?? []) as SectionRow[]);

    return {
      pageTitle: page.title,
      seoTitle: page.seo_title,
      seoDescription: page.seo_description,
      sections,
      settings: {
        siteName: settings?.site_name ?? null,
        primaryPhone: settings?.primary_phone ?? null,
        primaryEmail: settings?.primary_email ?? null,
        addressLine1: settings?.address_line_1 ?? null,
        addressLine2: settings?.address_line_2 ?? null,
        city: settings?.city ?? null,
        postcode: settings?.postcode ?? null,
        instagramUrl: settings?.instagram_url ?? null,
        facebookUrl: settings?.facebook_url ?? null,
        linkedinUrl: settings?.linkedin_url ?? null,
        bookingUrl: settings?.booking_url ?? null,
      },
    };
  },
  ["home-page-content"],
  { revalidate: 60, tags: ["page:home", "site:settings"] },
);

export async function getHomePageContent() {
  return getHomePageContentCached();
}

const getTherapyPageContentCached = unstable_cache(
  async (): Promise<HomePageContent> => {
    const supabase = createSupabaseServerClient();

    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select(
        `
        title,
        seo_title,
        seo_description,
        page_sections (
          section_key,
          label,
          kind,
          text_value,
          image_path,
          alt_text,
          is_active,
          sort_order,
          json_value
        )
      `,
      )
      .eq("slug", "therapy")
      .maybeSingle();

    if (pageError) {
      throw new Error(`Failed to fetch therapy page: ${pageError.message}`);
    }

    const { data: settings, error: settingsError } = await supabase
      .from("site_settings")
      .select(
        "site_name, primary_phone, primary_email, address_line_1, address_line_2, city, postcode, instagram_url, facebook_url, linkedin_url, booking_url",
      )
      .limit(1)
      .maybeSingle();

    if (settingsError) {
      throw new Error(`Failed to fetch site settings: ${settingsError.message}`);
    }

    const sections = mapSections(supabase, (page?.page_sections ?? []) as SectionRow[]);

    return {
      pageTitle: page?.title ?? "Therapy",
      seoTitle: page?.seo_title ?? "Therapy | Accessible Yoga Hut",
      seoDescription: page?.seo_description ?? "Therapy support from Accessible Yoga Hut.",
      sections,
      settings: {
        siteName: settings?.site_name ?? null,
        primaryPhone: settings?.primary_phone ?? null,
        primaryEmail: settings?.primary_email ?? null,
        addressLine1: settings?.address_line_1 ?? null,
        addressLine2: settings?.address_line_2 ?? null,
        city: settings?.city ?? null,
        postcode: settings?.postcode ?? null,
        instagramUrl: settings?.instagram_url ?? null,
        facebookUrl: settings?.facebook_url ?? null,
        linkedinUrl: settings?.linkedin_url ?? null,
        bookingUrl: settings?.booking_url ?? null,
      },
    };
  },
  ["therapy-page-content"],
  { revalidate: 60, tags: ["page:therapy", "site:settings"] },
);

export async function getTherapyPageContent() {
  return getTherapyPageContentCached();
}
