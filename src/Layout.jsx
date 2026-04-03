import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard, CreditCard, Building2, TrendingUp, Wallet, BarChart3, Menu, X, Sun, Moon, PiggyBank
} from "lucide-react";
import { ThemeProvider, useTheme, CURRENCIES } from "@/components/finance/ThemeContext";

const navItems = [
  { label: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { label: "Expenses", page: "Expenses", icon: CreditCard },
  { label: "Income", page: "Income", icon: Wallet },
  { label: "Bank Accounts", page: "BankAccounts", icon: Building2 },
  { label: "Investments", page: "Investments", icon: TrendingUp },
  { label: "Assets", page: "Assets", icon: BarChart3 },
  { label: "Budgets", page: "Budgets", icon: PiggyBank },
];

function LayoutInner({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dark, toggle, currency, changeCurrency } = useTheme();

  return (
    <div className={`min-h-screen flex ${dark ? "bg-[#0F0F1A]" : "bg-[#F8F7F4]"}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Sidebar — desktop only */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300
        bg-[#1A1A2E]
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:flex
      `}>
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

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className={`lg:hidden flex items-center justify-between px-4 py-3 border-b ${dark ? "bg-[#1A1A2E] border-white/10" : "bg-white border-[#E8E6E1]"}`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#C9A84C] to-[#F0D58C] flex items-center justify-center">
              <span className="text-[#1A1A2E] font-bold text-xs">H</span>
            </div>
            <span className={`font-semibold text-sm ${dark ? "text-white" : "text-[#1A1A2E]"}`}>HomeFinance</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className={`p-2 rounded-lg ${dark ? "text-white/60 hover:bg-white/10" : "text-[#8A8A99] hover:bg-gray-100"}`}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setMobileOpen(true)} className={`p-2 ${dark ? "text-white" : "text-[#1A1A2E]"}`}>
              <Menu size={20} />
            </button>
          </div>
        </header>

        {/* Page content — add bottom padding for mobile nav */}
        <main className="flex-1 overflow-auto pb-20 lg:pb-0">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-20 border-t ${dark ? "bg-[#1A1A2E] border-white/10" : "bg-white border-[#E8E6E1]"}`}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <div className="flex items-center justify-around">
            {navItems.map(({ label, page, icon: Icon }) => {
              const isActive = currentPageName === page;
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className={`flex flex-col items-center gap-0.5 py-2 px-2 flex-1 transition-colors ${isActive ? "text-[#C9A84C]" : dark ? "text-white/40" : "text-[#8A8A99]"}`}
                >
                  <Icon size={20} />
                  <span className="text-[10px] font-medium leading-tight text-center">{label.replace(" Accounts", "").replace("Investments", "Invest")}</span>
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