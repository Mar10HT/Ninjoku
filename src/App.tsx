import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { ModeSelect } from './pages/ModeSelect';
import { ClassicPage } from './pages/ClassicPage';
import { GridPage } from './pages/GridPage';
import { PyramidPage } from './pages/PyramidPage';
import { ResultsPage } from './pages/ResultsPage';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<ModeSelect />} />
        <Route path="/classic" element={<ClassicPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/grid" element={<GridPage />} />
        <Route path="/pyramid" element={<PyramidPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
