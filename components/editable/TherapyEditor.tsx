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
  image_path: string | null;
  alt_text: string | null;
};

type EditableField = {
  key: string;
  label: string;
  mode: "text" | "textarea";
};

const editableFields: EditableField[] = [
  { key: "therapy_heading", label: "Therapy heading", mode: "text" },
  { key: "therapy_body_primary", label: "Therapy body (paragraph 1)", mode: "textarea" },
  { key: "therapy_body_secondary", label: "Therapy body (paragraph 2)", mode: "textarea" },
];

const requiredSections: Array<{
  section_key: string;
  label: string;
  kind: string;
  sort_order: number;
  text_value?: string | null;
}> = [
  { section_key: "therapy_heading", label: "Therapy heading", kind: "text", sort_order: 10, text_value: "Therapy Support" },
  {
    section_key: "therapy_body_primary",
    label: "Therapy body (paragraph 1)",
    kind: "textarea",
    sort_order: 20,
    text_value:
      "I offer compassionate, person-centred therapy sessions that combine clinical experience with practical strategies for everyday life.",
  },
  {
    section_key: "therapy_body_secondary",
    label: "Therapy body (paragraph 2)",
    kind: "textarea",
    sort_order: 30,
    text_value:
      "Sessions are tailored to your goals and pace, with a calm, supportive approach designed to help you build confidence and resilience.",
  },
  { section_key: "therapy_image", label: "Therapy image", kind: "image", sort_order: 40 },
];

const imageField = { key: "therapy_image", label: "Therapy image" } as const;

function serializeDraftState(params: {
  formValues: Record<string, string>;
  imageAltValues: Record<string, string>;
  imagePath: string;
  hasPendingFile: boolean;
}) {
  return JSON.stringify(params);
}

export function TherapyEditor() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sectionByKey, setSectionByKey] = useState<Record<string, SectionRow>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [imageAltValues, setImageAltValues] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("All changes saved.");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const editorPanelRef = useRef<HTMLFormElement | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInFlightRef = useRef(false);
  const queuedSaveRef = useRef(false);
  const lastSavedSnapshotRef = useRef("");
  const saveAllChangesRef = useRef<(mode: "auto" | "manual") => Promise<void>>(async () => {});
  const sectionByKeyRef = useRef<Record<string, SectionRow>>({});
  sectionByKeyRef.current = sectionByKey;

  const fieldLabelByKey = useMemo(() => {
    const map: Record<string, string> = {};
    editableFields.forEach((field) => {
      map[field.key] = field.label;
    });
    map[imageField.key] = imageField.label;
    return map;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setErrorMessage("");

      let pageId: string | null = null;
      const { data: page, error: pageError } = await supabase.from("pages").select("id").eq("slug", "therapy").maybeSingle();

      if (pageError) {
        setErrorMessage(pageError.message);
        setIsLoading(false);
        return;
      }

      if (!page) {
        const { data: insertedPage, error: insertPageError } = await supabase
          .from("pages")
          .insert({
            slug: "therapy",
            title: "Therapy",
            seo_title: "Therapy | Accessible Yoga Hut",
            seo_description: "Therapy support from Accessible Yoga Hut.",
          })
          .select("id")
          .single();

        if (insertPageError || !insertedPage) {
          setErrorMessage(insertPageError?.message || "Unable to create therapy page.");
          setIsLoading(false);
          return;
        }
        pageId = insertedPage.id;
      } else {
        pageId = page.id;
      }

      const { data: sections, error: sectionsError } = await supabase
        .from("page_sections")
        .select("id, section_key, label, kind, text_value, image_path, alt_text")
        .eq("page_id", pageId);

      if (sectionsError) {
        setErrorMessage(sectionsError.message);
        setIsLoading(false);
        return;
      }

      const existingKeys = new Set((sections ?? []).map((section) => section.section_key));
      const missing = requiredSections.filter((section) => !existingKeys.has(section.section_key));

      if (missing.length) {
        const { error: insertSectionsError } = await supabase.from("page_sections").insert(
          missing.map((section) => ({
            page_id: pageId as string,
            section_key: section.section_key,
            label: section.label,
            kind: section.kind,
            sort_order: section.sort_order,
            text_value: section.text_value ?? null,
            is_active: true,
            is_required: true,
          })),
        );

        if (insertSectionsError) {
          setErrorMessage(insertSectionsError.message);
          setIsLoading(false);
          return;
        }
      }

      const { data: finalSections, error: finalSectionsError } = await supabase
        .from("page_sections")
        .select("id, section_key, label, kind, text_value, image_path, alt_text")
        .eq("page_id", pageId);

      if (!isMounted) return;
      if (finalSectionsError) {
        setErrorMessage(finalSectionsError.message);
        setIsLoading(false);
        return;
      }

      const sectionMap: Record<string, SectionRow> = {};
      const values: Record<string, string> = {};
      const imageAltMap: Record<string, string> = {};

      (finalSections || []).forEach((section) => {
        sectionMap[section.section_key] = section;
        values[section.section_key] = section.text_value ?? "";
        imageAltMap[section.section_key] = section.alt_text ?? "";
      });

      sectionByKeyRef.current = sectionMap;
      setSectionByKey(sectionMap);
      setFormValues(values);
      setImageAltValues(imageAltMap);
      lastSavedSnapshotRef.current = serializeDraftState({
        formValues: values,
        imageAltValues: imageAltMap,
        imagePath: sectionMap[imageField.key]?.image_path ?? "",
        hasPendingFile: false,
      });
      setIsLoading(false);
    }

    void loadData();
    return () => {
      isMounted = false;
    };
  }, [supabase]);

  function focusFieldFromPreview(fieldKey: string) {
    if (!fieldKey) return;
    setActiveFieldKey(fieldKey);
    const sectionEl = document.getElementById(`therapy-field-section-${fieldKey}`);
    const inputEl = sectionEl?.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea");

    const container = editorPanelRef.current;
    if (sectionEl && container) {
      const targetTop = sectionEl.offsetTop - container.clientHeight / 2 + sectionEl.clientHeight / 2;
      container.scrollTo({ top: Math.max(targetTop, 0), behavior: "smooth" });
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
      if (!doc?.body) return;

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
      doc.body.appendChild(hintEl);
      cleanupFns.push(() => hintEl.remove());

      const targets = doc.querySelectorAll<HTMLElement>("[data-edit-target]");
      targets.forEach((target) => {
        const keyString = target.getAttribute("data-edit-target");
        if (!keyString) return;
        const firstKey = keyString.split(",").map((key) => key.trim()).filter(Boolean)[0];
        if (!firstKey) return;
        const labelText = fieldLabelByKey[firstKey] || firstKey;

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
  }, [previewKey, fieldLabelByKey]);

  async function saveAllChanges(mode: "auto" | "manual") {
    if (saveInFlightRef.current) {
      queuedSaveRef.current = true;
      return;
    }
    saveInFlightRef.current = true;
    setIsSaving(true);
    setErrorMessage("");
    if (mode === "auto") setSaveMessage("Autosaving...");

    try {
      for (const field of editableFields) {
        const section = sectionByKeyRef.current[field.key];
        if (!section) continue;
        const { error } = await supabase
          .from("page_sections")
          .update({ text_value: formValues[field.key] ?? "" })
          .eq("id", section.id);
        if (error) throw new Error(error.message);
      }

      const imageSection = sectionByKeyRef.current[imageField.key];
      if (imageSection) {
        const nextAltText = imageAltValues[imageField.key] || null;
        let nextImagePath = imageSection.image_path;
        const previousPath = imageSection.image_path;

        if (imageFile) {
          if (!["image/jpeg", "image/png", "image/webp"].includes(imageFile.type)) {
            throw new Error("Therapy image: only JPG, PNG, or WEBP is allowed.");
          }
          if (imageFile.size > 5 * 1024 * 1024) {
            throw new Error("Therapy image: max upload size is 5MB.");
          }
          const ext = imageFile.name.includes(".") ? imageFile.name.split(".").pop()?.toLowerCase() || "jpg" : "jpg";
          const uploadPath = `therapy/${Date.now()}.${ext}`;
          const { error: uploadError } = await supabase.storage.from("site-images").upload(uploadPath, imageFile, { upsert: false });
          if (uploadError) throw new Error(uploadError.message);
          nextImagePath = uploadPath;
        }

        const { error: imageUpdateError } = await supabase
          .from("page_sections")
          .update({ image_path: nextImagePath, alt_text: nextAltText })
          .eq("id", imageSection.id);
        if (imageUpdateError) throw new Error(imageUpdateError.message);

        if (
          imageFile &&
          previousPath &&
          !previousPath.startsWith("http://") &&
          !previousPath.startsWith("https://") &&
          previousPath !== nextImagePath
        ) {
          await supabase.storage.from("site-images").remove([previousPath]);
        }

        const nextSections = {
          ...sectionByKeyRef.current,
          [imageField.key]: { ...imageSection, image_path: nextImagePath, alt_text: nextAltText },
        };
        sectionByKeyRef.current = nextSections;
        setSectionByKey(nextSections);
      }

      setImageFile(null);
      setSuccessMessage(mode === "manual" ? "Changes saved." : "");
      setSaveMessage(mode === "manual" ? "Saved." : "All changes saved.");
      lastSavedSnapshotRef.current = serializeDraftState({
        formValues,
        imageAltValues,
        imagePath: sectionByKeyRef.current[imageField.key]?.image_path ?? "",
        hasPendingFile: false,
      });
      setPreviewKey((current) => current + 1);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save changes.");
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

  useEffect(() => {
    saveAllChangesRef.current = saveAllChanges;
  });

  useEffect(() => {
    if (isLoading) return;
    const currentSnapshot = serializeDraftState({
      formValues,
      imageAltValues,
      imagePath: sectionByKeyRef.current[imageField.key]?.image_path ?? "",
      hasPendingFile: Boolean(imageFile),
    });
    const isDirty = currentSnapshot !== lastSavedSnapshotRef.current;
    if (!isDirty) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void saveAllChangesRef.current("auto");
    }, 900);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [isLoading, formValues, imageAltValues, imageFile]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveAllChanges("manual");
  }

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <p className="text-sm text-foreground/70">Loading editable regions...</p>
      </main>
    );
  }

  const imageSection = sectionByKey[imageField.key];
  const currentPath = imageSection?.image_path || "";
  const currentUrl = currentPath
    ? currentPath.startsWith("http://") || currentPath.startsWith("https://")
      ? currentPath
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-images/${currentPath}`
    : "";

  return (
    <main className="mx-auto w-full max-w-[95rem] px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-headline text-4xl text-primary">Edit Therapy Content</h1>
          <p className="mt-2 text-sm text-foreground/75">Visual preview on the left, fixed-content editor on the right.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewKey((current) => current + 1)}
            className="rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-medium"
          >
            Refresh preview
          </button>
          <Link href="/therapy" target="_blank" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
            Open public page
          </Link>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_30rem]">
        <section className="rounded-2xl bg-white p-3 shadow-sm">
          <iframe
            key={previewKey}
            ref={iframeRef}
            src="/therapy?edit=1"
            title="Live therapy page preview"
            className="h-[78vh] w-full rounded-xl border border-black/10"
          />
        </section>

        <form ref={editorPanelRef} onSubmit={onSubmit} className="relative space-y-6 rounded-2xl bg-surface-low p-5 lg:h-[78vh] lg:overflow-y-auto">
          {editableFields.map((field) => {
            const value = formValues[field.key] ?? "";
            return (
              <section
                id={`therapy-field-section-${field.key}`}
                key={field.key}
                className={`rounded-xl bg-white p-5 shadow-sm ${activeFieldKey === field.key ? "ring-2 ring-primary/60" : ""}`}
              >
                <label htmlFor={`therapy-${field.key}`} className="mb-2 block text-sm font-semibold">
                  {field.label}
                </label>
                {field.mode === "text" ? (
                  <input
                    id={`therapy-${field.key}`}
                    value={value}
                    onChange={(event) => setFormValues((current) => ({ ...current, [field.key]: event.target.value }))}
                    className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
                  />
                ) : (
                  <textarea
                    id={`therapy-${field.key}`}
                    rows={5}
                    value={value}
                    onChange={(event) => setFormValues((current) => ({ ...current, [field.key]: event.target.value }))}
                    className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
                  />
                )}
              </section>
            );
          })}

          <section
            id={`therapy-field-section-${imageField.key}`}
            className={`rounded-xl bg-white p-5 shadow-sm ${activeFieldKey === imageField.key ? "ring-2 ring-primary/60" : ""}`}
          >
            <p className="mb-2 text-sm font-semibold">{imageField.label}</p>
            <p className="mb-2 text-xs text-foreground/70">Current path: {currentPath || "not set"}</p>
            {currentUrl ? (
              <Image src={currentUrl} alt={imageAltValues[imageField.key] || "Therapy image"} width={960} height={400} className="mb-3 h-40 w-full rounded-md object-cover" />
            ) : null}
            <div className="mb-4 rounded-lg border border-dashed border-black/20 bg-surface-low p-4">
              <p className="text-sm font-medium text-foreground">Replace or add image</p>
              <p className="mt-1 text-xs text-foreground/65">Pick a file from your computer. It is uploaded on save.</p>
              <input
                id="therapy-image-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => setImageFile(event.target.files?.[0] || null)}
              />
              <label htmlFor="therapy-image-file" className="mt-3 inline-flex cursor-pointer rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white">
                Choose image file...
              </label>
              <p className="mt-3 text-xs text-foreground/75">
                {imageFile ? (
                  <>
                    <span className="font-medium text-foreground">Selected:</span> {imageFile.name}
                  </>
                ) : (
                  "No new file chosen."
                )}
              </p>
            </div>
            <label htmlFor="therapy-image-alt" className="mb-2 block text-sm font-semibold">
              Alt text
            </label>
            <input
              id="therapy-image-alt"
              value={imageAltValues[imageField.key] ?? ""}
              onChange={(event) => setImageAltValues((current) => ({ ...current, [imageField.key]: event.target.value }))}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
            />
          </section>

          {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}
          {successMessage ? <p className="text-sm text-emerald-700">{successMessage}</p> : null}
          {!errorMessage ? <p className="text-xs text-foreground/60">{saveMessage}</p> : null}

          <button type="submit" disabled={isSaving} className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {isSaving ? "Saving..." : "Save now"}
          </button>
        </form>
      </div>
    </main>
  );
}
