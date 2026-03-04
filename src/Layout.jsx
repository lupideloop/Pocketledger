import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  CreditCard,
  Building2,
  TrendingUp,
  Wallet,
  BarChart3,
  Menu,
  X
} from "lucide-react";

const navItems = [
  { label: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { label: "Expenses", page: "Expenses", icon: CreditCard },
  { label: "Income", page: "Income", icon: Wallet },
  { label: "Bank Accounts", page: "BankAccounts", icon: Building2 },
  { label: "Investments", page: "Investments", icon: TrendingUp },
  { label: "Assets", page: "Assets", icon: BarChart3 },
];

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        :root {
          --accent: #1A1A2E;
          --accent-light: #16213E;
          --gold: #C9A84C;
          --gold-light: #F0D58C;
          --surface: #FFFFFF;
          --bg: #F8F7F4;
          --muted: #8A8A99;
          --border: #E8E6E1;
        }
      `}</style>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#1A1A2E] flex flex-col transition-transform duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:flex
      `}>
        <div className="px-6 py-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A84C] to-[#F0D58C] flex items-center justify-center">
              <span className="text-[#1A1A2E] font-bold text-sm">H</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm tracking-wide">HomeFinance</p>
              <p className="text-white/40 text-xs">Personal Wealth</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
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

        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-white/20 text-xs text-center">© 2026 HomeFinance</p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-[#E8E6E1]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#C9A84C] to-[#F0D58C] flex items-center justify-center">
              <span className="text-[#1A1A2E] font-bold text-xs">H</span>
            </div>
            <span className="font-semibold text-[#1A1A2E] text-sm">HomeFinance</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="p-2 text-[#1A1A2E]">
            <Menu size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}