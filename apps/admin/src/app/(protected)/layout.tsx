import { verifyAdminAccess } from '@/lib/auth-guard';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth verification
  // This will redirect if user doesn't meet requirements
  const { user } = await verifyAdminAccess();

  return (
    <div className="min-h-screen flex">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col">
        <Header user={user} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
