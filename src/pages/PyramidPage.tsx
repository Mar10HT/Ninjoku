import { useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { PyramidGame } from '../components/pyramid/PyramidGame';

export function PyramidPage() {
  useEffect(() => { document.title = 'Pyramid — NARUTODLE'; }, []);
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <PyramidGame />
      </main>
    </div>
  );
}
