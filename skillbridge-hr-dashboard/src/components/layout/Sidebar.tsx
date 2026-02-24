import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserCheck, ClipboardList, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Évaluations', path: '/evaluation', icon: UserCheck },
  { label: 'Session de Test', path: '/test-session', icon: ClipboardList },
];

export default function Sidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full gradient-sidebar text-white">
      {/* Logo area */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center font-bold text-sm tracking-tight">
            KPMG
          </div>
          <div>
            <div className="text-[13px] font-medium text-white/90">SkillBridge</div>
          </div>
        </div>
        <div className="mt-4 border-t border-white/15" />
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                isActive
                  ? 'bg-white/95 text-primary-mid shadow-sm'
                  : 'text-white/70 hover:bg-white/8 hover:text-white'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r bg-primary-light" />
              )}
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              <span className="hidden md:inline">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-5 pb-5 space-y-1">
        <div className="text-[11px] text-white/40">v1.0</div>
        <div className="text-[11px] text-white/40">⚡ Powered by Gemini</div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden gradient-primary text-white p-2 rounded-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden modal-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-40 transition-transform duration-200
          w-16 lg:w-60
          ${mobileOpen ? 'translate-x-0 w-60' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
