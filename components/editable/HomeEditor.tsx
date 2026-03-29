"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Json } from "@/types/database";

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
  mode: "text" | "textarea";
};

const editableFields: EditableField[] = [
  { key: "hero_heading", label: "Hero heading", mode: "text" },
  { key: "hero_subheading", label: "Hero subheading", mode: "textarea" },
  { key: "hero_primary_cta_text", label: "Hero CTA text", mode: "text" },
  { key: "hero_primary_cta_link", label: "Hero CTA link", mode: "text" },
  { key: "studio_heading", label: "Studio heading", mode: "text" },
  { key: "studio_body", label: "Studio body", mode: "textarea" },
  { key: "about_heading", label: "About heading", mode: "text" },
  { key: "about_body_primary", label: "About body primary", mode: "textarea" },
  { key: "about_body_secondary", label: "About body secondary", mode: "textarea" },
  { key: "about_support_blurb", label: "About support blurb", mode: "textarea" },
  { key: "about_support_cta_text", label: "About support button text", mode: "text" },
  { key: "about_support_cta_link", label: "About support button link", mode: "text" },
  { key: "practice_heading", label: "Practice heading", mode: "text" },
  { key: "schedule_heading", label: "Schedule heading", mode: "text" },
  { key: "schedule_intro", label: "Schedule intro", mode: "textarea" },
  { key: "booking_cta_text", label: "Booking CTA text", mode: "text" },
  { key: "booking_cta_link", label: "Booking CTA link", mode: "text" },
  { key: "contact_heading", label: "Contact heading", mode: "text" },
  { key: "contact_intro", label: "Contact intro", mode: "textarea" },
  { key: "faq_heading", label: "FAQ heading", mode: "text" },
];

type SimpleCard = {
  title: string;
  description: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type ContactGroup = {
  phone: string;
  email: string;
  address_line_1: string;
  address_line_2: string;
};

type SaveMode = "auto" | "manual";

function parseSimpleCards(value: unknown, fallback: SimpleCard[]): SimpleCard[] {
  if (!Array.isArray(value)) return fallback;
  const parsed = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Record<string, unknown>;
      return {
        title: typeof raw.title === "string" ? raw.title : "",
        description: typeof raw.description === "string" ? raw.description : "",
      };
    })
    .filter((item): item is SimpleCard => Boolean(item));
  return parsed.length ? parsed : fallback;
}

function parseFaqItems(value: unknown, fallback: FaqItem[]): FaqItem[] {
  if (!Array.isArray(value)) return fallback;
  const parsed = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Record<string, unknown>;
      return {
        question: typeof raw.question === "string" ? raw.question : "",
        answer: typeof raw.answer === "string" ? raw.answer : "",
      };
    })
    .filter((item): item is FaqItem => Boolean(item));
  return parsed.length ? parsed : fallback;
}

function parseContactGroup(value: unknown): ContactGroup {
  if (!value || typeof value !== "object") {
    return { phone: "", email: "", address_line_1: "", address_line_2: "" };
  }
  const raw = value as Record<string, unknown>;
  return {
    phone: typeof raw.phone === "string" ? raw.phone : "",
    email: typeof raw.email === "string" ? raw.email : "",
    address_line_1: typeof raw.address_line_1 === "string" ? raw.address_line_1 : "",
    address_line_2: typeof raw.address_line_2 === "string" ? raw.address_line_2 : "",
  };
}

const imageFields = [
  { key: "hero_image", label: "Hero background image" },
  { key: "site_logo_image", label: "Header logo image" },
  { key: "studio_image", label: "Studio image" },
  { key: "about_headshot_image", label: "About headshot image" },
] as const;

const requiredHomeSections: Array<{
  section_key: string;
  label: string;
  kind: string;
  sort_order: number;
  text_value: string | null;
}> = [
  {
    section_key: "about_support_blurb",
    label: "About support blurb",
    kind: "textarea",
    sort_order: 145,
    text_value: "If you would like to know more about one-to-one therapeutic support, you can explore the therapy page.",
  },
  {
    section_key: "about_support_cta_text",
    label: "About support button text",
    kind: "text",
    sort_order: 146,
    text_value: "Explore therapy",
  },
  {
    section_key: "about_support_cta_link",
    label: "About support button link",
    kind: "link",
    sort_order: 147,
    text_value: "/therapy",
  },
];

function serializeDraftState(params: {
  formValues: Record<string, string>;
  imageAltValues: Record<string, string>;
  bookingUrl: string;
  studioFeatureCards: SimpleCard[];
  practiceCards: SimpleCard[];
  faqItems: FaqItem[];
  contactGroup: ContactGroup;
  imagePaths: Record<string, string>;
}) {
  return JSON.stringify(params);
}

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
  const [studioFeatureCards, setStudioFeatureCards] = useState<SimpleCard[]>([
    { title: "", description: "" },
  ]);
  const [practiceCards, setPracticeCards] = useState<SimpleCard[]>([
    { title: "", description: "" },
  ]);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([{ question: "", answer: "" }]);
  const [contactGroup, setContactGroup] = useState<ContactGroup>({
    phone: "",
    email: "",
    address_line_1: "",
    address_line_2: "",
  });
  const [bookingUrl, setBookingUrl] = useState("");
  const [siteSettingsId, setSiteSettingsId] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("All changes saved.");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const editorPanelRef = useRef<HTMLFormElement | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInFlightRef = useRef(false);
  const queuedSaveRef = useRef(false);
  const lastSavedSnapshotRef = useRef("");
  const saveAllChangesRef = useRef<(mode: SaveMode) => Promise<void>>(async () => {});
  const sectionByKeyRef = useRef<Record<string, SectionRow>>({});
  sectionByKeyRef.current = sectionByKey;

  const fieldLabelByKey = useMemo(() => {
    const map: Record<string, string> = {};
    editableFields.forEach((field) => {
      map[field.key] = field.label;
    });
    map.studio_feature_cards = "Studio feature cards";
    map.practice_cards = "Practice cards";
    map.faq_items = "FAQ items";
    map.contact_group = "Contact details";
    imageFields.forEach((field) => {
      map[field.key] = field.label;
    });
    return map;
  }, []);

  function getImagePathDraft(source: Record<string, SectionRow>) {
    return Object.fromEntries(
      imageFields.map((field) => [field.key, source[field.key]?.image_path ?? ""]),
    );
  }

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

      const fetchSections = () =>
        supabase
          .from("page_sections")
          .select("id, section_key, label, kind, text_value, json_value, image_path, alt_text")
          .eq("page_id", page.id);

      let { data: sections, error: sectionsError } = await fetchSections();

      if (!isMounted) return;
      if (sectionsError) {
        setErrorMessage(sectionsError.message);
        setIsLoading(false);
        return;
      }

      const existingKeys = new Set((sections || []).map((section) => section.section_key));
      const missingSections = requiredHomeSections.filter((section) => !existingKeys.has(section.section_key));
      if (missingSections.length) {
        const { error: insertError } = await supabase.from("page_sections").insert(
          missingSections.map((section) => ({
            page_id: page.id,
            section_key: section.section_key,
            label: section.label,
            kind: section.kind,
            sort_order: section.sort_order,
            text_value: section.text_value,
            is_active: true,
            is_required: false,
          })),
        );

        if (!isMounted) return;
        if (insertError) {
          setErrorMessage(insertError.message);
          setIsLoading(false);
          return;
        }

        const refetchResult = await fetchSections();
        sections = refetchResult.data;
        sectionsError = refetchResult.error;

        if (!isMounted) return;
        if (sectionsError) {
          setErrorMessage(sectionsError.message);
          setIsLoading(false);
          return;
        }
      }

      const sectionMap: Record<string, SectionRow> = {};
      const values: Record<string, string> = {};
      const imageAltMap: Record<string, string> = {};
      let nextStudioCards: SimpleCard[] = [{ title: "", description: "" }];
      let nextPracticeCards: SimpleCard[] = [{ title: "", description: "" }];
      let nextFaqItems: FaqItem[] = [{ question: "", answer: "" }];
      let nextContactGroup: ContactGroup = {
        phone: "",
        email: "",
        address_line_1: "",
        address_line_2: "",
      };

      (sections || []).forEach((section) => {
        sectionMap[section.section_key] = section;
        values[section.section_key] = section.text_value ?? "";

        if (section.section_key === "studio_feature_cards") {
          nextStudioCards = parseSimpleCards(section.json_value, nextStudioCards);
        }
        if (section.section_key === "practice_cards") {
          nextPracticeCards = parseSimpleCards(section.json_value, nextPracticeCards);
        }
        if (section.section_key === "faq_items") {
          nextFaqItems = parseFaqItems(section.json_value, nextFaqItems);
        }
        if (section.section_key === "contact_group") {
          nextContactGroup = parseContactGroup(section.json_value);
        }

        imageAltMap[section.section_key] = section.alt_text ?? "";
      });

      const { data: settings } = await supabase.from("site_settings").select("id, booking_url").limit(1).maybeSingle();

      if (!isMounted) return;
      sectionByKeyRef.current = sectionMap;
      setSectionByKey(sectionMap);
      setFormValues(values);
      setImageAltValues(imageAltMap);
      setStudioFeatureCards(nextStudioCards);
      setPracticeCards(nextPracticeCards);
      setFaqItems(nextFaqItems);
      setContactGroup(nextContactGroup);
      setBookingUrl(settings?.booking_url ?? "");
      setSiteSettingsId(settings?.id ?? null);
      lastSavedSnapshotRef.current = serializeDraftState({
        formValues: values,
        imageAltValues: imageAltMap,
        bookingUrl: settings?.booking_url ?? "",
        studioFeatureCards: nextStudioCards,
        practiceCards: nextPracticeCards,
        faqItems: nextFaqItems,
        contactGroup: nextContactGroup,
        imagePaths: getImagePathDraft(sectionMap),
      });
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

  function updateStudioCard(index: number, field: keyof SimpleCard, value: string) {
    setStudioFeatureCards((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    );
  }

  function updatePracticeCard(index: number, field: keyof SimpleCard, value: string) {
    setPracticeCards((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    );
  }

  function updateFaqItem(index: number, field: keyof FaqItem, value: string) {
    setFaqItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    );
  }

  function updateContactField(field: keyof ContactGroup, value: string) {
    setContactGroup((current) => ({ ...current, [field]: value }));
  }

  function focusFieldFromPreview(fieldKey: string) {
    if (!fieldKey) return;
    setActiveFieldKey(fieldKey);
    const sectionEl = document.getElementById(`field-section-${fieldKey}`);
    const inputEl = sectionEl?.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea");

    const container = editorPanelRef.current;
    if (sectionEl && container) {
      const targetTop = sectionEl.offsetTop - container.clientHeight / 2 + sectionEl.clientHeight / 2;
      container.scrollTo({ top: Math.max(targetTop, 0), behavior: "smooth" });
    } else {
      sectionEl?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    inputEl?.focus({ preventScroll: true });
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

        const handleClick = (event: Event) => {
          event.preventDefault();
          event.stopPropagation();
          focusFieldFromPreview(firstKey);
        };
        const handleMouseEnter = () => {
          hintEl.textContent = `Editing: ${labelText}`;
          hintEl.style.display = "block";
        };
        const handleMouseLeave = () => {
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

  async function saveAllChanges(mode: SaveMode) {
    if (saveInFlightRef.current) {
      queuedSaveRef.current = true;
      return;
    }

    saveInFlightRef.current = true;
    setIsSaving(true);
    setErrorMessage("");
    if (mode === "auto") {
      setSaveMessage("Autosaving...");
    }

    try {
      for (const field of editableFields) {
        const section = sectionByKey[field.key];
        if (!section) continue;
        const { error } = await supabase
          .from("page_sections")
          .update({ text_value: formValues[field.key] ?? "" })
          .eq("id", section.id);

        if (error) throw new Error(error.message);
      }

      const jsonUpdates: Array<{ key: string; value: Json }> = [
        { key: "studio_feature_cards", value: studioFeatureCards },
        { key: "practice_cards", value: practiceCards },
        { key: "faq_items", value: faqItems },
        { key: "contact_group", value: contactGroup },
      ];

      for (const jsonUpdate of jsonUpdates) {
        const section = sectionByKey[jsonUpdate.key];
        if (!section) continue;

        const { error } = await supabase
          .from("page_sections")
          .update({ json_value: jsonUpdate.value })
          .eq("id", section.id);

        if (error) throw new Error(error.message);
      }

      let sectionsSnapshot: Record<string, SectionRow> = { ...sectionByKeyRef.current };

      for (const imageField of imageFields) {
        const section = sectionsSnapshot[imageField.key];
        if (!section) continue;

        const selectedFile = imageFileByKey[imageField.key];
        const nextAltText = imageAltValues[imageField.key] || null;
        let nextImagePath = section.image_path;
        const previousPath = section.image_path;

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
          previousPath &&
          !previousPath.startsWith("http://") &&
          !previousPath.startsWith("https://") &&
          previousPath !== nextImagePath
        ) {
          await supabase.storage.from("site-images").remove([previousPath]);
        }

        sectionsSnapshot = {
          ...sectionsSnapshot,
          [imageField.key]: {
            ...section,
            image_path: nextImagePath,
            alt_text: nextAltText,
          },
        };
      }

      sectionByKeyRef.current = sectionsSnapshot;
      setSectionByKey(sectionsSnapshot);

      if (siteSettingsId) {
        const { error } = await supabase
          .from("site_settings")
          .update({ booking_url: bookingUrl || null })
          .eq("id", siteSettingsId);
        if (error) throw new Error(error.message);
      }

      setSuccessMessage(mode === "manual" ? "Changes saved." : "");
      setSaveMessage(mode === "manual" ? "Saved." : "All changes saved.");
      setImageFileByKey({});
      lastSavedSnapshotRef.current = serializeDraftState({
        formValues,
        imageAltValues,
        bookingUrl,
        studioFeatureCards,
        practiceCards,
        faqItems,
        contactGroup,
        imagePaths: getImagePathDraft(sectionsSnapshot),
      });
      setPreviewKey((current) => current + 1);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save changes.";
      setErrorMessage(message);
      setSaveMessage("Autosave failed.");
    } finally {
      saveInFlightRef.current = false;
      setIsSaving(false);
      if (queuedSaveRef.current) {
        queuedSaveRef.current = false;
        void saveAllChanges("auto");
      }
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveAllChanges("manual");
  }

  useEffect(() => {
    saveAllChangesRef.current = saveAllChanges;
  });

  useEffect(() => {
    if (isLoading) return;

    const hasPendingFiles = Object.values(imageFileByKey).some(Boolean);
    const currentSnapshot = serializeDraftState({
      formValues,
      imageAltValues,
      bookingUrl,
      studioFeatureCards,
      practiceCards,
      faqItems,
      contactGroup,
      imagePaths: getImagePathDraft(sectionByKey),
    });
    const isDirty = hasPendingFiles || currentSnapshot !== lastSavedSnapshotRef.current;
    if (!isDirty) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      void saveAllChangesRef.current("auto");
    }, 900);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [
    isLoading,
    formValues,
    imageAltValues,
    bookingUrl,
    studioFeatureCards,
    practiceCards,
    faqItems,
    contactGroup,
    sectionByKey,
    imageFileByKey,
  ]);

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

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_30rem]">
        <section className="rounded-2xl bg-white p-3 shadow-sm">
          <iframe
            key={previewKey}
            ref={iframeRef}
            src="/?edit=1"
            title="Live public site preview"
            className="h-[78vh] w-full rounded-xl border border-black/10"
          />
        </section>

        <form
          ref={editorPanelRef}
          onSubmit={onSubmit}
          className="relative space-y-6 rounded-2xl bg-surface-low p-5 lg:h-[78vh] lg:overflow-y-auto"
        >
        {editableFields.map((field) => {
          const value = formValues[field.key] ?? "";
          const rows = field.mode === "textarea" ? 4 : 1;

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

        <section
          id="field-section-studio_feature_cards"
          className={`rounded-xl bg-white p-5 shadow-sm ${activeFieldKey === "studio_feature_cards" ? "ring-2 ring-primary/60" : ""}`}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Studio feature cards</p>
            <button
              type="button"
              onClick={() => setStudioFeatureCards((current) => [...current, { title: "", description: "" }])}
              className="rounded-md border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold"
            >
              Add card
            </button>
          </div>
          <div className="space-y-3">
            {studioFeatureCards.map((card, index) => (
              <div key={`studio-card-${index}`} className="rounded-lg border border-black/10 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/65">Card {index + 1}</p>
                  {studioFeatureCards.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setStudioFeatureCards((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                      className="text-xs font-semibold text-red-700 underline"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <input
                  value={card.title}
                  onChange={(event) => updateStudioCard(index, "title", event.target.value)}
                  placeholder="Feature title"
                  className="mb-2 w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
                />
                <textarea
                  value={card.description}
                  onChange={(event) => updateStudioCard(index, "description", event.target.value)}
                  rows={3}
                  placeholder="Feature description"
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
                />
              </div>
            ))}
          </div>
        </section>

        <section
          id="field-section-practice_cards"
          className={`rounded-xl bg-white p-5 shadow-sm ${activeFieldKey === "practice_cards" ? "ring-2 ring-primary/60" : ""}`}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Practice cards</p>
            <button
              type="button"
              onClick={() => setPracticeCards((current) => [...current, { title: "", description: "" }])}
              className="rounded-md border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold"
            >
              Add card
            </button>
          </div>
          <div className="space-y-3">
            {practiceCards.map((card, index) => (
              <div key={`practice-card-${index}`} className="rounded-lg border border-black/10 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/65">Card {index + 1}</p>
                  {practiceCards.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setPracticeCards((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                      className="text-xs font-semibold text-red-700 underline"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <input
                  value={card.title}
                  onChange={(event) => updatePracticeCard(index, "title", event.target.value)}
                  placeholder="Card title"
                  className="mb-2 w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
                />
                <textarea
                  value={card.description}
                  onChange={(event) => updatePracticeCard(index, "description", event.target.value)}
                  rows={3}
                  placeholder="Card description"
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
                />
              </div>
            ))}
          </div>
        </section>

        <section
          id="field-section-faq_items"
          className={`rounded-xl bg-white p-5 shadow-sm ${activeFieldKey === "faq_items" ? "ring-2 ring-primary/60" : ""}`}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">FAQ items</p>
            <button
              type="button"
              onClick={() => setFaqItems((current) => [...current, { question: "", answer: "" }])}
              className="rounded-md border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold"
            >
              Add FAQ
            </button>
          </div>
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <div key={`faq-item-${index}`} className="rounded-lg border border-black/10 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/65">FAQ {index + 1}</p>
                  {faqItems.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setFaqItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                      className="text-xs font-semibold text-red-700 underline"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <input
                  value={item.question}
                  onChange={(event) => updateFaqItem(index, "question", event.target.value)}
                  placeholder="Question"
                  className="mb-2 w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
                />
                <textarea
                  value={item.answer}
                  onChange={(event) => updateFaqItem(index, "answer", event.target.value)}
                  rows={3}
                  placeholder="Answer"
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
                />
              </div>
            ))}
          </div>
        </section>

        <section
          id="field-section-contact_group"
          className={`rounded-xl bg-white p-5 shadow-sm ${activeFieldKey === "contact_group" ? "ring-2 ring-primary/60" : ""}`}
        >
          <p className="mb-3 text-sm font-semibold">Contact details</p>
          <p className="mb-4 text-xs text-foreground/65">
            These fields appear in the contact section. No special formatting needed.
          </p>

          <label htmlFor="contact-group-phone" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">
            Phone
          </label>
          <input
            id="contact-group-phone"
            value={contactGroup.phone}
            onChange={(event) => updateContactField("phone", event.target.value)}
            placeholder="e.g. +44 7700 900123"
            className="mb-3 w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
          />

          <label htmlFor="contact-group-email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">
            Email
          </label>
          <input
            id="contact-group-email"
            value={contactGroup.email}
            onChange={(event) => updateContactField("email", event.target.value)}
            placeholder="e.g. hello@accessibleyogahut.com"
            className="mb-3 w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
          />

          <label htmlFor="contact-group-address-1" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">
            Address line 1
          </label>
          <input
            id="contact-group-address-1"
            value={contactGroup.address_line_1}
            onChange={(event) => updateContactField("address_line_1", event.target.value)}
            placeholder="e.g. Mill Hill"
            className="mb-3 w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
          />

          <label htmlFor="contact-group-address-2" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">
            Address line 2
          </label>
          <input
            id="contact-group-address-2"
            value={contactGroup.address_line_2}
            onChange={(event) => updateContactField("address_line_2", event.target.value)}
            placeholder="e.g. NW7, London"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
          />
        </section>

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
              <div className="mb-4 rounded-lg border border-dashed border-black/20 bg-surface-low p-4">
                <p className="text-sm font-medium text-foreground">Replace or add image</p>
                <p className="mt-1 text-xs text-foreground/65">
                  Pick a file from your computer. It is uploaded to the site when you click <strong>Save changes</strong> below.
                </p>
                <p className="mt-1 text-xs text-foreground/55">Formats: JPG, PNG, or WebP · max 5 MB</p>
                <input
                  id={`file-input-${field.key}`}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => updateImageFile(field.key, event.target.files?.[0] || null)}
                />
                <label
                  htmlFor={`file-input-${field.key}`}
                  className="mt-3 inline-flex cursor-pointer rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                >
                  Choose image file…
                </label>
                <p className="mt-3 text-xs text-foreground/75">
                  {imageFileByKey[field.key] ? (
                    <>
                      <span className="font-medium text-foreground">Selected:</span> {imageFileByKey[field.key]!.name}
                    </>
                  ) : (
                    <>No new file chosen — the current image above (if any) stays until you pick a file and save.</>
                  )}
                </p>
              </div>
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
        {!errorMessage ? <p className="text-xs text-foreground/60">{saveMessage}</p> : null}

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save now"}
        </button>
        </form>
      </div>
    </main>
  );
}
