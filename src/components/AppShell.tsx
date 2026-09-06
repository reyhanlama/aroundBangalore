import type { ReactNode } from 'react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { lakeBySlug } from '../data/catalog';

const links = [
  ['/', 'Explore', '◇'],
  ['/lakes', 'All lakes', '≋'],
  ['/field-notes', 'Field notes', '✦'],
  ['/about', 'About', '○']
] as const;

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [online, setOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent>();
  const [updateApp, setUpdateApp] = useState<(() => Promise<void>)>();
  const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const lakeSlug = location.pathname.startsWith('/lakes/') ? location.pathname.split('/')[2] : '';
    const lake = lakeSlug ? lakeBySlug.get(lakeSlug) : undefined;
    const section = lake ? lake.aliases[0] || lake.name : location.pathname === '/' ? 'Explore' : location.pathname.split('/')[1]?.replace('-', ' ') || 'Explore';
    document.title = `${section.replace(/^./, (letter) => letter.toUpperCase())} — Nadi`;
  }, [location.pathname]);

  useEffect(() => {
    const wentOnline = () => setOnline(true);
    const wentOffline = () => setOnline(false);
    const canInstall = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPromptEvent); };
    const updateReady = (event: Event) => setUpdateApp(() => (event as CustomEvent<() => Promise<void>>).detail);
    window.addEventListener('online', wentOnline);
    window.addEventListener('offline', wentOffline);
    window.addEventListener('beforeinstallprompt', canInstall);
    window.addEventListener('nadi-sw-update', updateReady);
    return () => {
      window.removeEventListener('online', wentOnline);
      window.removeEventListener('offline', wentOffline);
      window.removeEventListener('beforeinstallprompt', canInstall);
      window.removeEventListener('nadi-sw-update', updateReady);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstallPrompt(undefined);
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="topbar">
        <NavLink to="/" className="wordmark" aria-label="Nadi home"><span className="wordmark-mark" aria-hidden="true" /><span>NADI</span></NavLink>
        <span className="edition"><i /> BENGALURU LAKE FIELD GUIDE</span>
        <span className="catalog-count"><b>210</b> official records</span>
      </header>

      {!online && <div className="service-notice offline-notice" role="status"><b>Offline</b><span>The text directory remains available. Basemap tiles may not load.</span></div>}
      {installPrompt && <div className="service-notice install-notice"><span>Keep the lake directory available offline.</span><button onClick={install}>Install Nadi</button><button aria-label="Dismiss install suggestion" onClick={() => setInstallPrompt(undefined)}>×</button></div>}
      {updateApp && <div className="service-notice update-notice"><span>A newer version of Nadi is ready.</span><button onClick={() => updateApp()}>Update now</button></div>}
      {isIos && !isStandalone && location.pathname === '/about' && <div className="service-notice ios-install"><span>On iPhone or iPad: tap Share, then “Add to Home Screen” for offline access.</span></div>}

      <main id="main-content">{children}</main>
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
