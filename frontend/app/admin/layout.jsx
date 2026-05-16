import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';
import AdminMobileNav from '@/components/admin/AdminMobileNav';
import AdminGuard from '@/components/admin/AdminGuard';

export const metadata = { title: 'OMEGA Admin — Tableau de bord' };

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <div className="min-h-screen flex bg-ink-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminTopbar />
          <main className="flex-1 px-4 lg:px-8 py-6 pb-24 lg:pb-10">
            {children}
          </main>
          <AdminMobileNav />
        </div>
      </div>
    </AdminGuard>
  );
}
