import { useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { ClassicGame } from '../components/classic/ClassicGame';

export function ClassicPage() {
  useEffect(() => { document.title = 'Classic — NARUTODLE'; }, []);
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center py-6">
        <ClassicGame />
      </main>
    </div>
  );
}
