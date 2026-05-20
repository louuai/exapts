import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MobileNav from '@/components/layout/MobileNav';
import WhatsAppButton from '@/components/feature/WhatsAppButton';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-ink-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 px-4 lg:px-8 py-6 pb-24 lg:pb-10">
          {children}
        </main>
        <MobileNav />
      </div>
      <WhatsAppButton />
    </div>
  );
}
