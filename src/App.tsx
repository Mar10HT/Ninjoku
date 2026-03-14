import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Route-based code splitting: each page (and characters.json) loads only when visited.
// Home, ModeSelect, and ResultsPage do NOT import characters.json — initial bundle stays light.
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const ModeSelect = lazy(() => import('./pages/ModeSelect').then(m => ({ default: m.ModeSelect })));
const ClassicPage = lazy(() => import('./pages/ClassicPage').then(m => ({ default: m.ClassicPage })));
const GridPage = lazy(() => import('./pages/GridPage').then(m => ({ default: m.GridPage })));
const PyramidPage = lazy(() => import('./pages/PyramidPage').then(m => ({ default: m.PyramidPage })));
const ResultsPage = lazy(() => import('./pages/ResultsPage').then(m => ({ default: m.ResultsPage })));

function PageLoader() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <span className="font-mono text-xs text-muted tracking-widest">LOADING...</span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<ModeSelect />} />
          <Route path="/classic" element={<ClassicPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/grid" element={<GridPage />} />
          <Route path="/pyramid" element={<PyramidPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
