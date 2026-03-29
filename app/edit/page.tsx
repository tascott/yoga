export default function EditDashboardPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-20">
      <h1 className="font-headline text-4xl text-primary">Edit Content</h1>
      <p className="mt-3 text-foreground/75">Choose which page you want to edit.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a href="/edit/home" className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5 hover:ring-primary/40">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/60">Page</p>
          <h2 className="mt-2 font-headline text-3xl text-primary">Home</h2>
          <p className="mt-2 text-sm text-foreground/70">Edit hero, sections, FAQ, contact, and images.</p>
        </a>
        <a href="/edit/therapy" className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5 hover:ring-primary/40">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/60">Page</p>
          <h2 className="mt-2 font-headline text-3xl text-primary">Therapy</h2>
          <p className="mt-2 text-sm text-foreground/70">Edit heading, paragraphs, and therapy image.</p>
        </a>
      </div>
    </main>
  );
}
