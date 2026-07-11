import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard, CreditCard, Building2, TrendingUp, Wallet, BarChart3, Menu, Sun, Moon, PiggyBank, RefreshCw, Settings, LineChart, ChevronLeft, Landmark, Calculator
} from "lucide-react";
import CalculatorModal from "@/components/finance/CalculatorModal";
import { ThemeProvider, useTheme, CURRENCIES } from "@/components/finance/ThemeContext";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import useTabHistory from "@/hooks/useTabHistory";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// Bottom tabs (mobile): 5 most-used + Settings
const bottomTabs = [
  { label: "Home", page: "Dashboard", icon: LayoutDashboard },
  { label: "Expenses", page: "Expenses", icon: CreditCard },
  { label: "Income", page: "Income", icon: Wallet },
  { label: "Analytics", page: "Analytics", icon: LineChart },
  { label: "Settings", page: "Settings", icon: Settings },
];

// Full sidebar nav (desktop)
const navItems = [
  { label: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { label: "Expenses", page: "Expenses", icon: CreditCard },
  { label: "Income", page: "Income", icon: Wallet },
  { label: "Accounts", page: "BankAccounts", icon: Building2 },
  { label: "Investments", page: "Investments", icon: TrendingUp },
  { label: "Assets", page: "Assets", icon: BarChart3 },
  { label: "Liabilities", page: "Liabilities", icon: Landmark },
  { label: "Budgets", page: "Budgets", icon: PiggyBank },
  { label: "Analytics", page: "Analytics", icon: LineChart },
  { label: "Settings", page: "Settings", icon: Settings },
];

// Determine slide direction based on tab order
const tabOrder = bottomTabs.map(t => t.page);

function LayoutInner({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const { dark, toggle, currency, changeCurrency } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { save, restore } = useTabHistory();
  const reduceMotion = useReducedMotion();

  // Track slide direction for page transitions
  const prevTabIndex = useRef(tabOrder.indexOf(currentPageName));
  const [slideDir, setSlideDir] = useState(1);

  useEffect(() => {
    const newIdx = tabOrder.indexOf(currentPageName);
    const oldIdx = prevTabIndex.current;
    if (newIdx !== -1 && oldIdx !== -1 && newIdx !== oldIdx) {
      setSlideDir(newIdx > oldIdx ? 1 : -1);
    } else {
      setSlideDir(1);
    }
    prevTabIndex.current = newIdx !== -1 ? newIdx : oldIdx;
  }, [currentPageName]);

  // Pull-to-refresh: reload page by forcing a soft remount key
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRefresh = useCallback(async () => {
    await new Promise(r => setTimeout(r, 600));
    setRefreshKey(k => k + 1);
  }, []);

  const { containerRef, refreshing } = usePullToRefresh(handleRefresh);

  // Save scroll position when leaving a tab, restore when returning
  const prevPage = useRef(currentPageName);
  useEffect(() => {
    const el = containerRef.current;
    if (prevPage.current !== currentPageName) {
      // Save scroll of previous tab
      if (el) save(prevPage.current, location.pathname, el.scrollTop);
      // Restore scroll of current tab — defer to ensure DOM is ready after remount
      const saved = restore(currentPageName);
      if (saved) {
        setTimeout(() => {
          if (containerRef.current) containerRef.current.scrollTop = saved.scrollY;
        }, 50);
      }
      prevPage.current = currentPageName;
    }
  }, [currentPageName, location.pathname, save, restore, containerRef]);

  const bgPage = dark ? "bg-[#0F0F1A]" : "bg-[#F8F7F4]";
  const isDashboard = currentPageName === "Dashboard";
  const isBottomTab = tabOrder.includes(currentPageName);

  const slideVariants = reduceMotion ? {
    enter: { x: 0, opacity: 1 }, center: { x: 0, opacity: 1 }, exit: { x: 0, opacity: 1 },
  } : {
    enter: (dir) => ({ x: dir * 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir * -60, opacity: 0 }),
  };

  return (
    <div
      className={`h-screen flex overflow-hidden ${bgPage}`}
      // Prevent system gesture conflicts
      style={{ touchAction: "pan-y", WebkitUserSelect: "none" }}
    >
      {/* Font loaded in index.html <head> — not here */}

      {/* Sidebar — desktop only */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300
        bg-[#1A1A2E]
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:flex
      `}
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="px-6 py-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A84C] to-[#F0D58C] flex items-center justify-center flex-shrink-0">
              <span className="text-[#1A1A2E] font-bold text-sm">H</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm tracking-wide">HomeFinance</p>
              <p className="text-white/40 text-xs">Personal Wealth</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map(({ label, page, icon: Icon }) => {
            const isActive = currentPageName === page;
            return (
              <Link
                key={page}
                to={createPageUrl(page)}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? "bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                  }
                `}
              >
                <Icon size={16} className={isActive ? "text-[#C9A84C]" : ""} />
                {label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => { setCalculatorOpen(true); setMobileOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/5 transition-all duration-200"
          >
            <Calculator size={16} />
            Calculator
          </button>
        </nav>

        <div className="px-4 py-4 border-t border-white/10 space-y-2">
          <select
            value={currency.code}
            onChange={e => changeCurrency(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/5 text-white/60 hover:text-white text-xs border border-white/10 focus:outline-none focus:border-[#C9A84C]/50 transition-all"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code} className="bg-[#1A1A2E]">{c.label}</option>
            ))}
          </select>
          <button
            onClick={toggle}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all text-sm"
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
            {dark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <CalculatorModal open={calculatorOpen} onClose={() => setCalculatorOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">

        {/* Mobile top header — safe area top */}
        <header
          className={`lg:hidden flex items-center justify-between px-4 border-b flex-shrink-0 ${dark ? "bg-[#1A1A2E] border-white/10" : "bg-white border-[#E8E6E1]"}`}
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)", paddingBottom: "12px" }}
        >
          {/* Left: back button (non-dashboard) or logo */}
          {!isDashboard ? (
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-1 p-1 rounded-lg -ml-1 transition-colors ${dark ? "text-[#C9A84C] hover:bg-white/10" : "text-[#C9A84C] hover:bg-gray-100"}`}
              aria-label="Go back"
            >
              <ChevronLeft size={22} />
              <span className="text-sm font-medium">Back</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#C9A84C] to-[#F0D58C] flex items-center justify-center">
                <span className="text-[#1A1A2E] font-bold text-xs">H</span>
              </div>
              <span className={`font-semibold text-sm ${dark ? "text-white" : "text-[#1A1A2E]"}`}>HomeFinance</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className={`p-2 rounded-lg ${dark ? "text-white/60 hover:bg-white/10" : "text-[#8A8A99] hover:bg-gray-100"}`}
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className={`p-2 rounded-lg ${dark ? "text-white hover:bg-white/10" : "text-[#1A1A2E] hover:bg-gray-100"}`}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        {/* Pull-to-refresh indicator */}
        {refreshing && (
          <div className={`flex items-center justify-center py-3 text-xs gap-2 flex-shrink-0 ${dark ? "text-white/40" : "text-[#8A8A99]"}`}>
            <RefreshCw size={14} className="ptr-spinner" />
            <span>Refreshing…</span>
          </div>
        )}

        {/* Scrollable page content with slide transitions on mobile */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence initial={false} custom={slideDir} mode="wait">
            <motion.main
              key={location.pathname}
              ref={containerRef}
              custom={slideDir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className={`absolute inset-0 overflow-y-auto overflow-x-hidden scroll-smooth-touch`}
              style={{
                paddingBottom: "calc(env(safe-area-inset-bottom) + 5rem)",
              }}
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>

        {/* Mobile bottom navigation — safe area bottom */}
        <nav
          className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t ${dark ? "bg-[#1A1A2E] border-white/10" : "bg-white border-[#E8E6E1]"}`}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center justify-around">
            {bottomTabs.map(({ label, page, icon: Icon }) => {
              const isActive = currentPageName === page;
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  aria-label={label}
                  className={`flex flex-col items-center gap-0.5 py-2 px-1 flex-1 min-w-0 transition-colors active:opacity-60 ${isActive ? "text-[#C9A84C]" : dark ? "text-white/40" : "text-[#8A8A99]"}`}
                >
                  <Icon size={20} />
                  <span className="text-[10px] font-medium leading-tight text-center truncate w-full px-0.5">{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <ThemeProvider>
      <LayoutInner children={children} currentPageName={currentPageName} />
    </ThemeProvider>
  );
}