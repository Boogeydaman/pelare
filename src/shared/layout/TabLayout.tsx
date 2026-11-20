import { CircleUser, Sun } from 'lucide-react';
import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { MODULE_LIST } from '../../modules/registry';
import { color } from '../ui/kit';

const TABS = [
  { to: '/idag', label: 'Idag', icon: Sun, kind: undefined },
  ...MODULE_LIST.map((m) => ({ to: `/${m.slug}`, label: m.name, icon: m.icon, kind: m.id })),
  { to: '/du', label: 'Du', icon: CircleUser, kind: undefined },
];

export function TabLayout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="min-h-full">
      <main className="safe-top mx-auto w-full max-w-lg px-6 pb-28">
        <Outlet />
      </main>
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-paper/92 backdrop-blur-md" aria-label="Huvudmeny">
        <div className="mx-auto flex max-w-lg px-2">
          {TABS.map(({ to, label, icon: Icon, kind }) => (
            <NavLink key={to} to={to} className="flex-1">
              {({ isActive }) => (
                <span className={`flex h-[58px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${isActive ? 'text-ink' : 'text-ink2'}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.1 : 1.6} style={isActive && kind ? { color: color(kind) } : undefined} aria-hidden="true" />
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
