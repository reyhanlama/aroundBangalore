import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ExplorePage } from './pages/ExplorePage';
import { LakesPage } from './pages/LakesPage';
import { LakeDetailPage } from './pages/LakeDetailPage';
import { FieldNotesPage } from './pages/FieldNotesPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<ExplorePage />} />
        <Route path="/lakes" element={<LakesPage />} />
        <Route path="/lakes/:slug" element={<LakeDetailPage />} />
        <Route path="/field-notes" element={<FieldNotesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}
