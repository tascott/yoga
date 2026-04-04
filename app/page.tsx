import { ContactForm } from "@/components/ContactForm";
import { AcuityScheduleEmbed } from "@/components/AcuityScheduleEmbed";
import { resolveAcuityIframeSrc } from "@/lib/acuity";
import { getHomePageContent, getHomePageContentFresh } from "@/lib/content/queries";
import Image from "next/image";

type BasicCard = {
  title: string;
  description: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readText(
  sections: Awaited<ReturnType<typeof getHomePageContent>>["sections"],
  key: string,
  fallback = "",
) {
  return sections[key]?.textValue?.trim() || fallback;
}

function readJsonArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function readJsonObject(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const raw = value as Record<string, unknown>;
  return Object.fromEntries(
    Object.entries(raw).map(([key, val]) => [key, typeof val === "string" ? val : ""]),
  );
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = (await searchParams) ?? {};
  const isEditPreview = params.edit === "1";
  const currentYear = new Date().getFullYear();
  const content = isEditPreview ? await getHomePageContentFresh() : await getHomePageContent();
  const { sections, settings } = content;
  const homeAcuitySrc = resolveAcuityIframeSrc(settings.acuityIframeSrc);

  const navItems = [
    { href: "#about", label: "About" },
    { href: "#practice", label: "Practice" },
    { href: "#schedule", label: "Schedule" },
    { href: "#contact", label: "Contact" },
    { href: "#faq", label: "FAQ" },
    { href: "/therapy", label: "Therapy" },
  ];
  const featureCards = readJsonArray<BasicCard>(sections.studio_feature_cards?.jsonValue);
  const practiceCards = readJsonArray<BasicCard>(sections.practice_cards?.jsonValue);
  const faqItems = readJsonArray<FaqItem>(sections.faq_items?.jsonValue);
  const contactGroup = readJsonObject(sections.contact_group?.jsonValue);
  const siteLogoImage = sections.site_logo_image?.imagePath || "/header-logo.png?v=2";
  const studioImage =
    sections.studio_image?.imagePath ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDdZboxgcbURHnrsqPthHz4Gd2wy_oDv0ULJ4KIs4me4Ciedc-vO6V8odvXDm_VWQxRv6RvgwAXbYuR5QV1y-u6OybPOqtPPs6GiZWgwkB46weomSiq8mq5RBtGJuta3KKRrr9X_9KBTYdSlXYSn5hERbMQ-u3LJdMUrMk1ENX2I-Jp0zmSKlUshHVsiAGjC5YnbPwjZr68Ir6WOIUPw8NrkAFpBxHn214feoKPPQNlt22oMre37QzgwOs8tLDuk7jGu19Yv4BsQw";
  const heroImage =
    sections.hero_image?.imagePath ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCNWAO3KhL-GFV2PV7Sihcp0X5YLK_5wSDIpphk7bGFN88T48M5ymcHBYIH3iWqgcb9mFP8phyJphyRSJwA3CKdG9LQpMq_3EbOevyoUoUMwF5_KZjt8XtOrT8bIKtmrxZc6XM3YwdWjkjnWVmiUPVs0-RmKKVId3zAMrOHGMN-4fjEaIbuby9eIpR8VvDvfo9Qoo12bbReL9vaLqdcHqL-qlOjC1lI6_Bh0I4C4PFFKNS7FHcWwliKa51K7Sss5mHc08RRhoGjaw";
  const aboutImage =
    sections.about_headshot_image?.imagePath ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDP2_-yLVLrPBa0ks12Sv3gKzOMQt1pMGlaHlaRuF3BO4jR51mNHlmaZCkZOrPUx28wlxzVTXfdnmwNLzxk28xazToQSUE0QLA0Gxy-TwZuL2P1hLzTrReR2G_KCP4yWDVNtPROdQ-U4PYj1tho4Brv9VwMPG5C-lxO-wXS2yk6hPFoKR0bsZWJKr4XU40naw-xFcBDX0fuiFTl5eQ75NewXvP6gFy2HAnWKi5lMu0qXO_XPX_G91p5r4XZufjE7DMgUpWR6rNJng";
  const sanctuaryImage = sections.sanctuary_image?.imagePath ?? null;
  const hasSanctuarySocials =
    Boolean(settings.instagramUrl?.trim()) ||
    Boolean(settings.facebookUrl?.trim()) ||
    Boolean(settings.linkedinUrl?.trim());

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isEditPreview ? (
        <div className="fixed bottom-4 right-4 z-[60] rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg">
          Edit Preview
        </div>
      ) : null}
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
          <a href="#" className="flex items-center" aria-label="Accessible Yoga Hut home">
            <span
              data-edit-target="site_logo_image"
              className="relative block h-14 w-[120px] shrink-0 overflow-hidden"
            >
              <Image
                src={siteLogoImage}
                alt={sections.site_logo_image?.altText || "Site logo"}
                fill
                sizes="120px"
                className="h-full w-full object-contain"
              />
            </span>
          </a>
          <ul className="hidden items-center gap-6 lg:flex xl:gap-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-xs uppercase tracking-[0.24em] text-foreground/65 transition-colors hover:text-primary"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#schedule"
            className="ml-4 hidden shrink-0 whitespace-nowrap rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary-container lg:inline-flex"
          >
            Book now
          </a>
          <details className="relative lg:hidden">
            <summary className="list-none rounded-md border border-black/10 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80">
              Menu
            </summary>
            <div className="absolute right-0 top-[calc(100%+0.5rem)] w-56 rounded-xl border border-black/10 bg-[#f2f0ec] p-3 shadow-lg">
              <div className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <a
                    key={`mobile-${item.href}`}
                    href={item.href}
                    className="rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/75 transition-colors hover:bg-white hover:text-primary"
                  >
                    {item.label}
                  </a>
                ))}
                <a
                  href="#schedule"
                  className="mt-2 rounded-md bg-primary px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white"
                >
                  Book now
                </a>
              </div>
            </div>
          </details>
        </nav>
      </header>

      <main>
        <section
          id="hero"
          data-edit-target="hero_heading,hero_tagline_1,hero_tagline_2,hero_subheading,hero_primary_cta_text,hero_primary_cta_link,hero_image"
          className={`relative flex min-h-screen items-center overflow-hidden pt-20 ${
            isEditPreview ? "outline outline-2 outline-transparent transition hover:outline-primary/40" : ""
          }`}
        >
          <div data-edit-target="hero_image" className="absolute inset-0">
            <Image
              src={heroImage}
              alt={sections.hero_image?.altText || "Calm yoga studio with soft morning light"}
              fill
              priority
              sizes="100vw"
              className="h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          </div>
          <div className="relative mx-auto w-full max-w-7xl px-6">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.32em] text-secondary">Welcome to the Hut</p>
            <h1
              data-edit-target="hero_heading"
              className="font-headline max-w-4xl text-5xl leading-[1.08] text-primary md:text-7xl lg:text-8xl"
            >
              {readText(sections, "hero_heading", "Yoga for Everyone, Wherever You Are.")}
            </h1>
            {readText(sections, "hero_tagline_1", "Inclusive, accessible yoga").trim() ||
            readText(sections, "hero_tagline_2", "Mill Hill studio · Online classes").trim() ? (
              <div
                className="mt-6 max-w-3xl space-y-1 border-l-4 border-secondary/50 pl-5"
                data-edit-target="hero_tagline_1,hero_tagline_2"
              >
                {readText(sections, "hero_tagline_1", "Inclusive, accessible yoga").trim() ? (
                  <p className="font-headline text-xl font-medium tracking-wide text-primary md:text-2xl">
                    {readText(sections, "hero_tagline_1", "Inclusive, accessible yoga")}
                  </p>
                ) : null}
                {readText(sections, "hero_tagline_2", "Mill Hill studio · Online classes").trim() ? (
                  <p className="font-headline text-xl font-medium tracking-wide text-primary/85 md:text-2xl">
                    {readText(sections, "hero_tagline_2", "Mill Hill studio · Online classes")}
                  </p>
                ) : null}
              </div>
            ) : null}
            <p data-edit-target="hero_subheading" className="mt-8 max-w-2xl text-xl leading-relaxed text-foreground/80">
              {readText(
                sections,
                "hero_subheading",
                "Accessible, inclusive, and safe yoga in Mill Hill, London, and online.",
              )}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                data-edit-target="hero_primary_cta_text,hero_primary_cta_link"
                href={settings.bookingUrl || readText(sections, "hero_primary_cta_link", "#schedule")}
                className="rounded-xl bg-secondary px-7 py-4 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                {readText(sections, "hero_primary_cta_text", "Book Your First Class")}
              </a>
              <a href="#schedule" className="border-b-2 border-secondary px-4 py-4 text-sm font-bold text-primary">
                View Schedule
              </a>
            </div>
          </div>
        </section>

        <section className="bg-surface-low py-24">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="font-headline text-4xl italic leading-tight text-primary md:text-6xl">
              &quot;Yoga allows you to find a new kind of freedom that you may not have known even existed.&quot;
            </h2>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-secondary">— B.K.S. Iyengar</p>
          </div>
        </section>

        {readText(sections, "spotlight_heading").trim() || readText(sections, "spotlight_body").trim() ? (
          <section
            id="spotlight"
            data-edit-target="spotlight_kicker,spotlight_heading,spotlight_subheading,spotlight_body,spotlight_cta_text,spotlight_cta_link"
            className={`border-y border-primary/15 bg-[#eae6df] py-16 md:py-24 ${
              isEditPreview ? "outline outline-2 outline-transparent transition hover:outline-primary/40" : ""
            }`}
          >
            <div className="mx-auto max-w-7xl px-6">
              {readText(sections, "spotlight_kicker").trim() ? (
                <p
                  data-edit-target="spotlight_kicker"
                  className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary"
                >
                  {readText(sections, "spotlight_kicker")}
                </p>
              ) : null}
              <h2
                data-edit-target="spotlight_heading"
                className="mt-2 font-headline text-3xl leading-tight text-primary md:text-5xl"
              >
                {readText(sections, "spotlight_heading")}
              </h2>
              {readText(sections, "spotlight_subheading").trim() ? (
                <p
                  data-edit-target="spotlight_subheading"
                  className="mt-3 font-headline text-xl text-primary/90 md:text-2xl"
                >
                  {readText(sections, "spotlight_subheading")}
                </p>
              ) : null}
              {readText(sections, "spotlight_body").trim() ? (
                <p
                  data-edit-target="spotlight_body"
                  className="mt-6 max-w-3xl whitespace-pre-line text-lg leading-relaxed text-foreground/80"
                >
                  {readText(sections, "spotlight_body")}
                </p>
              ) : null}
              {readText(sections, "spotlight_cta_text").trim() ? (
                <a
                  data-edit-target="spotlight_cta_text,spotlight_cta_link"
                  href={
                    readText(sections, "spotlight_cta_link").trim() ||
                    settings.bookingUrl ||
                    "#schedule"
                  }
                  className="mt-8 inline-flex rounded-xl bg-secondary px-8 py-4 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {readText(sections, "spotlight_cta_text")}
                </a>
              ) : null}
            </div>
          </section>
        ) : null}

        <section
          data-edit-target="studio_heading,studio_body,studio_feature_cards,studio_image"
          className={`mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-28 md:grid-cols-12 ${
            isEditPreview ? "outline outline-2 outline-transparent transition hover:outline-primary/40" : ""
          }`}
        >
          <div className="relative md:col-span-5">
            <div
              data-edit-target="studio_image"
              className="aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-surface-high"
            >
              <div className="relative h-full w-full">
                <Image
                  src={studioImage}
                  alt={sections.studio_image?.altText || "Yoga studio portrait"}
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 h-20 w-20 rounded-full bg-secondary/15" />
          </div>
          <div className="md:col-span-7 md:pl-8">
            <h2 data-edit-target="studio_heading" className="font-headline text-4xl leading-tight text-primary md:text-5xl">
              {readText(sections, "studio_heading", "The Mill Hill Studio: A Boutique Sanctuary")}
            </h2>
            <p data-edit-target="studio_body" className="mt-7 whitespace-pre-line text-lg leading-relaxed text-foreground/80">
              {readText(sections, "studio_body")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {featureCards.map((card, index) => (
                <span
                  data-edit-target="studio_feature_cards"
                  key={`${card.title}-${index}`}
                  className="rounded-full bg-[#ede1d4] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#201b13]"
                >
                  {card.title}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section
          id="about"
          data-edit-target="about_heading,about_body_primary,about_body_secondary,about_support_blurb,about_support_cta_text,about_support_cta_link,about_headshot_image"
          className={`scroll-mt-28 bg-[#dcdad5] py-28 ${
            isEditPreview ? "outline outline-2 outline-transparent transition hover:outline-primary/40" : ""
          }`}
        >
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-6 md:grid-cols-5">
            <div className="md:col-span-3">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-secondary">The Journey</p>
              <h2 data-edit-target="about_heading" className="font-headline text-5xl italic text-foreground md:text-6xl">
                {readText(sections, "about_heading", "Meet Karen")}
              </h2>
              <p data-edit-target="about_body_primary" className="mt-8 whitespace-pre-line leading-relaxed text-foreground/80">
                {readText(sections, "about_body_primary", "About copy is being prepared.")}
              </p>
              <p data-edit-target="about_body_secondary" className="mt-6 whitespace-pre-line leading-relaxed text-foreground/80">
                {readText(sections, "about_body_secondary")}
              </p>
              <p data-edit-target="about_support_blurb" className="mt-7 max-w-xl text-sm leading-relaxed text-foreground/75">
                {readText(
                  sections,
                  "about_support_blurb",
                  "If you would like to know more about one-to-one therapeutic support, you can explore the therapy page.",
                )}
              </p>
              <a
                data-edit-target="about_support_cta_text,about_support_cta_link"
                href={readText(sections, "about_support_cta_link", "/therapy")}
                className="mt-4 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-container"
              >
                {readText(sections, "about_support_cta_text", "Explore therapy")}
              </a>
            </div>
            <div className="md:col-span-2">
              <div
                data-edit-target="about_headshot_image"
                className="sticky top-30 rotate-2 overflow-hidden rounded-[1.5rem] shadow-2xl"
              >
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src={aboutImage}
                    alt={sections.about_headshot_image?.altText || "Portrait of Karen"}
                    fill
                    sizes="(min-width: 768px) 30vw, 100vw"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="practice"
          data-edit-target="practice_heading,practice_cards"
          className={`mx-auto max-w-7xl px-6 py-28 ${
            isEditPreview ? "outline outline-2 outline-transparent transition hover:outline-primary/40" : ""
          }`}
        >
          <div className="mb-16 text-center">
            <h2 data-edit-target="practice_heading" className="font-headline text-5xl text-primary">
              {readText(sections, "practice_heading", "How to Practice")}
            </h2>
            <div className="mx-auto mt-4 h-1 w-24 bg-secondary/30" />
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {practiceCards.map((card, index) => (
              <article
                data-edit-target="practice_cards"
                key={`${card.title}-${index}`}
                className="rounded-[1.5rem] bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <h3 className="font-headline text-3xl">{card.title}</h3>
                <p className="mt-4 leading-relaxed text-foreground/80">{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="schedule"
          data-edit-target="schedule_heading,schedule_intro,schedule_sidebar_heading,schedule_sidebar_text"
          className={`scroll-mt-28 bg-surface-low py-28 ${
            isEditPreview ? "outline outline-2 outline-transparent transition hover:outline-primary/40" : ""
          }`}
        >
          <div className="mx-auto max-w-7xl px-6">
            <h2 data-edit-target="schedule_heading" className="font-headline text-5xl text-primary">
              {readText(sections, "schedule_heading", "Class Schedule")}
            </h2>
            <p data-edit-target="schedule_intro" className="mt-4 max-w-2xl text-foreground/80">
              {readText(sections, "schedule_intro", "Find a time that works for you. Book your studio or online session.")}
            </p>
            <div className="mt-10 overflow-hidden rounded-[1.5rem] border border-outline/40 bg-white shadow-xl">
              <div className="grid gap-0 md:grid-cols-[minmax(0,20rem)_1fr]">
                <aside className="bg-surface-container p-8">
                  <h3 data-edit-target="schedule_sidebar_heading" className="font-headline text-2xl">
                    {readText(sections, "schedule_sidebar_heading", "Booking")}
                  </h3>
                  <p
                    data-edit-target="schedule_sidebar_text"
                    className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/75"
                  >
                    {readText(
                      sections,
                      "schedule_sidebar_text",
                      "Use the scheduler to choose a class or session. Each listing has its own book button.",
                    )}
                  </p>
                </aside>
                <div className="min-h-[480px] bg-white md:min-h-[800px]">
                  <AcuityScheduleEmbed src={homeAcuitySrc} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background py-24">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="font-headline text-4xl italic leading-tight text-primary md:text-6xl">
              &quot;Yoga is a light, which once lit, will never dim. The better your practice, the brighter the flame.&quot;
            </h2>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-secondary">— B.K.S. Iyengar</p>
          </div>
        </section>

        <section
          id="contact"
          data-edit-target="contact_heading,contact_intro,contact_group,sanctuary_heading,sanctuary_body,sanctuary_image"
          className={`mx-auto max-w-7xl px-6 py-28 ${
            isEditPreview ? "outline outline-2 outline-transparent transition hover:outline-primary/40" : ""
          }`}
        >
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <h2 data-edit-target="contact_heading" className="font-headline text-5xl text-primary">
                {readText(sections, "contact_heading", "Get in Touch")}
              </h2>
              <p data-edit-target="contact_intro" className="mt-6 text-lg leading-relaxed text-foreground/80">
                {readText(sections, "contact_intro")}
              </p>
              <ContactForm />
              <div data-edit-target="contact_group" className="mt-10 space-y-2 text-sm text-foreground/80">
                <p>{contactGroup.email || settings.primaryEmail || "Email to be added"}</p>
                <p>{contactGroup.phone || settings.primaryPhone || "+44 20 7946 0958"}</p>
                <p>
                  {[
                    contactGroup.address_line_1 || settings.addressLine1,
                    contactGroup.address_line_2 || settings.addressLine2,
                    settings.city,
                    settings.postcode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
            <div
              className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-surface-high shadow-md shadow-emerald-950/8"
              data-edit-target="sanctuary_heading,sanctuary_body,sanctuary_image"
            >
              {sanctuaryImage ? (
                <div data-edit-target="sanctuary_image" className="relative aspect-[16/10] w-full bg-surface-low">
                  <Image
                    src={sanctuaryImage}
                    alt={sections.sanctuary_image?.altText || "Studio or sanctuary space"}
                    fill
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="p-8">
                <h3 data-edit-target="sanctuary_heading" className="font-headline text-3xl text-primary">
                  {readText(sections, "sanctuary_heading", "Our Sanctuary")}
                </h3>
                <p
                  data-edit-target="sanctuary_body"
                  className="mt-4 whitespace-pre-line leading-relaxed text-foreground/80"
                >
                  {readText(
                    sections,
                    "sanctuary_body",
                    "Residential street with ample free parking. Directions provided upon booking.",
                  )}
                </p>
                {hasSanctuarySocials ? (
                  <div className="mt-8">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
                      Follow the Hut
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {settings.instagramUrl?.trim() ? (
                        <a
                          href={settings.instagramUrl.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2.5 rounded-full border-2 border-primary/30 bg-white px-5 py-3 text-sm font-semibold text-primary shadow-sm transition hover:border-primary hover:bg-primary hover:text-white hover:shadow-md"
                        >
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-current">
                            <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm8.9 1.3a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7.001A3.5 3.5 0 0 0 12 8.5Z" />
                          </svg>
                          Instagram
                        </a>
                      ) : null}
                      {settings.facebookUrl?.trim() ? (
                        <a
                          href={settings.facebookUrl.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2.5 rounded-full border-2 border-primary/30 bg-white px-5 py-3 text-sm font-semibold text-primary shadow-sm transition hover:border-primary hover:bg-primary hover:text-white hover:shadow-md"
                        >
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-current">
                            <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.2c0-.9.3-1.5 1.6-1.5h1.7V5.1c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V11H8v3h2.4v8h3.1Z" />
                          </svg>
                          Facebook
                        </a>
                      ) : null}
                      {settings.linkedinUrl?.trim() ? (
                        <a
                          href={settings.linkedinUrl.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2.5 rounded-full border-2 border-primary/30 bg-white px-5 py-3 text-sm font-semibold text-primary shadow-sm transition hover:border-primary hover:bg-primary hover:text-white hover:shadow-md"
                        >
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-current">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                          LinkedIn
                        </a>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section
          id="faq"
          data-edit-target="faq_heading,faq_items"
          className={`bg-surface-low py-28 ${
            isEditPreview ? "outline outline-2 outline-transparent transition hover:outline-primary/40" : ""
          }`}
        >
          <div className="mx-auto max-w-3xl px-6">
            <h2 data-edit-target="faq_heading" className="font-headline text-center text-5xl italic text-primary">
              {readText(sections, "faq_heading", "Frequently Asked Questions")}
            </h2>
            <div className="mt-12 space-y-6">
              {faqItems.map((item, index) => (
                <details
                  data-edit-target="faq_items"
                  key={`${item.question}-${index}`}
                  className="group rounded-[1.25rem] border border-primary/12 bg-white/95 p-8 shadow-sm shadow-emerald-950/5 backdrop-blur-sm transition hover:border-primary/25 hover:shadow-md"
                >
                  <summary className="cursor-pointer list-none font-headline text-xl italic leading-snug text-primary marker:hidden md:text-2xl [&::-webkit-details-marker]:hidden">
                    {item.question}
                  </summary>
                  <p className="mt-6 border-l-[3px] border-secondary/45 pl-6 text-base leading-relaxed text-foreground/85 md:text-lg">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-surface-container px-6 py-8 text-sm text-foreground/75">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <p>Copyright {currentYear} Accessible Yoga Hut. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href={settings.instagramUrl || "https://instagram.com"} className="hover:text-primary">
              Instagram
            </a>
            <a href={settings.facebookUrl || "https://facebook.com"} className="hover:text-primary">
              Facebook
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
