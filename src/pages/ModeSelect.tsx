import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';

type Difficulty = 'casual' | 'pro';

export function ModeSelect() {
  const navigate = useNavigate();
  useEffect(() => { document.title = 'Choose Mode — NARUTODLE'; }, []);
  const [classicDiff, setClassicDiff] = useLocalStorage<Difficulty>(
    'narutodle_difficulty_classic',
    'casual',
  );
  const [gridDiff, setGridDiff] = useLocalStorage<Difficulty>(
    'narutodle_difficulty_grid',
    'casual',
  );

  function DifficultyToggle({
    value,
    onChange,
  }: {
    value: Difficulty;
    onChange: (v: Difficulty) => void;
  }) {
    return (
      <div className="inline-flex rounded-md overflow-hidden border border-border text-xs font-display tracking-wider">
        {(['casual', 'pro'] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => onChange(d)}
            className={`px-4 py-2.5 transition-colors uppercase ${
              value === d
                ? 'bg-ink text-surface font-bold'
                : 'bg-surface text-muted hover:text-ink'
            }`}
          >
            {d}
          </button>
        ))}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12">
      <h2 className="font-display font-black text-2xl text-ink tracking-widest mb-2">
        CHOOSE YOUR MODE
      </h2>
      <p className="font-body text-sm text-muted mb-10">Select a game mode to begin</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {/* Classic */}
        <ModeCard
          title="CLASSIC"
          accentClass="border-accent"
          accentTextClass="text-accent"
          description="Guess the daily mystery ninja. Color feedback guides you to the answer."
          badge={null}
          toggle={<DifficultyToggle value={classicDiff} onChange={setClassicDiff} />}
          onPlay={() => navigate('/classic')}
        />

        {/* Grid */}
        <ModeCard
          title="GRID"
          accentClass="border-border"
          accentTextClass="text-ink"
          description="Fill a 3×3 grid. Each cell needs a character matching both its row and column criteria."
          badge={null}
          toggle={<DifficultyToggle value={gridDiff} onChange={setGridDiff} />}
          onPlay={() => navigate('/grid')}
        />

        {/* Pyramid */}
        <ModeCard
          title="PYRAMID"
          accentClass="border-forest"
          accentTextClass="text-forest"
          description="Fill a pyramid tier by tier. Each row has a unique criterion. Pro mode only."
          badge={
            <span className="px-2 py-0.5 text-[10px] font-display tracking-wider rounded-full border border-forest text-forest">
              PRO MODE ONLY
            </span>
          }
          toggle={null}
          onPlay={() => navigate('/pyramid')}
        />
      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-8 px-4 py-3 font-body text-sm text-muted hover:text-ink transition-colors"
      >
        ← Back
      </button>
    </main>
  );
}

interface ModeCardProps {
  title: string;
  accentClass: string;
  accentTextClass: string;
  description: string;
  badge: React.ReactNode;
  toggle: React.ReactNode;
  onPlay: () => void;
}

function ModeCard({
  title,
  accentClass,
  accentTextClass,
  description,
  badge,
  toggle,
  onPlay,
}: ModeCardProps) {
  return (
    <div
      className={`flex flex-col gap-5 bg-surface border-2 ${accentClass} rounded-xl p-8`}
    >
      <div className="flex items-center justify-between">
        <h3 className={`font-display font-black text-2xl tracking-widest ${accentTextClass}`}>
          {title}
        </h3>
        {badge}
      </div>
      <p className="font-body text-base text-muted flex-1 leading-snug">{description}</p>
      {toggle && <div>{toggle}</div>}
      <button
        onClick={onPlay}
        className={`w-full py-4 font-display font-bold text-sm tracking-widest rounded-lg transition-colors border ${accentClass} ${accentTextClass} hover:bg-ink hover:text-surface hover:border-ink`}
      >
        PLAY NOW
      </button>
    </div>
  );
}
