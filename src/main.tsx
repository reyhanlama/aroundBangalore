import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles.css';
import { App } from './App';

let updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
updateServiceWorker = registerSW({
  immediate: true,
  onNeedRefresh() {
    window.dispatchEvent(new CustomEvent('nadi-sw-update', { detail: () => updateServiceWorker(true) }));
  }
});
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
