import { AuthGate } from "@/components/auth/AuthGate";
import { EditBackNav } from "@/components/editable/EditBackNav";

type EditLayoutProps = {
  children: React.ReactNode;
};

export default function EditLayout({ children }: EditLayoutProps) {
  return (
    <AuthGate>
      <EditBackNav />
      {children}
    </AuthGate>
  );
}
