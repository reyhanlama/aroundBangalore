import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useLayoutEffect } from 'react';

const links = [
  ['/', 'Explore', '◇'],
  ['/lakes', 'All lakes', '≋'],
  ['/field-notes', 'Field notes', '✦'],
  ['/about', 'About', '○']
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const section = location.pathname === '/' ? 'Explore' : location.pathname.startsWith('/lakes/') ? 'Lake' : location.pathname.split('/')[1]?.replace('-', ' ') || 'Explore';
    document.title = `${section.replace(/^./, (letter) => letter.toUpperCase())} — Nadi`;
  }, [location.pathname]);
  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="wordmark" aria-label="Nadi home">
          <span className="wordmark-mark" aria-hidden="true" />
          <span>NADI</span>
        </NavLink>
        <span className="edition"><i /> LIVING LAKE ATLAS · BLR</span>
        <span className="catalog-count">210<br /><small>LAKES</small></span>
      </header>
      <main>{children}</main>
      <nav className="bottom-nav" aria-label="Primary navigation">
        {links.map(([to, label, icon]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'active' : ''}>
            <i aria-hidden="true">{icon}</i><span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
