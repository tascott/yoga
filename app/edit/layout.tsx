import { AuthGate } from "@/components/auth/AuthGate";

type EditLayoutProps = {
  children: React.ReactNode;
};

export default function EditLayout({ children }: EditLayoutProps) {
  return <AuthGate>{children}</AuthGate>;
}
