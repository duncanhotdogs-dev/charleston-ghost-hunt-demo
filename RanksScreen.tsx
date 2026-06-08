const LEADERBOARD = [
  { rank: 1, name: 'DarkSeer_CHS', spirits: 47 },
  { rank: 2, name: 'BatteryGhost', spirits: 31 },
  { rank: 3, name: 'LowcountryLurker', spirits: 28 },
  { rank: 4, name: 'RainbowRowRunner', spirits: 19 },
  { rank: 5, name: 'HauntedHarbor', spirits: 12 },
];

interface Props {
  garyCaptured: boolean;
}

export default function RanksScreen({ garyCaptured }: Props) {
  const userSpirits = garyCaptured ? 1 : 0;

  return (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{ background: '#0a0303', paddingBottom: 72 }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-3"
        style={{ background: 'rgba(10,3,3,0.95)', borderBottom: '1px solid rgba(139,0,0,0.2)', backdropFilter: 'blur(4px)' }}
      >
        <h1 className="font-cinzel text-lg tracking-widest text-bone text-center">TOP HUNTERS</h1>
        <p className="font-garamond italic text-bone-dim text-xs text-center opacity-60">Charleston's finest ghost hunters</p>
      </div>

      <div className="px-4 py-6">
        {/* Season label */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: 'rgba(139,0,0,0.3)' }} />
          <span className="font-cinzel text-xs text-bone-dim opacity-50 tracking-widest">SEASON I • 2025</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(139,0,0,0.3)' }} />
        </div>

        {/* Top 3 podium-style */}
        <div className="flex items-end justify-center gap-3 mb-6 px-2">
          <PodiumEntry rank={2} name={LEADERBOARD[1].name} spirits={LEADERBOARD[1].spirits} height={80} />
          <PodiumEntry rank={1} name={LEADERBOARD[0].name} spirits={LEADERBOARD[0].spirits} height={100} />
          <PodiumEntry rank={3} name={LEADERBOARD[2].name} spirits={LEADERBOARD[2].spirits} height={65} />
        </div>

        {/* Full list */}
        <div className="space-y-2 mb-6">
          {LEADERBOARD.map((entry, i) => (
            <LeaderboardRow key={entry.rank} entry={entry} position={i} />
          ))}
        </div>

        {/* User row */}
        <div
          className="rounded-lg p-4 flex items-center gap-3"
          style={{
            background: 'rgba(139,0,0,0.1)',
            border: '1px solid rgba(139,0,0,0.4)',
          }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-cinzel text-xs"
            style={{ background: 'rgba(139,0,0,0.3)', color: '#f5f0e8' }}
          >
            —
          </div>
          <div className="flex-1">
            <div className="font-cinzel text-sm text-bone tracking-wide">You</div>
            <div className="font-garamond text-xs text-bone-dim opacity-60">
              {garyCaptured ? 'Gary secured!' : 'Gary incoming?'}
            </div>
          </div>
          <div className="font-cinzel text-sm text-bone">{userSpirits} spirit{userSpirits !== 1 ? 's' : ''}</div>
        </div>
      </div>
    </div>
  );
}

function LeaderboardRow({ entry, position }: { entry: typeof LEADERBOARD[0]; position: number }) {
  const colors = ['#b8860b', '#888', '#a0522d'];
  const rankColor = position < 3 ? colors[position] : 'rgba(139,0,0,0.5)';

  return (
    <div
      className="flex items-center gap-3 rounded-lg p-3"
      style={{
        background: position === 0 ? 'rgba(184,134,11,0.08)' : 'rgba(19,6,6,0.6)',
        border: `1px solid ${position === 0 ? 'rgba(184,134,11,0.3)' : 'rgba(139,0,0,0.2)'}`,
      }}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center font-cinzel text-xs flex-shrink-0"
        style={{ background: `${rankColor}22`, color: rankColor, border: `1px solid ${rankColor}44` }}
      >
        {entry.rank}
      </div>
      <div className="font-cinzel text-sm text-bone flex-1 tracking-wide">{entry.name}</div>
      <div className="font-cinzel text-sm" style={{ color: rankColor }}>{entry.spirits}</div>
      <div className="font-garamond text-xs text-bone-dim opacity-50">spirits</div>
    </div>
  );
}

function PodiumEntry({ rank, name, spirits, height }: { rank: number; name: string; spirits: number; height: number }) {
  const colors = { 1: '#b8860b', 2: '#888', 3: '#a0522d' } as Record<number, string>;
  const color = colors[rank];
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <div className="font-cinzel text-xs text-bone-dim truncate w-full text-center" style={{ fontSize: 9 }}>{name}</div>
      <div className="font-cinzel text-xs" style={{ color }}>{spirits}</div>
      <div
        className="w-full rounded-t flex items-start justify-center pt-2"
        style={{ height, background: `${color}22`, border: `1px solid ${color}44`, borderBottom: 'none' }}
      >
        <span className="font-cinzel font-bold text-base" style={{ color }}>{rank}</span>
      </div>
    </div>
  );
}
