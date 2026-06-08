import { Map, FlaskConical, Shield, BarChart2, LucideIcon } from 'lucide-react';

export type Tab = 'hunt' | 'vault' | 'hunts' | 'ranks';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'hunt', label: 'HUNT', icon: Map },
  { id: 'vault', label: 'VAULT', icon: FlaskConical },
  { id: 'hunts', label: 'HUNTS', icon: Shield },
  { id: 'ranks', label: 'RANKS', icon: BarChart2 },
];

export default function BottomToolbar({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex"
      style={{
        background: '#0f0505',
        borderTop: '1px solid rgba(139,0,0,0.3)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        const color = isActive ? '#8b0000' : '#4a3535';
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-1 transition-all duration-200"
            style={{ minHeight: 56 }}
          >
            <Icon size={20} color={color} />
            <span
              className="font-cinzel text-[10px] tracking-wider leading-none"
              style={{ color }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
