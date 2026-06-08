import { useState } from 'react';
import PermissionsModal from './components/PermissionsModal';
import BottomToolbar, { Tab } from './components/BottomToolbar';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import GhostEncounterScreen from './screens/GhostEncounterScreen';
import CapturedScreen from './screens/CapturedScreen';
import VaultScreen from './screens/VaultScreen';
import HuntsScreen from './screens/HuntsScreen';
import RanksScreen from './screens/RanksScreen';

type Screen = 'permissions' | 'home' | 'tabs' | 'encounter' | 'captured';

interface Permissions {
  location: boolean;
  camera: boolean;
  compass: boolean;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('permissions');
  const [permissions, setPermissions] = useState<Permissions>({ location: false, camera: false, compass: false });
  const [activeTab, setActiveTab] = useState<Tab>('hunt');
  const [garyCaptured, setGaryCaptured] = useState(false);
  const [justCaptured, setJustCaptured] = useState(false);
  const [captureDate, setCaptureDate] = useState('');
  const [releaseGhosts, setReleaseGhosts] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  function handlePermissions(results: Permissions) {
    setPermissions(results);
    setScreen('home');
  }

  function handleBeginHunt() {
    setScreen('tabs');
    setActiveTab('hunt');
  }

  function handleCapture() {
    setScreen('encounter');
  }

  function handleCaptured() {
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    setCaptureDate(date);
    setGaryCaptured(true);
    setJustCaptured(true);
    setScreen('captured');
  }

  function handleAddToVault() {
    setScreen('tabs');
    setActiveTab('vault');
  }

  function handleReleaseAll() {
    setGaryCaptured(false);
    setJustCaptured(false);
    setReleaseGhosts(true);
    setScreen('tabs');
    setActiveTab('hunt');
  }

  function handleReleaseAnimationDone() {
    setReleaseGhosts(false);
  }

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    // Reset justCaptured flag once vault is visited
    if (tab === 'vault') {
      setTimeout(() => setJustCaptured(false), 2000);
    }
  }

  if (screen === 'permissions') {
    return <PermissionsModal onComplete={handlePermissions} />;
  }

  if (screen === 'home') {
    return (
      <>
        <HomeScreen onBeginHunt={handleBeginHunt} onSignIn={() => setShowSignIn(true)} />
        {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
      </>
    );
  }

  if (screen === 'encounter') {
    return (
      <GhostEncounterScreen
        onCaptured={handleCaptured}
        onClose={() => setScreen('tabs')}
      />
    );
  }

  if (screen === 'captured') {
    return <CapturedScreen onAddToVault={handleAddToVault} captureDate={captureDate} />;
  }

  // Tabs screen
  return (
    <div className="fixed inset-0" style={{ background: '#0a0303' }}>
      {/* Map (always mounted when in tabs, hidden when other tabs active) */}
      <div style={{ display: activeTab === 'hunt' ? 'block' : 'none', position: 'absolute', inset: 0 }}>
        <MapScreen
          locationGranted={permissions.location}
          onCapture={handleCapture}
          releaseGhosts={releaseGhosts && activeTab === 'hunt'}
          onReleaseAnimationDone={handleReleaseAnimationDone}
          garyCaptured={garyCaptured}
        />
      </div>

      {activeTab === 'vault' && (
        <VaultScreen
          garyCaptured={garyCaptured}
          onReleaseAll={handleReleaseAll}
          justCaptured={justCaptured}
        />
      )}

      {activeTab === 'hunts' && <HuntsScreen />}

      {activeTab === 'ranks' && <RanksScreen garyCaptured={garyCaptured} />}

      <BottomToolbar active={activeTab} onChange={handleTabChange} />

      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
    </div>
  );
}

function SignInModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleSignIn() {
    setLoading(true);
    setMsg('');
    const { supabase } = await import('./lib/supabase');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setMsg(error.message);
    else onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="card-gothic rounded-lg p-6 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-cinzel text-lg text-bone text-center mb-1 tracking-wider">SIGN IN</h2>
        <p className="font-garamond italic text-xs text-bone-dim text-center mb-5 opacity-60">
          Return to your haunting grounds
        </p>

        <div className="space-y-3 mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-transparent rounded px-3 py-3 font-garamond text-sm text-bone outline-none"
            style={{ border: '1px solid rgba(139,0,0,0.4)' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-transparent rounded px-3 py-3 font-garamond text-sm text-bone outline-none"
            style={{ border: '1px solid rgba(139,0,0,0.4)' }}
          />
        </div>

        {msg && <p className="font-garamond text-xs text-red-400 mb-3 text-center">{msg}</p>}

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="btn-red w-full py-3 text-sm mb-3"
        >
          {loading ? 'SIGNING IN...' : 'SIGN IN'}
        </button>

        <button onClick={onClose} className="w-full text-center font-garamond text-xs text-bone-dim opacity-50 py-1">
          Cancel
        </button>
      </div>
    </div>
  );
}
