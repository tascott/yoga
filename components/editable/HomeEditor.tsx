"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type SectionRow = {
  id: string;
  section_key: string;
  label: string;
  kind: string;
  text_value: string | null;
  json_value: unknown;
  image_path: string | null;
  alt_text: string | null;
};

type EditableField = {
  key: string;
  label: string;
  mode: "text" | "textarea" | "json";
};

const editableFields: EditableField[] = [
  { key: "hero_heading", label: "Hero heading", mode: "text" },
  { key: "hero_subheading", label: "Hero subheading", mode: "textarea" },
  { key: "hero_primary_cta_text", label: "Hero CTA text", mode: "text" },
  { key: "hero_primary_cta_link", label: "Hero CTA link", mode: "text" },
  { key: "studio_heading", label: "Studio heading", mode: "text" },
  { key: "studio_body", label: "Studio body", mode: "textarea" },
  { key: "studio_feature_cards", label: "Studio feature cards (JSON)", mode: "json" },
  { key: "about_heading", label: "About heading", mode: "text" },
  { key: "about_body_primary", label: "About body primary", mode: "textarea" },
  { key: "about_body_secondary", label: "About body secondary", mode: "textarea" },
  { key: "practice_heading", label: "Practice heading", mode: "text" },
  { key: "practice_cards", label: "Practice cards (JSON)", mode: "json" },
  { key: "schedule_heading", label: "Schedule heading", mode: "text" },
  { key: "schedule_intro", label: "Schedule intro", mode: "textarea" },
  { key: "booking_cta_text", label: "Booking CTA text", mode: "text" },
  { key: "booking_cta_link", label: "Booking CTA link", mode: "text" },
  { key: "contact_heading", label: "Contact heading", mode: "text" },
  { key: "contact_intro", label: "Contact intro", mode: "textarea" },
  { key: "faq_heading", label: "FAQ heading", mode: "text" },
  { key: "faq_items", label: "FAQ items (JSON)", mode: "json" },
];

const imageFields = [
  { key: "hero_image", label: "Hero image" },
  { key: "about_headshot_image", label: "About headshot image" },
] as const;

export function HomeEditor() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sectionByKey, setSectionByKey] = useState<Record<string, SectionRow>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [imageAltValues, setImageAltValues] = useState<Record<string, string>>({});
  const [imageFileByKey, setImageFileByKey] = useState<Record<string, File | null>>({});
  const [bookingUrl, setBookingUrl] = useState("");
  const [siteSettingsId, setSiteSettingsId] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const fieldLabelByKey = useMemo(() => {
    const map: Record<string, string> = {};
    editableFields.forEach((field) => {
      map[field.key] = field.label;
    });
    imageFields.forEach((field) => {
      map[field.key] = field.label;
    });
    return map;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadEditorData() {
      setIsLoading(true);
      setErrorMessage("");

      const { data: page, error: pageError } = await supabase
        .from("pages")
        .select("id")
        .eq("slug", "home")
        .single();

      if (!isMounted) return;
      if (pageError || !page) {
        setErrorMessage(pageError?.message || "Unable to load home page.");
        setIsLoading(false);
        return;
      }

      const { data: sections, error: sectionsError } = await supabase
        .from("page_sections")
        .select("id, section_key, label, kind, text_value, json_value, image_path, alt_text")
        .eq("page_id", page.id);

      if (!isMounted) return;
      if (sectionsError) {
        setErrorMessage(sectionsError.message);
        setIsLoading(false);
        return;
      }

      const sectionMap: Record<string, SectionRow> = {};
      const values: Record<string, string> = {};
      const imageAltMap: Record<string, string> = {};

      (sections || []).forEach((section) => {
        sectionMap[section.section_key] = section;
        if (section.kind === "json" || section.kind === "class_card_group" || section.kind === "contact_group") {
          values[section.section_key] = JSON.stringify(section.json_value ?? {}, null, 2);
        } else {
          values[section.section_key] = section.text_value ?? "";
        }

        imageAltMap[section.section_key] = section.alt_text ?? "";
      });

      const { data: settings } = await supabase.from("site_settings").select("id, booking_url").limit(1).maybeSingle();

      if (!isMounted) return;
      setSectionByKey(sectionMap);
      setFormValues(values);
      setImageAltValues(imageAltMap);
      setBookingUrl(settings?.booking_url ?? "");
      setSiteSettingsId(settings?.id ?? null);
      setIsLoading(false);
    }

    loadEditorData();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  function updateFieldValue(key: string, value: string) {
    setFormValues((current) => ({ ...current, [key]: value }));
  }

  function updateImageAltValue(key: string, value: string) {
    setImageAltValues((current) => ({ ...current, [key]: value }));
  }

  function updateImageFile(key: string, file: File | null) {
    setImageFileByKey((current) => ({ ...current, [key]: file }));
  }

  function focusFieldFromPreview(fieldKey: string) {
    if (!fieldKey) return;
    setActiveFieldKey(fieldKey);
    const sectionEl = document.getElementById(`field-section-${fieldKey}`);
    sectionEl?.scrollIntoView({ behavior: "smooth", block: "center" });
    const inputEl = sectionEl?.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
    inputEl?.focus();
  }

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let cleanupFns: Array<() => void> = [];

    const handleIframeLoad = () => {
      cleanupFns.forEach((fn) => fn());
      cleanupFns = [];

      const doc = iframe.contentDocument;
      if (!doc) return;
      if (!doc.body) return;

      const hintEl = doc.createElement("div");
      hintEl.style.position = "fixed";
      hintEl.style.zIndex = "2147483647";
      hintEl.style.pointerEvents = "none";
      hintEl.style.padding = "6px 10px";
      hintEl.style.borderRadius = "999px";
      hintEl.style.background = "rgba(75, 99, 90, 0.95)";
      hintEl.style.color = "#fff";
      hintEl.style.fontSize = "11px";
      hintEl.style.fontWeight = "700";
      hintEl.style.letterSpacing = "0.08em";
      hintEl.style.textTransform = "uppercase";
      hintEl.style.display = "none";
      hintEl.style.maxWidth = "280px";
      hintEl.style.whiteSpace = "nowrap";
      hintEl.style.overflow = "hidden";
      hintEl.style.textOverflow = "ellipsis";
      doc.body.appendChild(hintEl);
      cleanupFns.push(() => hintEl.remove());

      const targets = doc.querySelectorAll<HTMLElement>("[data-edit-target]");
      targets.forEach((target) => {
        const keyString = target.getAttribute("data-edit-target");
        if (!keyString) return;
        const keys = keyString
          .split(",")
          .map((key) => key.trim())
          .filter(Boolean);
        const firstKey = keys[0];
        if (!firstKey) return;
        const labelText =
          keys
            .map((key) => fieldLabelByKey[key] || key)
            .join(" / ")
            .slice(0, 120) || "Editable region";

        target.style.cursor = "pointer";

        const handleClick = (event: Event) => {
          event.preventDefault();
          event.stopPropagation();
          focusFieldFromPreview(firstKey);
        };
        const handleMouseEnter = () => {
          target.style.outline = "2px solid rgba(75, 99, 90, 0.55)";
          hintEl.textContent = `Editing: ${labelText}`;
          hintEl.style.display = "block";
        };
        const handleMouseLeave = () => {
          target.style.outline = "";
          hintEl.style.display = "none";
        };
        const handleMouseMove = (event: MouseEvent) => {
          hintEl.style.left = `${event.clientX + 14}px`;
          hintEl.style.top = `${event.clientY + 14}px`;
        };

        target.addEventListener("click", handleClick);
        target.addEventListener("mouseenter", handleMouseEnter);
        target.addEventListener("mouseleave", handleMouseLeave);
        target.addEventListener("mousemove", handleMouseMove);

        cleanupFns.push(() => {
          target.removeEventListener("click", handleClick);
          target.removeEventListener("mouseenter", handleMouseEnter);
          target.removeEventListener("mouseleave", handleMouseLeave);
          target.removeEventListener("mousemove", handleMouseMove);
          target.style.outline = "";
        });
      });
    };

    iframe.addEventListener("load", handleIframeLoad);
    handleIframeLoad();

    return () => {
      iframe.removeEventListener("load", handleIframeLoad);
      cleanupFns.forEach((fn) => fn());
    };
  }, [previewKey, sectionByKey, fieldLabelByKey]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      for (const field of editableFields) {
        const section = sectionByKey[field.key];
        if (!section) continue;

        if (field.mode === "json") {
          let parsed: unknown = null;
          const rawValue = formValues[field.key]?.trim();
          if (rawValue) {
            try {
              parsed = JSON.parse(rawValue);
            } catch {
              throw new Error(`Invalid JSON in "${field.label}".`);
            }
          }

          const { error } = await supabase
            .from("page_sections")
            .update({ json_value: parsed })
            .eq("id", section.id);

          if (error) throw new Error(error.message);
        } else {
          const { error } = await supabase
            .from("page_sections")
            .update({ text_value: formValues[field.key] ?? "" })
            .eq("id", section.id);

          if (error) throw new Error(error.message);
        }
      }

      for (const imageField of imageFields) {
        const section = sectionByKey[imageField.key];
        if (!section) continue;

        const selectedFile = imageFileByKey[imageField.key];
        const nextAltText = imageAltValues[imageField.key] || null;
        let nextImagePath = section.image_path;

        if (selectedFile) {
          if (!["image/jpeg", "image/png", "image/webp"].includes(selectedFile.type)) {
            throw new Error(`${imageField.label}: only JPG, PNG, or WEBP is allowed.`);
          }

          if (selectedFile.size > 5 * 1024 * 1024) {
            throw new Error(`${imageField.label}: max upload size is 5MB.`);
          }

          const ext = selectedFile.name.includes(".")
            ? selectedFile.name.split(".").pop()?.toLowerCase() || "jpg"
            : "jpg";
          const uploadPath = `home/${imageField.key}-${Date.now()}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("site-images")
            .upload(uploadPath, selectedFile, { upsert: false });

          if (uploadError) throw new Error(uploadError.message);
          nextImagePath = uploadPath;
        }

        const { error: imageUpdateError } = await supabase
          .from("page_sections")
          .update({ image_path: nextImagePath, alt_text: nextAltText })
          .eq("id", section.id);

        if (imageUpdateError) throw new Error(imageUpdateError.message);

        if (
          selectedFile &&
          section.image_path &&
          !section.image_path.startsWith("http://") &&
          !section.image_path.startsWith("https://") &&
          section.image_path !== nextImagePath
        ) {
          await supabase.storage.from("site-images").remove([section.image_path]);
        }
      }

      if (siteSettingsId) {
        const { error } = await supabase.from("site_settings").update({ booking_url: bookingUrl || null }).eq("id", siteSettingsId);
        if (error) throw new Error(error.message);
      }

      setSuccessMessage("Changes saved. Refresh the public page to confirm.");
      setImageFileByKey({});
      setPreviewKey((current) => current + 1);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save changes.";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <p className="text-sm text-foreground/70">Loading editable regions...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[95rem] px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-headline text-4xl text-primary">Edit Home Content</h1>
          <p className="mt-2 text-sm text-foreground/75">
            Visual preview on the left, fixed-content editor on the right.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewKey((current) => current + 1)}
            className="rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-medium"
          >
            Refresh preview
          </button>
          <Link href="/" target="_blank" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
            Open public page
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_30rem]">
        <section className="rounded-2xl bg-white p-3 shadow-sm">
          <iframe
            key={previewKey}
            ref={iframeRef}
            src="/?edit=1"
            title="Live public site preview"
            className="h-[78vh] w-full rounded-xl border border-black/10"
          />
        </section>

        <form onSubmit={onSubmit} className="space-y-6 rounded-2xl bg-surface-low p-5">
        {editableFields.map((field) => {
          const value = formValues[field.key] ?? "";
          const rows = field.mode === "json" ? 8 : 4;

          return (
            <section
              id={`field-section-${field.key}`}
              key={field.key}
              className={`rounded-xl bg-white p-5 shadow-sm ${activeFieldKey === field.key ? "ring-2 ring-primary/60" : ""}`}
            >
              <label htmlFor={field.key} className="mb-2 block text-sm font-semibold">
                {field.label}
              </label>
              {field.mode === "text" ? (
                <input
                  id={field.key}
                  value={value}
                  onChange={(event) => updateFieldValue(field.key, event.target.value)}
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
                />
              ) : (
                <textarea
                  id={field.key}
                  value={value}
                  rows={rows}
                  onChange={(event) => updateFieldValue(field.key, event.target.value)}
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
                />
              )}
            </section>
          );
        })}

        {imageFields.map((field) => {
          const section = sectionByKey[field.key];
          const currentPath = section?.image_path || "";
          const currentUrl = currentPath
            ? currentPath.startsWith("http://") || currentPath.startsWith("https://")
              ? currentPath
              : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-images/${currentPath}`
            : "";

          return (
            <section
              id={`field-section-${field.key}`}
              key={field.key}
              className={`rounded-xl bg-white p-5 shadow-sm ${activeFieldKey === field.key ? "ring-2 ring-primary/60" : ""}`}
            >
              <p className="mb-2 text-sm font-semibold">{field.label}</p>
              <p className="mb-2 text-xs text-foreground/70">
                Current path: {currentPath || "not set"}
              </p>
              {currentUrl ? (
                <Image
                  src={currentUrl}
                  alt={imageAltValues[field.key] || `${field.label} preview`}
                  width={960}
                  height={400}
                  className="mb-3 h-40 w-full rounded-md object-cover"
                />
              ) : null}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => updateImageFile(field.key, event.target.files?.[0] || null)}
                className="mb-4 block w-full text-sm"
              />
              <label htmlFor={`${field.key}_alt`} className="mb-2 block text-sm font-semibold">
                Alt text
              </label>
              <input
                id={`${field.key}_alt`}
                value={imageAltValues[field.key] ?? ""}
                onChange={(event) => updateImageAltValue(field.key, event.target.value)}
                className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
              />
              <button
                type="button"
                onClick={() => {
                  updateImageFile(field.key, null);
                  setSectionByKey((current) => {
                    const next = { ...current };
                    if (next[field.key]) {
                      next[field.key] = {
                        ...next[field.key],
                        image_path: null,
                      };
                    }
                    return next;
                  });
                }}
                className="mt-3 text-xs font-medium text-red-700 underline"
              >
                Remove image (applies on Save)
              </button>
            </section>
          );
        })}

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <label htmlFor="booking_url" className="mb-2 block text-sm font-semibold">
            Site settings: booking URL
          </label>
          <input
            id="booking_url"
            value={bookingUrl}
            onChange={(event) => setBookingUrl(event.target.value)}
            placeholder="https://..."
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
          />
        </section>

        {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}
        {successMessage ? <p className="text-sm text-emerald-700">{successMessage}</p> : null}

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>
        </form>
      </div>
    </main>
  );
}
