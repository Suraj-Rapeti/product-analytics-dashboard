import React from 'react';
import {
  LayoutDashboard,
  Users,
  Lightbulb,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users',     label: 'Users',     icon: Users },
  { id: 'insights',  label: 'Insights',  icon: Lightbulb },
];

const bottomItems = [
  { id: 'settings', label: 'Settings', icon: Settings },
];

function NavItem({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={() => onClick(item.id)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
        active
          ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
      }`}
    >
      <Icon
        size={18}
        className={active ? 'text-brand-500 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}
      />
      <span>{item.label}</span>
      {active && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 dark:bg-brand-400" />
      )}
    </button>
  );
}

function Sidebar({ activeNav, onNavChange, isOpen, onClose }) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-100 dark:border-slate-800 flex flex-col transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-sm">
          <BarChart3 size={16} className="text-white" />
        </div>
        <span className="text-[15px] font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
          Product<span className="text-brand-500 dark:text-brand-400">IQ</span>
        </span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
          Main
        </p>
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            active={activeNav === item.id}
            onClick={(id) => {
              onNavChange(id);
              onClose?.();
            }}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-slate-100 dark:border-slate-800 pt-3">
        {bottomItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            active={activeNav === item.id}
            onClick={(id) => {
              onNavChange(id);
              onClose?.();
            }}
          />
        ))}
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-all duration-150">
          <LogOut size={18} className="text-slate-400 dark:text-slate-500" />
          <span>Logout</span>
        </button>

        {/* User chip */}
        <div className="flex items-center gap-2.5 px-3 py-2 mt-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
          <img
            src="https://i.pravatar.cc/32?u=alex-dashboard"
            alt="Alex Kim"
            className="w-7 h-7 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">Alex Kim</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
