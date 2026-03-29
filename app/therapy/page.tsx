import Image from "next/image";
import { getHomePageContent, getTherapyPageContent } from "@/lib/content/queries";

type TherapyPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readText(
  sections: Awaited<ReturnType<typeof getTherapyPageContent>>["sections"],
  key: string,
  fallback = "",
) {
  return sections[key]?.textValue?.trim() || fallback;
}

export default async function TherapyPage({ searchParams }: TherapyPageProps) {
  const params = (await searchParams) ?? {};
  const isEditPreview = params.edit === "1";
  const content = await getTherapyPageContent();
  const homeContent = await getHomePageContent();
  const { sections, settings } = content;

  const therapyImage =
    sections.therapy_image?.imagePath ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDP2_-yLVLrPBa0ks12Sv3gKzOMQt1pMGlaHlaRuF3BO4jR51mNHlmaZCkZOrPUx28wlxzVTXfdnmwNLzxk28xazToQSUE0QLA0Gxy-TwZuL2P1hLzTrReR2G_KCP4yWDVNtPROdQ-U4PYj1tho4Brv9VwMPG5C-lxO-wXS2yk6hPFoKR0bsZWJKr4XU40naw-xFcBDX0fuiFTl5eQ75NewXvP6gFy2HAnWKi5lMu0qXO_XPX_G91p5r4XZufjE7DMgUpWR6rNJng";
  const siteLogoImage = homeContent.sections.site_logo_image?.imagePath || "/header-logo.png?v=2";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isEditPreview ? (
        <style>{`
          [data-edit-target] {
            cursor: pointer;
          }
          [data-edit-target]:hover {
            outline: 2px solid rgba(75, 99, 90, 0.55);
          }
        `}</style>
      ) : null}
      <header className="fixed top-0 z-50 w-full bg-[#f2f0ec] shadow-sm shadow-emerald-900/5 backdrop-blur-md">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between bg-[#f2f0ec] px-6 py-5">
          <a href="/" className="flex items-center" aria-label="Accessible Yoga Hut home">
            <span className="relative block h-14 w-[120px] shrink-0 overflow-hidden">
              <Image src={siteLogoImage} alt="Site logo" fill sizes="120px" className="h-full w-full object-contain" />
            </span>
          </a>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="rounded-md border border-primary/30 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary underline underline-offset-4 hover:bg-primary/5"
            >
              Accessible yoga
            </a>
            <a
              href={settings.bookingUrl || "/#schedule"}
              className="rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            >
              Book now
            </a>
          </div>
        </nav>
      </header>

      <main className="pt-24">
        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 md:grid-cols-12">
          <div className="md:col-span-7">
            <h1
              data-edit-target="therapy_heading"
              className="font-headline text-5xl leading-tight text-primary md:text-6xl"
            >
              {readText(sections, "therapy_heading", "Therapy Support")}
            </h1>
            <p data-edit-target="therapy_body_primary" className="mt-8 whitespace-pre-line text-lg leading-relaxed text-foreground/80">
              {readText(
                sections,
                "therapy_body_primary",
                "I offer compassionate, person-centred therapy sessions that combine clinical experience with practical strategies for everyday life.",
              )}
            </p>
            <p data-edit-target="therapy_body_secondary" className="mt-6 whitespace-pre-line text-lg leading-relaxed text-foreground/80">
              {readText(
                sections,
                "therapy_body_secondary",
                "Sessions are tailored to your goals and pace, with a calm, supportive approach designed to help you build confidence and resilience.",
              )}
            </p>
          </div>
          <div className="md:col-span-5">
            <div data-edit-target="therapy_image" className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-surface-high">
              <Image
                src={therapyImage}
                alt={sections.therapy_image?.altText || "Therapy session portrait"}
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
