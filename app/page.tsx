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
  const web3FormsAccessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? "";
  const currentYear = new Date().getFullYear();
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
  const contactGroup = readJsonObject(sections.contact_group?.jsonValue);
  const siteLogoImage = sections.site_logo_image?.imagePath || "";
  const studioImage =
    sections.studio_image?.imagePath ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDdZboxgcbURHnrsqPthHz4Gd2wy_oDv0ULJ4KIs4me4Ciedc-vO6V8odvXDm_VWQxRv6RvgwAXbYuR5QV1y-u6OybPOqtPPs6GiZWgwkB46weomSiq8mq5RBtGJuta3KKRrr9X_9KBTYdSlXYSn5hERbMQ-u3LJdMUrMk1ENX2I-Jp0zmSKlUshHVsiAGjC5YnbPwjZr68Ir6WOIUPw8NrkAFpBxHn214feoKPPQNlt22oMre37QzgwOs8tLDuk7jGu19Yv4BsQw";
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
      <header className="fixed top-0 z-50 w-full bg-background/90 shadow-sm shadow-emerald-900/5 backdrop-blur-md">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
          <a href="#" className="flex items-center gap-3 font-headline text-2xl italic text-primary">
            <span
              data-edit-target="site_logo_image"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/25 bg-white text-[10px] font-semibold uppercase tracking-[0.15em] text-primary/70"
            >
              {siteLogoImage ? (
                <Image
                  src={siteLogoImage}
                  alt={sections.site_logo_image?.altText || "Site logo"}
                  fill
                  sizes="40px"
                  className="h-full w-full object-cover"
                />
              ) : (
                "Logo"
              )}
            </span>
            {settings.siteName || content.pageTitle}
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
            href={settings.bookingUrl || readText(sections, "booking_cta_link", "#schedule")}
            className="ml-4 shrink-0 whitespace-nowrap rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary-container"
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
          data-edit-target="contact_heading,contact_intro,contact_group"
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
              <form action="https://api.web3forms.com/submit" method="POST" className="mt-8 space-y-4 rounded-xl bg-white p-5 shadow-sm">
                <input type="hidden" name="access_key" value={web3FormsAccessKey} />
                <input type="hidden" name="subject" value="New Accessible Yoga Hut enquiry" />
                <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />
                <div>
                  <label htmlFor="contact-name" className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    required
                    className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    required
                    className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
                  />
                </div>
                {!web3FormsAccessKey ? (
                  <p className="text-xs text-red-700">
                    Missing `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` in environment settings.
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={!web3FormsAccessKey}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send message
                </button>
              </form>
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
            <div className="rounded-[1.5rem] bg-surface-high p-8">
              <h3 className="font-headline text-3xl">Our Sanctuary</h3>
              <p className="mt-4 text-foreground/75">
                Residential street with ample free parking. Directions provided upon booking.
              </p>
              <div className="mt-8 space-y-2 text-sm">
                <p className="font-semibold text-secondary">Social</p>
                <div className="flex gap-4">
                  <a href={settings.instagramUrl || "https://instagram.com"} className="inline-flex items-center gap-1">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm8.9 1.3a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7.001A3.5 3.5 0 0 0 12 8.5Z" />
                    </svg>
                    Instagram
                  </a>
                  <a href={settings.facebookUrl || "https://facebook.com"} className="inline-flex items-center gap-1">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                      <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.2c0-.9.3-1.5 1.6-1.5h1.7V5.1c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V11H8v3h2.4v8h3.1Z" />
                    </svg>
                    Facebook
                  </a>
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
