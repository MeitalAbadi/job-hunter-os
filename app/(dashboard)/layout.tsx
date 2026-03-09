// app/(dashboard)/layout.tsx
import { Sidebar } from "../../components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <main style={{
        flex: 1,
        overflow: "auto",
        background: "var(--bg-base)",
      }}>
        {children}
      </main>
    </div>
  );
}
