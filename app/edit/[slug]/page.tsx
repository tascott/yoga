import Link from "next/link";
import { HomeEditor } from "@/components/editable/HomeEditor";
import { TherapyEditor } from "@/components/editable/TherapyEditor";

type EditPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditSlugPage({ params }: EditPageProps) {
  const { slug } = await params;

  if (slug === "home") {
    return <HomeEditor />;
  }
  if (slug === "therapy") {
    return <TherapyEditor />;
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-20">
      <h1 className="text-3xl font-semibold">Editing: {slug}</h1>
      <p className="mt-4 text-foreground/80">Available editors are currently `home` and `therapy`.</p>
      <Link href="/edit" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
        Go to Editor Dashboard
      </Link>
    </main>
  );
}
