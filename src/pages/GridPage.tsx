import { useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { GridGame } from '../components/grid/GridGame';

export function GridPage() {
  useEffect(() => { document.title = 'Grid — NARUTODLE'; }, []);
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <GridGame />
      </main>
    </div>
  );
}
