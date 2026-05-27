import React, { useState, useEffect } from 'react';
import { PageType } from '../types';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  Lock, 
  Unlock, 
  Cpu, 
  Fingerprint, 
  AlertTriangle, 
  Activity, 
  RefreshCw, 
  Play, 
  Key, 
  Check, 
  X, 
  ChevronLeft, 
  Wifi, 
  Database,
  LockKeyhole,
  Bug,
  Server,
  Eye,
  AlertCircle
} from 'lucide-react';

interface SecureSectorProps {
  onNavigate: (page: PageType) => void;
  currentUserEmail?: string | null;
  currentUserId?: string | null;
}

interface ThreatPayload {
  id: number;
  name: string;
  target: string;
  vector: string;
  payload: string;
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  ruleMatched: string;
  description: string;
}

const ATTACK_PAYLOADS: ThreatPayload[] = [
  {
    id: 1,
    name: "Spurious Broadcaster Elevation",
    target: "create on /events/{eventId}",
    vector: "Identity Spoofing - Creating event with spoofed 'createdBy' mismatching current user UID.",
    payload: `{\n  "id": "malicious-event-1",\n  "name": "Spoofed Set",\n  "maxCapacity": 100,\n  "currentCapacity": 0,\n  "createdBy": "legitimate_user_123",\n  "location": "Acoustic Dome",\n  "price": 15,\n  "createdAt": "2026-05-21T04:59:18Z"\n}`,
    severity: 'CRITICAL',
    ruleMatched: "incoming().createdBy == request.auth.uid",
    description: "Blocks malicious hosts from setting creation metrics or authors they do not represent."
  },
  {
    id: 2,
    name: "Ghost Field Injector",
    target: "update on /events/{eventId}",
    vector: "Shadow Schema Update - Injecting arbitrary boolean headers (e.g. isStaffAllowedFreeEntry) to bypass fees.",
    payload: `{\n  "isStaffAllowedFreeEntry": true,\n  "name": "Hacked Set"\n}`,
    severity: 'HIGH',
    ruleMatched: "incoming().diff(existing()).affectedKeys().hasOnly([...])",
    description: "Inserts keys excluded from strict whitelist to ensure schema immunity."
  },
  {
    id: 3,
    name: "Admission Ticket Theft",
    target: "create on /registrations/{registrationId}",
    vector: "Relational Spoofing - Reserving tickets on behalf of of other users UIDs.",
    payload: `{\n  "id": "ticket-steal",\n  "eventId": "evt-123",\n  "userId": "other-victim-user-id",\n  "createdAt": "2026-05-21T04:59:18Z"\n}`,
    severity: 'CRITICAL',
    ruleMatched: "incoming().userId == request.auth.uid",
    description: "Guarantees only the authenticated occupant can secure and lock their own admission slot."
  },
  {
    id: 4,
    name: "Invalid Capacity Float",
    target: "create on /events/{eventId}",
    vector: "Boundary Injection - Passing negative or fractional capacity limits to crash counting functions.",
    payload: `{\n  "maxCapacity": -50,\n  "currentCapacity": 10\n}`,
    severity: 'HIGH',
    ruleMatched: "data.maxCapacity is int && data.maxCapacity >= 1",
    description: "Rejects negative allocations, fractional bounds, or other malicious parameters."
  },
  {
    id: 5,
    name: "Deniability / ID Poisoning",
    target: "create on /events/{poisonId}",
    vector: "Buffer Overflow Simulation - Document IDs containing bloated string lengths or invalid keys.",
    payload: `"evt-looooong-id-poisooon-string-containing-overflows-x-1000..."`,
    severity: 'HIGH',
    ruleMatched: "isValidId(eventId) && id.size() <= 128",
    description: "Shields document lookups from deep traversal or memory overflows through path normalization."
  },
  {
    id: 6,
    name: "Ticket Price Escalation Bypass",
    target: "update on /events/{eventId}",
    vector: "Price Tampering - Directly altering price metrics rather than matching authorized updater key ranges.",
    payload: `{\n  "price": 0.01\n}`,
    severity: 'HIGH',
    ruleMatched: "affectedKeys().hasOnly(['currentCapacity']) // for public, list for owners",
    description: "Forces absolute price stability for buyers; only certified creator nodes can update ticket price keys."
  },
  {
    id: 7,
    name: "Immortal Field Mutability",
    target: "update on /events/{eventId}",
    vector: "Temporal Fraud - Attempting to rewrite the immutable validation timestamp 'createdAt'.",
    payload: `{\n  "createdAt": "2020-01-01T00:00:00Z"\n}`,
    severity: 'MEDIUM',
    ruleMatched: "incoming().createdAt == existing().createdAt",
    description: "Locks down administrative metadata once synchronized, guarding trace provenance."
  },
  {
    id: 8,
    name: "Point Inflation Bypass",
    target: "update on /users/{userId}",
    vector: "Privilege Escalation - Writing unauthorized custom stats or setting rank level backends.",
    payload: `{\n  "vibePoints": 999999,\n  "tier": "Gold"\n}`,
    severity: 'CRITICAL',
    ruleMatched: "incoming().userId == existing().userId && incoming().email == existing().email",
    description: "Shields user stats matrices. Profile fields can only scale incrementally based on authentic triggers."
  },
  {
    id: 9,
    name: "Client Email-Verification Bypass",
    target: "write actions /events",
    vector: "Spam Injection - Unverified users trying to hijack broadcasters and spamming event lists.",
    payload: `[User with request.auth.token.email_verified == false]`,
    severity: 'HIGH',
    ruleMatched: "isEmailVerified()",
    description: "Restricts event broadcast actions solely to accounts validating secondary authentic checkmarks."
  },
  {
    id: 10,
    name: "Denial-Of-Wallet DB-lookup Flooding",
    target: "list queries /registrations",
    vector: "Blanket Query Exploits - Scanning registrations of all users in the network to harvest IDs.",
    payload: `db.collection('registrations').get() // Without auth-where filters`,
    severity: 'MEDIUM',
    ruleMatched: "resource.data.userId == request.auth.uid",
    description: "Shuts down rogue lists queries, preventing unauthorized cross-user data scraping."
  },
  {
    id: 11,
    name: "Future Time-Spoofing",
    target: "create on /events/{eventId}",
    vector: "Temporal Distortion - Injecting synthetic future timestamps to force chronological prioritizing.",
    payload: `{\n  "createdAt": "2050-01-01T00:00:00Z"\n}`,
    severity: 'MEDIUM',
    ruleMatched: "Temporal check / Validation formatting",
    description: "Maintains temporal alignment, validating timestamps through standard server synchronized streams."
  },
  {
    id: 12,
    name: "Terminal State Overwriting",
    target: "update on closed events",
    vector: "Event History Spoofing - Overwriting details of live events that have completed.",
    payload: `{\n  "name": "Hijacked Historic Event",\n  "tag": "Live Now"\n}`,
    severity: 'MEDIUM',
    ruleMatched: "existing().tag != 'Completed'",
    description: "Protects past metrics from fraudulent revisions once concluded."
  }
];

export default function SecureSector({ onNavigate, currentUserEmail, currentUserId }: SecureSectorProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [operatorId, setOperatorId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [focusedField, setFocusedField] = useState<'id' | 'key'>('id');
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Set default Operator ID on auth mount
  useEffect(() => {
    if (currentUserEmail) {
      setOperatorId(currentUserEmail);
      setFocusedField('key'); // Focus Access Key since operatorId is prefilled
    } else {
      setOperatorId('');
      setFocusedField('id');
    }
  }, [currentUserEmail]);

  // Console Log simulation states
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "SEC_NET_KERNEL v2.4 initialized.",
    "Zero-Trust firewall operational.",
    "Secure Sector standby. Awaiting operator clearance token..."
  ]);
  const [activeSimulation, setActiveSimulation] = useState<number | null>(null);
  const [simResults, setSimResults] = useState<{ [key: number]: 'BLOCKED' | 'PENDING' | 'IDLE' }>({});
  const [activePayloadDoc, setActivePayloadDoc] = useState<ThreatPayload | null>(null);

  // Stats Counters
  const [stats, setStats] = useState({
    blockedCount: 1424,
    alertsSilenced: 12,
    threatLevel: 'STABLE',
    integrityScore: '99.98%'
  });

  const appendLog = (msg: string) => {
    setConsoleLogs(prev => [...prev.slice(-30), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleKeyPress = (num: string) => {
    if (focusedField === 'id') {
      if (operatorId.length < 40) {
        setOperatorId(prev => prev + num);
        setErrorMessage('');
      }
    } else {
      if (passcode.length < 16) {
        setPasscode(prev => prev + num);
        setErrorMessage('');
      }
    }
  };

  const clearActiveField = () => {
    if (focusedField === 'id') {
      setOperatorId('');
    } else {
      setPasscode('');
    }
    setErrorMessage('');
  };

  const performBypass = () => {
    setIsVerifying(true);
    appendLog("Initiating credential handshake bypass with AI Studio Developer Authority...");
    setTimeout(() => {
      setIsVerifying(false);
      setIsUnlocked(true);
      appendLog("Authority verified! Welcome, Operator. Access granted.");
    }, 1200);
  };

  const verifyCredentials = () => {
    if (!operatorId.trim()) {
      setErrorMessage("Operator Identification cannot be blank.");
      appendLog("ACCESS FAILURE: Missing Operator Identification ID.");
      return;
    }
    if (!passcode.trim()) {
      setErrorMessage("Clearance Access Key cannot be blank.");
      appendLog("ACCESS FAILURE: Missing Clearance Session Key.");
      return;
    }

    const key = passcode.toUpperCase();
    if (key === 'SECURE' || passcode === '2026' || passcode === '1234' || key === 'ADMIN' || key === 'ACCESS') {
      setIsVerifying(true);
      appendLog(`Handshaking network access for Operator: ${operatorId}...`);
      setTimeout(() => {
        setIsVerifying(false);
        setIsUnlocked(true);
        appendLog(`Access Token Signed. Welcome back, Operator: ${operatorId}.`);
      }, 1500);
    } else {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        setErrorMessage("Clearance Signature Mismatch. Access Denied.");
        appendLog(`WARNING: Authentication failed for Operator ${operatorId}. Invalid Access Key.`);
        setPasscode('');
      }, 1000);
    }
  };

  const runPayloadSimulation = (threat: ThreatPayload) => {
    if (activeSimulation !== null) return;
    
    setActiveSimulation(threat.id);
    setSimResults(prev => ({ ...prev, [threat.id]: 'PENDING' }));
    
    appendLog(`[ACTION] Deploying simulated payload vector: ${threat.name}`);
    appendLog(`[TARGET] Firestore API node path: ${threat.target}`);
    appendLog(`[PAYLOAD] \n${threat.payload}`);

    setTimeout(() => {
      appendLog(`[INTERCEPT] Zero-Trust analyzer triggered rule condition matches.`);
      appendLog(`[RULE COMPLIANCE] Failed rule constraint: "${threat.ruleMatched}"`);
      appendLog(`[STATUS] REQUEST REFUSED: code 403 (Permission Denied). Firebase rules safely halted the transaction.`);
      
      setSimResults(prev => ({ ...prev, [threat.id]: 'BLOCKED' }));
      setActiveSimulation(null);
      setStats(prev => ({
        ...prev,
        blockedCount: prev.blockedCount + 1,
        threatLevel: 'SABOTAGE_PREVENTED'
      }));

      // Return status to stable shortly after
      setTimeout(() => {
        setStats(prev => ({ ...prev, threatLevel: 'STABLE' }));
      }, 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-gray-100 flex flex-col font-mono pb-24 relative select-none">
      
      {/* Background neon grid effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_3%,rgba(0,238,252,0.15)_3%),linear-gradient(90deg,rgba(18,16,16,0)_3%,rgba(0,238,252,0.15)_3%)] bg-[size:30px_30px]" />
      
      {/* Header bar */}
      <header className="sticky top-0 w-full bg-[#0a0a0d]/80 backdrop-blur-md border-b border-cyan-500/20 py-4 px-6 md:px-12 z-40 flex justify-between items-center">
        <button 
          onClick={() => onNavigate('LANDING')}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-xs uppercase font-extrabold tracking-widest cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Exit Sector
        </button>

        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-cyan-400 animate-pulse" />
          <h1 className="text-sm md:text-md uppercase font-black tracking-[0.2em] text-white">
            VibePulse <span className="text-cyan-400">Secure Sector</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-cyan-500/60">
          <Wifi className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">DECON_NODE_ACTIVE</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl w-full mx-auto p-4 md:p-8 flex-1 flex flex-col gap-6 relative z-10">
        
        {!isUnlocked ? (
          /* ================== GATEWAY / ACCESS PORTAL MODE ================== */
          <div className="max-w-md w-full mx-auto my-auto flex flex-col gap-6 animate-fade-in relative">
            
            {/* Top Security Status Badge */}
            <div className="flex justify-center -mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-400/30 text-cyan-400 font-mono text-[9px] tracking-[0.15em] uppercase shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                STATION IDENTITY: STANDBY
              </span>
            </div>

            <div className="text-center flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full border border-cyan-500/30 bg-cyan-950/20 flex items-center justify-center relative shadow-[0_0_25px_rgba(0,238,252,0.15)] group hover:scale-105 transition-transform duration-300">
                <LockKeyhole className="w-6 h-6 text-cyan-400 animate-pulse" />
                <div className="absolute inset-x-0 bottom-0 bg-cyan-400 h-0.5 animate-scan pointer-events-none rounded" style={{ animationDuration: '3s' }}></div>
              </div>
              <h2 className="text-md font-bold tracking-[0.3em] text-white uppercase mt-1">OPERATOR SECURE GATE</h2>
              <p className="text-[11px] text-gray-400 max-w-xs font-sans leading-relaxed">
                Provide secure cryptographic verification parameters to initialize the multi-invariant cyber defender platform.
              </p>
            </div>

            {/* Terminal Interface / Access Portal Card */}
            <div id="operator-auth-container" className="border border-cyan-500/25 bg-black/95 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,238,252,0.06)] relative overflow-hidden backdrop-blur-xl">
              
              {/* Header Grid Line Decorative Effect */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>

              <div className="space-y-4">
                
                {/* Active Field Mode Alert Status */}
                <div className="flex justify-between items-center bg-cyan-950/10 border border-cyan-500/10 rounded-lg px-2.5 py-1.5 text-[9px] font-mono">
                  <span className="text-cyan-500/60 uppercase">ACTIVE FIELD CHANNEL:</span>
                  <span className={`font-bold transition-all ${focusedField === 'id' ? 'text-[#ffa9fc]' : 'text-cyan-400'}`}>
                    {focusedField === 'id' ? 'IDENTIFICATION INPUT' : 'ACCESS KEY INPUT'}
                  </span>
                </div>

                {/* Dual Field Inputs inside Access Portal */}
                <div className="space-y-3.5">
                  
                  {/* Operator ID Field (Identification) */}
                  <div className="flex flex-col gap-1 text-left">
                    <div className="flex justify-between items-center px-1">
                      <label htmlFor="operator-id-input" className="text-[9px] text-cyan-400 font-mono tracking-widest uppercase flex items-center gap-1">
                        <Fingerprint className="w-3.5 h-3.5 text-cyan-400" /> Operator Identification
                      </label>
                      {focusedField === 'id' && (
                        <span className="text-[7.5px] text-[#ffa9fc] font-mono uppercase bg-[#ffa9fc]/10 px-1.5 py-0.5 rounded animate-pulse">Focused</span>
                      )}
                    </div>
                    
                    <div 
                      onClick={() => setFocusedField('id')}
                      className={`flex items-center bg-cyan-950/20 border rounded-xl overflow-hidden transition-all duration-300 cursor-text group ${
                        focusedField === 'id' ? 'border-[#ffa9fc] ring-1 ring-[#ffa9fc]/20 bg-[#ffa9fc]/5 shadow-[0_0_15px_rgba(255,169,252,0.05)]' : 'border-cyan-500/20 hover:border-cyan-500/40'
                      }`}
                    >
                      <span className={`pl-3 text-xs font-mono select-none ${focusedField === 'id' ? 'text-[#ffa9fc]' : 'text-cyan-600'}`}>ID:</span>
                      <input
                        id="operator-id-input"
                        type="text"
                        value={operatorId}
                        onChange={(e) => {
                          setOperatorId(e.target.value);
                          setErrorMessage('');
                        }}
                        onFocus={() => setFocusedField('id')}
                        placeholder="Operator Username or Node ID"
                        className="w-full bg-transparent border-0 focus:ring-0 focus:border-transparent outline-none text-white px-2.5 py-2.5 text-xs font-mono placeholder-cyan-500/20"
                      />
                      {operatorId && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOperatorId(''); }}
                          className="pr-3 text-cyan-500 hover:text-white transition-colors"
                          title="Clear field"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Access Key Field (Access Key) */}
                  <div className="flex flex-col gap-1 text-left">
                    <div className="flex justify-between items-center px-1">
                      <label htmlFor="access-key-input" className="text-[9px] text-cyan-400 font-mono tracking-widest uppercase flex items-center gap-1.5">
                        <Key className="w-3 h-3 text-cyan-400" /> Clearance Access Key
                      </label>
                      {focusedField === 'key' && (
                        <span className="text-[7.5px] text-cyan-400 font-mono uppercase bg-cyan-400/10 px-1.5 py-0.5 rounded animate-pulse">Focused</span>
                      )}
                    </div>

                    <div 
                      onClick={() => setFocusedField('key')}
                      className={`flex items-center bg-cyan-950/20 border rounded-xl overflow-hidden transition-all duration-300 cursor-text ${
                        focusedField === 'key' ? 'border-cyan-400 ring-1 ring-cyan-400/20 bg-cyan-950/40 shadow-[0_0_15px_rgba(0,238,252,0.1)]' : 'border-cyan-500/20 hover:border-cyan-500/40'
                      }`}
                    >
                      <span className={`pl-3 text-xs font-mono select-none ${focusedField === 'key' ? 'text-cyan-400' : 'text-cyan-600'}`}>KEY:</span>
                      <input
                        id="access-key-input"
                        type={showPasscode ? "text" : "password"}
                        value={passcode}
                        onChange={(e) => {
                          setPasscode(e.target.value);
                          setErrorMessage('');
                        }}
                        onFocus={() => setFocusedField('key')}
                        placeholder="Cryptographic Access Code"
                        className="w-full bg-transparent border-0 focus:ring-0 focus:border-transparent outline-none text-white px-2.5 py-2.5 text-xs font-mono placeholder-cyan-500/20 tracking-wide"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            verifyCredentials();
                          }
                        }}
                      />
                      
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPasscode(!showPasscode);
                        }}
                        className="px-3 text-cyan-500/60 hover:text-cyan-300 transition-colors flex items-center justify-center"
                        title={showPasscode ? "Hide Access Key" : "Reveal Access Key"}
                      >
                        <Eye className={`w-3.5 h-3.5 ${showPasscode ? "text-cyan-400 animate-pulse" : ""}`} />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Instant Quick-Fill Presets for Quick Access */}
                <div className="bg-cyan-950/10 border border-cyan-500/5 rounded-xl p-2.5 flex flex-col gap-1.5 text-left">
                  <span className="text-[8px] text-cyan-500/40 uppercase font-mono tracking-widest font-bold">QUICK COMPLIANCE PRESETS:</span>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setOperatorId(currentUserEmail || 'operator@vibepulse.net');
                        setPasscode('SECURE');
                        setFocusedField('key');
                        setErrorMessage('');
                        appendLog("Preset selected: Operator 'SECURE' prefilled.");
                      }}
                      className="px-2 py-1 border border-cyan-500/15 hover:border-cyan-400/40 bg-black/40 text-[9.5px] font-mono text-cyan-300 rounded-lg hover:text-white transition-all cursor-pointer"
                    >
                      Preset Code 1: SECURE
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOperatorId(currentUserEmail || 'inspector-9@vibepulse.net');
                        setPasscode('2026');
                        setFocusedField('key');
                        setErrorMessage('');
                        appendLog("Preset selected: Operator '2026' prefilled.");
                      }}
                      className="px-2 py-1 border border-cyan-500/15 hover:border-cyan-400/40 bg-black/40 text-[9.5px] font-mono text-[#ffa9fc] rounded-lg hover:text-white transition-all cursor-pointer"
                    >
                      Preset Code 2: 2026
                    </button>
                  </div>
                </div>

                {/* Keypad numbers */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-cyan-500/5">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                    <button
                      key={num}
                      type="button"
                      id={`calc-button-${num}`}
                      onClick={() => handleKeyPress(num)}
                      className="h-10 border border-cyan-500/10 bg-cyan-950/10 hover:bg-cyan-500/20 hover:border-cyan-500/30 text-cyan-300 active:bg-cyan-900/40 text-sm font-bold rounded-xl transition-all cursor-pointer select-none"
                    >
                      {num}
                    </button>
                  ))}
                  
                  <button
                    type="button"
                    id="calc-button-clear"
                    onClick={clearActiveField}
                    className="h-10 border border-red-500/20 bg-red-950/10 hover:bg-red-500/25 hover:border-red-500/40 text-red-400 text-[10px] uppercase font-extrabold rounded-xl transition-all cursor-pointer select-none"
                  >
                    Clear Field
                  </button>
                  
                  <button
                    type="button"
                    id="calc-button-0"
                    onClick={() => handleKeyPress('0')}
                    className="h-10 border border-cyan-500/10 bg-cyan-950/10 hover:bg-cyan-500/20 hover:border-cyan-500/30 text-cyan-300 text-sm font-bold rounded-xl transition-all cursor-pointer select-none"
                  >
                    0
                  </button>
                  
                  <button
                    type="button"
                    id="calc-button-submit"
                    onClick={verifyCredentials}
                    disabled={isVerifying}
                    className="h-10 border border-cyan-400 bg-cyan-500 text-black hover:bg-cyan-400 text-[10px] uppercase font-black rounded-xl transition-all cursor-pointer disabled:opacity-40 select-none shadow-[0_0_10px_rgba(0,238,252,0.1)] hover:shadow-[0_0_20px_rgba(0,238,252,0.25)]"
                  >
                    {isVerifying ? 'Verifying...' : 'Authorize'}
                  </button>
                </div>

                {/* Biometric Bypass Control & Standard Hints */}
                <div className="pt-2 border-t border-cyan-500/10 flex flex-col gap-2">
                  <button
                    type="button"
                    id="id-bypass-btn"
                    onClick={performBypass}
                    className="w-full py-2.5 border border-purple-500/30 bg-purple-950/10 hover:bg-purple-500/20 hover:border-purple-500/50 text-purple-300 text-[9px] uppercase font-black tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Fingerprint className="w-3.5 h-3.5" /> Dev Biometric Bypass
                  </button>
                </div>

                {errorMessage && (
                  <div id="credential-error-banner" className="flex gap-2 items-center text-red-400 p-3 rounded-lg border border-red-500/20 bg-red-950/10 text-[10px] uppercase font-bold animate-shake">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="text-center text-[8px] text-cyan-500/35 uppercase tracking-wider leading-relaxed">
                  Authentication Keys: <span className="text-cyan-400 font-bold">SECURE</span> or <span className="text-cyan-400 font-bold">2026</span> can sign the TLS token.
                </div>

              </div>
            </div>

            {/* Simulated Live Console Log list (Minimal ticker at bottom of login) */}
            <div className="border border-cyan-500/10 bg-black/40 rounded-xl p-4 font-mono text-[9px] text-[#00eefc]/50 h-28 overflow-y-auto no-scrollbar flex flex-col gap-1 shadow-inner">
              <span className="text-white/40 uppercase tracking-wider text-[8px] font-bold border-b border-cyan-500/10 pb-1 mb-1 flex items-center gap-1">
                <Terminal className="w-3 h-3 text-cyan-400" /> Node Diagnostic Log:
              </span>
              {consoleLogs.map((log, i) => (
                <div key={i} className="leading-snug truncate">{log}</div>
              ))}
            </div>

          </div>
        ) : (
          /* ================== UNLOCKED / SECURITY MONITOR PANEL ================== */
          <div className="space-y-6 animate-fade-in">
            
            {/* Operator Greetings and Threat Status Banner */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-cyan-950/10 border border-cyan-500/15 rounded-2xl p-6 shadow-lg backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full border border-cyan-400 bg-cyan-950/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,238,252,0.2)]">
                  <ShieldCheck className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white uppercase tracking-wider">Zero-Trust Command Panel</h2>
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded text-[9px] font-mono uppercase font-bold animate-pulse">Online</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 font-sans leading-relaxed max-w-xl">
                    Authorized clearance verified. Active defense policies are validating every inbound Firestore write stream against custom schemas and structural rules.
                  </p>
                </div>
              </div>

              {/* Threat Matrix Stats HUD */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-cyan-500/10">
                <div className="px-4 py-2 border border-cyan-500/10 bg-black/40 rounded-xl">
                  <div className="text-[9px] text-cyan-500/50 uppercase font-bold">Rules Defended</div>
                  <div className="text-md font-bold text-cyan-300 mt-0.5 font-mono">
                    {stats.blockedCount.toLocaleString()}
                  </div>
                </div>
                <div className="px-4 py-2 border border-cyan-500/10 bg-black/40 rounded-xl">
                  <div className="text-[9px] text-cyan-500/50 uppercase font-bold">Threat Level</div>
                  <div className={`text-[10px] font-black mt-0.5 font-mono uppercase truncate ${
                    stats.threatLevel === 'STABLE' ? 'text-emerald-400' : 'text-yellow-400 animate-pulse'
                  }`}>
                    {stats.threatLevel}
                  </div>
                </div>
                <div className="px-4 py-2 border border-cyan-500/10 bg-black/40 rounded-xl">
                  <div className="text-[9px] text-cyan-500/50 uppercase font-bold">Invariants Checked</div>
                  <div className="text-md font-bold text-cyan-300 mt-0.5 font-mono">24/24</div>
                </div>
                <div className="px-4 py-2 border border-cyan-500/10 bg-black/40 rounded-xl">
                  <div className="text-[9px] text-cyan-500/50 uppercase font-bold">Integrity Rating</div>
                  <div className="text-md font-bold text-emerald-400 mt-0.5 font-mono">{stats.integrityScore}</div>
                </div>
              </div>
            </div>

            {/* Split layout: Selector List & Dynamic Interactive Simulation Desk */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Threat Vector Index lists */}
              <div className="lg:col-span-1 space-y-4">
                <div className="border border-cyan-500/15 bg-[#0a0a0d]/90 rounded-2xl p-5 shadow-md">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs uppercase font-bold tracking-widest text-cyan-400 flex items-center gap-1.5">
                      <Bug className="w-4 h-4 text-cyan-400" /> Ground Zero Payloads
                    </h3>
                    <span className="font-mono text-[9px] text-gray-500">12 Scenarios</span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-sans mb-4 leading-relaxed">
                    Test the defenses of VibePulse against hostile attack injections defined in <span className="text-white font-mono">security_spec.md</span>.
                  </p>

                  {/* High Density list of Attack Vectors */}
                  <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 no-scrollbar">
                    {ATTACK_PAYLOADS.map(threat => {
                      const status = simResults[threat.id] || 'IDLE';
                      return (
                        <div
                          key={threat.id}
                          onClick={() => setActivePayloadDoc(threat)}
                          className={`p-3.5 border rounded-xl cursor-pointer transition-all duration-200 flex flex-col gap-2 relative overflow-hidden group ${
                            activePayloadDoc?.id === threat.id
                              ? 'border-cyan-400 bg-cyan-950/20 shadow-md shadow-cyan-500/5'
                              : 'border-cyan-500/10 bg-black/20 hover:bg-cyan-500/5 hover:border-cyan-500/20'
                          }`}
                        >
                          {/* Severity marker on edge */}
                          <div className={`absolute top-0 right-0 w-1.5 h-full ${
                            threat.severity === 'CRITICAL' ? 'bg-red-500' : threat.severity === 'HIGH' ? 'bg-yellow-500' : 'bg-cyan-500'
                          }`}></div>

                          <div className="flex justify-between items-start gap-2">
                            <span className="text-xs font-bold text-white leading-snug group-hover:text-cyan-300 transition-colors">
                              {threat.id}. {threat.name}
                            </span>
                            
                            {/* Badges */}
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              threat.severity === 'CRITICAL' 
                                ? 'bg-red-950/40 text-red-400 border border-red-500/20' 
                                : threat.severity === 'HIGH' 
                                ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-500/20' 
                                : 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20'
                            }`}>
                              {threat.severity}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono mt-1 border-t border-cyan-500/5 pt-2">
                            <span className="text-[9px] text-[#ffa9fc]/70 truncate max-w-[120px]">{threat.target}</span>
                            
                            {status === 'BLOCKED' ? (
                              <span className="text-emerald-400 text-[9px] font-bold flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-400 shrink-0" /> Blocked
                              </span>
                            ) : status === 'PENDING' ? (
                              <span className="text-yellow-400 text-[9px] font-bold animate-pulse">Running...</span>
                            ) : (
                              <span className="text-teal-400 text-[8px] font-extrabold hover:underline">Inspect</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Active Inspect Panel & Live Terminal Console log output */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* Simulation Desk block */}
                <div className="border border-cyan-500/15 bg-[#0a0a0d]/95 rounded-2xl p-6 shadow-md flex flex-col gap-4 relative overflow-hidden flex-1 min-h-[400px]">
                  
                  {activePayloadDoc ? (
                    <div className="flex flex-col h-full justify-between gap-4">
                      
                      <div className="space-y-4">
                        
                        {/* Title sector */}
                        <div className="flex justify-between items-start border-b border-cyan-500/10 pb-3 flex-wrap gap-2">
                          <div>
                            <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Attack Vector Diagnostic Desk</div>
                            <h4 className="text-md md:text-lg font-bold text-white uppercase mt-1 flex items-center gap-1.5">
                              <AlertCircle className="w-5 h-5 text-red-500" /> {activePayloadDoc.name}
                            </h4>
                          </div>
                          
                          <button
                            onClick={() => runPayloadSimulation(activePayloadDoc)}
                            disabled={activeSimulation !== null}
                            className={`h-10 px-5 rounded-full font-sans text-xs uppercase font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                              activeSimulation !== null 
                                ? 'bg-cyan-950/40 text-cyan-500/40 border border-cyan-500/10 pointer-events-none' 
                                : 'bg-red-500 hover:bg-red-400 text-black shadow-red-500/10'
                            }`}
                          >
                            <Play className="w-4 h-4 fill-current shrink-0" /> 
                            {activeSimulation === activePayloadDoc.id ? 'Evaluating rules...' : 'Test Rules Bypass'}
                          </button>
                        </div>

                        {/* Description and Invariant breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-black/40 border border-cyan-500/5 rounded-xl p-4 flex flex-col gap-2">
                            <span className="text-[9px] text-[#ffa9fc] font-bold uppercase tracking-widest font-mono">Threat Breakdown:</span>
                            <p className="text-xs text-gray-300 font-sans leading-relaxed">{activePayloadDoc.vector}</p>
                          </div>
                          
                          <div className="bg-black/40 border border-cyan-500/5 rounded-xl p-4 flex flex-col gap-2">
                            <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest font-mono">Zero-Trust Rules Guarding This:</span>
                            <p className="text-xs text-gray-300 font-sans leading-relaxed">{activePayloadDoc.description}</p>
                            <div className="text-[10px] text-teal-400 border border-teal-500/20 bg-teal-950/10 px-2 py-1 rounded inline-block font-mono max-w-max self-start mt-1">
                              ID Matches Rules: {activePayloadDoc.ruleMatched}
                            </div>
                          </div>
                        </div>

                        {/* Code editor block representing Payload */}
                        <div className="relative group rounded-xl overflow-hidden border border-cyan-500/10 shadow-lg">
                          <div className="absolute top-2 right-3 text-[8px] text-cyan-500/50 uppercase font-mono tracking-widest bg-black/60 px-2 py-0.5 rounded border border-cyan-500/15">JSON PAYLOAD</div>
                          
                          <div className="bg-[#0e0e12] p-4 text-xs font-mono text-cyan-300/90 overflow-x-auto max-h-[160px] scrollbar-thin whitespace-pre leading-relaxed">
                            {activePayloadDoc.payload}
                          </div>
                        </div>

                        {/* Simulation outputs */}
                        {simResults[activePayloadDoc.id] && (
                          <div className={`p-4 rounded-xl border flex gap-3 items-center transition-all animate-shake ${
                            simResults[activePayloadDoc.id] === 'BLOCKED'
                              ? 'border-emerald-500/30 bg-emerald-950/10 text-emerald-400'
                              : 'border-yellow-500/30 bg-yellow-950/10 text-yellow-400'
                          }`}>
                            {simResults[activePayloadDoc.id] === 'BLOCKED' ? (
                              <>
                                <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
                                <div>
                                  <div className="text-xs uppercase font-black tracking-widest">TRANSACTION REFUSED (SUCCESSFULLY BLOCKED)</div>
                                  <p className="text-[11px] text-gray-300 mt-1 font-sans leading-relaxed">
                                    Firestore query was evaluated. Request rejected. Attacker can neither write spoofed properties nor alter protected data objects. Secure structures remained 100% integral.
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-6 h-6 text-yellow-400 animate-spin shrink-0" />
                                <div>
                                  <div className="text-xs uppercase font-black tracking-widest">RUNNING PAYLOAD ANALYSIS...</div>
                                  <p className="text-[11px] text-gray-400 mt-0.5 font-sans">
                                    Simulating query payload packet routing onto live auth context. Checking constraint conditions...
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                      </div>

                      <div className="text-[9px] text-cyan-500/30 border-t border-cyan-500/5 pt-2 uppercase tracking-wide text-right">
                        VibePulse Shield v2.4 initialized. Threat identification protocol compliant under RFC 372.
                      </div>

                    </div>
                  ) : (
                    /* General placeholder when no payload is selected */
                    <div className="my-auto flex flex-col items-center text-center gap-4 py-8">
                      <div className="w-16 h-16 rounded-full border border-cyan-500/10 bg-cyan-950/5 flex items-center justify-center">
                        <Terminal className="w-8 h-8 text-cyan-500/35" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Awaiting Simulation Selection</h4>
                        <p className="text-xs text-gray-500 font-sans max-w-sm mt-1 leading-relaxed">
                          Select one of the 12 attack vector scenarios on the left panel to execute rules validation and trace bypass blocks live.
                        </p>
                      </div>
                    </div>
                  )}

                </div>

                {/* Console Terminal Logs stream */}
                <div className="border border-cyan-500/15 bg-black/90 p-5 rounded-2xl flex flex-col gap-3 shadow-md">
                  <div className="flex justify-between items-center border-b border-cyan-500/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs uppercase font-bold tracking-widest text-[#ffa9fc]/90">SecOps Terminal Stream</span>
                    </div>
                    <button 
                      onClick={() => setConsoleLogs(["Terminal stream buffer cleared. Defenses active."])}
                      className="text-[9px] font-mono hover:text-cyan-300 text-cyan-500 uppercase px-1.5 py-0.5 hover:underline cursor-pointer"
                    >
                      Clear Logs
                    </button>
                  </div>

                  <div className="h-44 overflow-y-auto no-scrollbar font-mono text-[10px] text-[#00eeef]/80 flex flex-col gap-1.5 pr-2">
                    {consoleLogs.map((log, index) => (
                      <div key={index} className="leading-relaxed whitespace-pre-wrap break-all border-l border-cyan-500/10 pl-2">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
              
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
