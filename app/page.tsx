import { getHomePageContent } from "@/lib/content/queries";
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

export default async function Home({ searchParams }: HomePageProps) {
  const params = (await searchParams) ?? {};
  const isEditPreview = params.edit === "1";
  const content = await getHomePageContent();
  const { sections, settings } = content;

  const navItems = [
    { href: "#about", label: "About" },
    { href: "#practice", label: "Practice" },
    { href: "#schedule", label: "Schedule" },
    { href: "#contact", label: "Contact" },
    { href: "#faq", label: "FAQ" },
  ];
  const featureCards = readJsonArray<BasicCard>(sections.studio_feature_cards?.jsonValue);
  const practiceCards = readJsonArray<BasicCard>(sections.practice_cards?.jsonValue);
  const faqItems = readJsonArray<FaqItem>(sections.faq_items?.jsonValue);
  const heroImage =
    sections.hero_image?.imagePath ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCNWAO3KhL-GFV2PV7Sihcp0X5YLK_5wSDIpphk7bGFN88T48M5ymcHBYIH3iWqgcb9mFP8phyJphyRSJwA3CKdG9LQpMq_3EbOevyoUoUMwF5_KZjt8XtOrT8bIKtmrxZc6XM3YwdWjkjnWVmiUPVs0-RmKKVId3zAMrOHGMN-4fjEaIbuby9eIpR8VvDvfo9Qoo12bbReL9vaLqdcHqL-qlOjC1lI6_Bh0I4C4PFFKNS7FHcWwliKa51K7Sss5mHc08RRhoGjaw";
  const aboutImage =
    sections.about_headshot_image?.imagePath ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDP2_-yLVLrPBa0ks12Sv3gKzOMQt1pMGlaHlaRuF3BO4jR51mNHlmaZCkZOrPUx28wlxzVTXfdnmwNLzxk28xazToQSUE0QLA0Gxy-TwZuL2P1hLzTrReR2G_KCP4yWDVNtPROdQ-U4PYj1tho4Brv9VwMPG5C-lxO-wXS2yk6hPFoKR0bsZWJKr4XU40naw-xFcBDX0fuiFTl5eQ75NewXvP6gFy2HAnWKi5lMu0qXO_XPX_G91p5r4XZufjE7DMgUpWR6rNJng";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isEditPreview ? (
        <div className="fixed bottom-4 right-4 z-[60] rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg">
          Edit Preview
        </div>
      ) : null}
      <header className="fixed top-0 z-50 w-full bg-background/90 shadow-sm shadow-emerald-900/5 backdrop-blur-md">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
          <a href="#" className="font-headline text-2xl italic text-primary">
            {settings.siteName || content.pageTitle}
          </a>
          <ul className="hidden items-center gap-8 md:flex">
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
            href={settings.bookingUrl || readText(sections, "booking_cta_link", "#schedule")}
            className="rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary-container"
          >
            Book now
          </a>
        </nav>
      </header>

      <main>
        <section
          id="hero"
          data-edit-target="hero_heading,hero_subheading,hero_primary_cta_text,hero_primary_cta_link,hero_image"
          className={`relative flex min-h-screen items-center overflow-hidden pt-20 ${
            isEditPreview ? "outline outline-2 outline-transparent transition hover:outline-primary/40" : ""
          }`}
        >
          <div className="absolute inset-0">
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

        <section
          data-edit-target="studio_heading,studio_body,studio_feature_cards,about_headshot_image"
          className={`mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-28 md:grid-cols-12 ${
            isEditPreview ? "outline outline-2 outline-transparent transition hover:outline-primary/40" : ""
          }`}
        >
          <div className="relative md:col-span-5">
            <div className="aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-surface-high">
              <div className="relative h-full w-full">
                <Image
                  src={aboutImage}
                  alt={sections.about_headshot_image?.altText || "Yoga studio portrait"}
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 h-20 w-20 rounded-full bg-secondary/15" />
          </div>
          <div className="md:col-span-7 md:pl-8">
            <h2 id="about" data-edit-target="studio_heading" className="font-headline text-4xl leading-tight text-primary md:text-5xl">
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
          data-edit-target="about_heading,about_body_primary,about_body_secondary,about_headshot_image"
          className={`bg-[#dcdad5] py-28 ${
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
            </div>
            <div className="md:col-span-2">
              <div className="sticky top-30 rotate-2 overflow-hidden rounded-[1.5rem] shadow-2xl">
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
          data-edit-target="schedule_heading,schedule_intro,booking_cta_text,booking_cta_link"
          className={`bg-surface-low py-28 ${
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
              <div className="grid gap-0 md:grid-cols-[20rem_1fr]">
                <aside className="bg-surface-container p-8">
                  <h3 className="font-headline text-2xl">Booking</h3>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/75">
                    Acuity is not connected yet. This is currently a placeholder section.
                  </p>
                  <a
                    data-edit-target="booking_cta_text,booking_cta_link"
                    href={settings.bookingUrl || readText(sections, "booking_cta_link", "#")}
                    className="mt-6 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white"
                  >
                    {readText(sections, "booking_cta_text", "Booking coming soon")}
                  </a>
                </aside>
                <div className="p-8">
                  <div className="grid grid-cols-7 gap-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                  <div className="mt-4 grid grid-cols-7 gap-2">
                    {[28, 29, 30, 1, 2, 3, 4].map((day) => (
                      <div key={day} className="h-24 rounded-lg border border-outline/30 bg-surface-low p-2 text-xs">
                        {day}
                      </div>
                    ))}
                  </div>
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
          data-edit-target="contact_heading,contact_intro"
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
              <div className="mt-10 space-y-2 text-sm text-foreground/80">
                <p>{settings.primaryEmail || "Email to be added"}</p>
                <p>{settings.primaryPhone || "Phone to be added"}</p>
                <p>{[settings.addressLine1, settings.addressLine2, settings.city, settings.postcode].filter(Boolean).join(", ")}</p>
              </div>
            </div>
            <div className="rounded-[1.5rem] bg-surface-high p-8">
              <h3 className="font-headline text-3xl">Our Sanctuary</h3>
              <p className="mt-4 text-foreground/75">
                Residential street with ample free parking. Directions provided upon booking.
              </p>
              <div className="mt-8 space-y-2 text-sm">
                <p className="font-semibold text-secondary">Social</p>
                <div className="flex gap-4">
                  {settings.instagramUrl ? <a href={settings.instagramUrl}>Instagram</a> : null}
                  {settings.linkedinUrl ? <a href={settings.linkedinUrl}>LinkedIn</a> : null}
                </div>
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
            <div className="mt-12 space-y-4">
              {faqItems.map((item, index) => (
                <details data-edit-target="faq_items" key={`${item.question}-${index}`} className="rounded-[1rem] bg-white p-6 shadow-sm">
                  <summary className="cursor-pointer list-none text-lg font-semibold">{item.question}</summary>
                  <p className="mt-4 border-t border-outline/40 pt-4 leading-relaxed text-foreground/80">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
