import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MobileNav from '@/components/layout/MobileNav';
import WhatsAppButton from '@/components/feature/WhatsAppButton';
import OnboardingGate from '@/components/feature/OnboardingGate';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_38%,#eef7f6_100%)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 px-4 lg:px-8 py-6 pb-24 lg:pb-10">
          <OnboardingGate>{children}</OnboardingGate>
        </main>
        <MobileNav />
      </div>
      <WhatsAppButton />
    </div>
  );
}
