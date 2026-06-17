import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { TopNav } from "./TopNav";
import OnboardingWizard from "@/components/OnboardingWizard";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useIsMobile } from "@/hooks/use-mobile";

const SIDEBAR_OPEN_KEY = "sidebar-open";
const SIDEBAR_WIDTH_EXPANDED = "16rem"; /* 256px */
const SIDEBAR_WIDTH_COLLAPSED = "4rem";  /* 64px */

export function DashboardLayout() {
  const { showOnboarding, loading, completeOnboarding, skipOnboarding } =
    useOnboarding();
  const isMobile = useIsMobile();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_OPEN_KEY) !== "false";
    } catch {
      return true;
    }
  });

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_OPEN_KEY, String(sidebarOpen));
    } catch {
      // ignore
    }
  }, [sidebarOpen]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleMobileNav = () => setMobileNavOpen((prev) => !prev);

  const desktopMarginLeft = sidebarOpen ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <AppSidebar
        open={isMobile ? mobileNavOpen : sidebarOpen}
        onToggleSidebar={isMobile ? toggleMobileNav : toggleSidebar}
        isMobile={isMobile}
      />
      {isMobile && mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          aria-label="Close navigation menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <TopNav
        sidebarOpen={sidebarOpen}
        onToggleSidebar={isMobile ? toggleMobileNav : toggleSidebar}
        isMobile={isMobile}
      />
      <main
        className="mt-16 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 transition-[margin] duration-200 max-w-full"
        style={{ marginLeft: isMobile ? 0 : desktopMarginLeft }}
      >
        <Outlet />
      </main>

      {/* Onboarding Wizard */}
      {!loading && showOnboarding && (
        <OnboardingWizard
          open={showOnboarding}
          onClose={skipOnboarding}
          onComplete={completeOnboarding}
        />
      )}
    </div>
  );
}
