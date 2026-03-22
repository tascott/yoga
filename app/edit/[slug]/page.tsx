import Link from "next/link";
import { HomeEditor } from "@/components/editable/HomeEditor";

type EditPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditSlugPage({ params }: EditPageProps) {
  const { slug } = await params;

  if (slug === "home") {
    return <HomeEditor />;
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-20">
      <h1 className="text-3xl font-semibold">Editing: {slug}</h1>
      <p className="mt-4 text-foreground/80">This editor is currently available for the `home` page only.</p>
      <Link href="/edit/home" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
        Go to Home Editor
      </Link>
    </main>
  );
}
