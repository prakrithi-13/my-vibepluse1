import { useState, useEffect } from 'react';
import { PageType, MusicEvent, UserStats, PlatformStats } from './types';
import { INITIAL_EVENTS, INITIAL_USER_STATS, INITIAL_PLATFORM_STATS } from './mockData';
import LandingPage from './components/LandingPage';
import CreateEventPage from './components/CreateEventPage';
import EventDiscoveryPage from './components/EventDiscoveryPage';
import DashboardPage from './components/DashboardPage';
import AdminPage from './components/AdminPage';
import SecureSector from './components/SecureSector';
import { 
  auth, 
  db, 
  loginWithGoogle, 
  logoutUser, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  Monitor, 
  Home, 
  Music, 
  UserCheck, 
  Settings, 
  Plus, 
  LogIn, 
  LogOut, 
  Sparkles, 
  Database,
  Shield,
  Globe,
  X,
  ShieldAlert
} from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('LANDING');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Real Firestore db data
  const [dbEvents, setDbEvents] = useState<MusicEvent[]>([]);
  const [dbRegistrations, setDbRegistrations] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<UserStats>(INITIAL_USER_STATS);
  const [platformStats] = useState<PlatformStats>(INITIAL_PLATFORM_STATS);

  // Unauthorized Auth domain error overlay triggers
  const [authDomainErrorModal, setAuthDomainErrorModal] = useState<string | null>(null);

  // Local fallback states stored in localStorage to persist creations/registrations offline
  const [localEvents, setLocalEvents] = useState<MusicEvent[]>(() => {
    try {
      const saved = localStorage.getItem('vibepulse_local_events');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [localRegistrations, setLocalRegistrations] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('vibepulse_local_registrations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [simulatedUser, setSimulatedUser] = useState<any | null>(() => {
    try {
      const active = localStorage.getItem('vibepulse_sim_active') === 'true';
      if (active) {
        return {
          uid: 'sim_dev_host_user',
          email: localStorage.getItem('vibepulse_sim_email') || 'anchanrameshpoojary@gmail.com',
          emailVerified: true,
          displayName: 'Developer Guest',
          isAnonymous: false,
          providerData: []
        };
      }
    } catch {}
    return null;
  });

  const [simUserStats, setSimUserStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('vibepulse_sim_stats');
      return saved ? JSON.parse(saved) : {
        userId: 'sim_dev_host_user',
        email: 'anchanrameshpoojary@gmail.com',
        registeredEventsCount: 0,
        completedExperiencesCount: INITIAL_USER_STATS.completedExperiencesCount,
        vibePoints: 2100,
        tier: 'Gold',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch {
      return INITIAL_USER_STATS;
    }
  });

  // Keep local backups up to date
  useEffect(() => {
    localStorage.setItem('vibepulse_local_events', JSON.stringify(localEvents));
  }, [localEvents]);

  useEffect(() => {
    localStorage.setItem('vibepulse_local_registrations', JSON.stringify(localRegistrations));
  }, [localRegistrations]);

  useEffect(() => {
    localStorage.setItem('vibepulse_sim_stats', JSON.stringify(simUserStats));
  }, [simUserStats]);

  // Derive active session state
  const currentUser = user || simulatedUser;
  const activeUserStats = user ? userStats : (simulatedUser ? simUserStats : INITIAL_USER_STATS);

  // Monitor Firebase Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync events in real-time from Firestore (with local fallback if permission/read issues)
  useEffect(() => {
    const eventsRef = collection(db, 'events');
    const unsubscribe = onSnapshot(eventsRef, async (snapshot) => {
      const fetchedEvents: MusicEvent[] = [];
      snapshot.forEach((docSnap) => {
        fetchedEvents.push({ id: docSnap.id, ...docSnap.data() } as MusicEvent);
      });

      if (fetchedEvents.length === 0) {
        // Seed initial event documents to firestore if empty
        try {
          for (const evt of INITIAL_EVENTS) {
            await setDoc(doc(db, 'events', evt.id), {
              ...evt,
              createdBy: 'system_seed',
              createdAt: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error("Error seeding public database:", error);
        }
      } else {
        // Sort chronologically using startTime
        fetchedEvents.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        setDbEvents(fetchedEvents);
      }
    }, (error) => {
      // Clean reporting & continue graceful local rendering
      console.warn("Unable to fetch Firestore events. Public list falling back.");
      handleFirestoreError(error, OperationType.LIST, 'events');
    });

    return () => unsubscribe();
  }, []);

  // Sync logged in user profile stats real-time from Firestore
  useEffect(() => {
    if (!user) {
      setUserStats(INITIAL_USER_STATS);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        setUserStats(docSnap.data() as UserStats);
      } else {
        try {
          const initialProfile = {
            userId: user.uid,
            email: user.email || '',
            registeredEventsCount: 0,
            completedExperiencesCount: INITIAL_USER_STATS.completedExperiencesCount,
            vibePoints: INITIAL_USER_STATS.vibePoints,
            tier: INITIAL_USER_STATS.tier,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await setDoc(userDocRef, initialProfile);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });

    return () => unsubscribe();
  }, [user]);

  // Sync registrations index mapped to current authenticating UID
  useEffect(() => {
    if (!user) {
      setDbRegistrations([]);
      return;
    }

    const q = query(collection(db, 'registrations'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRegs: any[] = [];
      snapshot.forEach((docSnap) => {
        fetchedRegs.push(docSnap.data());
      });
      setDbRegistrations(fetchedRegs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'registrations');
    });

    return () => unsubscribe();
  }, [user]);

  // Combined system elements logic
  const events = [...localEvents];
  const sourceEvents = dbEvents.length > 0 ? dbEvents : INITIAL_EVENTS;
  sourceEvents.forEach(dbEvt => {
    if (!events.some(le => le.id === dbEvt.id)) {
      events.push(dbEvt);
    }
  });
  // Sort chronologically using startTime
  events.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  // Aggregate user registrations from DB and simulated local state
  const registrations = currentUser?.uid === 'sim_dev_host_user' 
    ? localRegistrations 
    : [...dbRegistrations, ...localRegistrations];

  // Merge events list database state with current logged-in registrations to derive `isUserRegistered`
  const derivedEvents = events.map(evt => {
    const isRegistered = registrations.some(r => r.eventId === evt.id);
    return {
      ...evt,
      isUserRegistered: isRegistered
    };
  });

  const calculateTier = (points: number): 'Bronze' | 'Silver' | 'Gold' | 'VIP Platinum' => {
    if (points >= 1500) return 'VIP Platinum';
    if (points >= 1000) return 'Gold';
    if (points >= 500) return 'Silver';
    return 'Bronze';
  };

  const handleUpdateVibePoints = async (userId: string, pointsDelta: number) => {
    if (simulatedUser && userId === simulatedUser.uid) {
      setSimUserStats(prev => {
        const nextPoints = Math.max(0, (prev.vibePoints || 0) + pointsDelta);
        const nextTier = calculateTier(nextPoints);
        return {
          ...prev,
          vibePoints: nextPoints,
          tier: nextTier,
          updatedAt: new Date().toISOString()
        };
      });
      return;
    }

    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const statsData = snap.data();
        const nextPoints = Math.max(0, (statsData.vibePoints || 0) + pointsDelta);
        const nextTier = calculateTier(nextPoints);
        await updateDoc(userRef, {
          vibePoints: nextPoints,
          tier: nextTier,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  // Broadcast and Host new sets in Firestore
  const handleAddEvent = async (newEvent: Omit<MusicEvent, 'id' | 'isUserRegistered' | 'currentCapacity'>) => {
    if (!currentUser) {
      alert("Please sign in or use Developer Bypass first to host a set!");
      return;
    }

    const randomId = `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const eventPayload: MusicEvent = {
      ...newEvent,
      id: randomId,
      currentCapacity: 12,
      createdBy: currentUser.uid,
      createdAt: new Date().toISOString()
    };

    if (currentUser.uid === 'sim_dev_host_user') {
      // Simulation mode writing
      setLocalEvents(prev => [eventPayload, ...prev]);
      await handleUpdateVibePoints(currentUser.uid, 200);
      setCurrentPage('DISCOVER');
      return;
    }

    try {
      await setDoc(doc(db, 'events', randomId), eventPayload);
      await handleUpdateVibePoints(currentUser.uid, 200);
      setCurrentPage('DISCOVER');
    } catch (error) {
      console.warn("Firestore write permissions notice: falling back to local simulation mode session.");
      // Gracefully commit locally so application stays fully working
      setLocalEvents(prev => [eventPayload, ...prev]);
      await handleUpdateVibePoints(currentUser.uid, 200);
      setCurrentPage('DISCOVER');
      // Report exception back safely
      handleFirestoreError(error, OperationType.WRITE, `events/${randomId}`);
    }
  };

  // Toggle Admission registration locks inside Firestore database path
  const handleRegisterEvent = async (eventId: string) => {
    if (!currentUser) {
      alert("Please sign in or use Developer Bypass first to secure admission tickets!");
      // Automatically prompt popup login options
      try {
        await loginWithGoogle();
      } catch (err: any) {
        console.error("Login attempt halted", err);
        if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
          setAuthDomainErrorModal(window.location.hostname);
        }
      }
      return;
    }

    const isAlreadyRegistered = registrations.some(r => r.eventId === eventId);
    
    if (currentUser.uid === 'sim_dev_host_user') {
      const targetEvent = events.find(e => e.id === eventId);
      if (!targetEvent) return;

      if (isAlreadyRegistered) {
        setLocalRegistrations(prev => prev.filter(r => r.eventId !== eventId));
        await handleUpdateVibePoints(currentUser.uid, -100);
      } else {
        if (targetEvent.currentCapacity >= targetEvent.maxCapacity) {
          alert("We are sorry, this set broadcast has hit maximum capacity bounds!");
          return;
        }
        const newReg = {
          id: `reg-${currentUser.uid}-${eventId}`,
          eventId: eventId,
          userId: currentUser.uid,
          createdAt: new Date().toISOString()
        };
        setLocalRegistrations(prev => [...prev, newReg]);
        await handleUpdateVibePoints(currentUser.uid, 100);
      }
      return;
    }

    const regDocRef = doc(db, 'registrations', `reg-${currentUser.uid}-${eventId}`);
    const eventDocRef = doc(db, 'events', eventId);

    try {
      const targetEvent = events.find(e => e.id === eventId);
      if (!targetEvent) return;

      if (isAlreadyRegistered) {
        // Cancel Reservation
        await deleteDoc(regDocRef);
        // Reduce Capacity counter
        await updateDoc(eventDocRef, {
          currentCapacity: Math.max(0, targetEvent.currentCapacity - 1)
        });
        // Deduct points
        await handleUpdateVibePoints(currentUser.uid, -100);
      } else {
        // Enforce capacity safety lock check
        if (targetEvent.currentCapacity >= targetEvent.maxCapacity) {
          alert("We are sorry, this set broadcast has hit maximum capacity bounds!");
          return;
        }

        // Write Ticket lock
        await setDoc(regDocRef, {
          id: `reg-${currentUser.uid}-${eventId}`,
          eventId: eventId,
          userId: currentUser.uid,
          createdAt: new Date().toISOString()
        });
        // Scale capacity counter
        await updateDoc(eventDocRef, {
          currentCapacity: targetEvent.currentCapacity + 1
        });
        // Reward Loyalty points
        await handleUpdateVibePoints(currentUser.uid, 100);
      }
    } catch (error) {
      console.warn("Firestore registration failed: falling back to local simulation.");
      // Fallback
      if (isAlreadyRegistered) {
        setLocalRegistrations(prev => prev.filter(r => r.eventId !== eventId));
        await handleUpdateVibePoints(currentUser.uid, -100);
      } else {
        const newReg = {
          id: `reg-${currentUser.uid}-${eventId}`,
          eventId: eventId,
          userId: currentUser.uid,
          createdAt: new Date().toISOString()
        };
        setLocalRegistrations(prev => [...prev, newReg]);
        await handleUpdateVibePoints(currentUser.uid, 100);
      }
      handleFirestoreError(error, OperationType.WRITE, `registrations/reg-${currentUser.uid}-${eventId}`);
    }
  };

  // Explicit cancel subscription action from Dashboard menu options
  const handleDeregisterEvent = async (eventId: string) => {
    if (!currentUser) return;
    
    if (currentUser.uid === 'sim_dev_host_user') {
      setLocalRegistrations(prev => prev.filter(r => r.eventId !== eventId));
      await handleUpdateVibePoints(currentUser.uid, -100);
      return;
    }

    const regDocRef = doc(db, 'registrations', `reg-${currentUser.uid}-${eventId}`);
    const eventDocRef = doc(db, 'events', eventId);

    try {
      const targetEvent = events.find(e => e.id === eventId);
      if (!targetEvent) return;

      await deleteDoc(regDocRef);
      await updateDoc(eventDocRef, {
        currentCapacity: Math.max(0, targetEvent.currentCapacity - 1)
      });
      await handleUpdateVibePoints(currentUser.uid, -100);
    } catch (error) {
      console.warn("Firestore deregistration failed: falling back to local simulation.");
      setLocalRegistrations(prev => prev.filter(r => r.eventId !== eventId));
      await handleUpdateVibePoints(currentUser.uid, -100);
      handleFirestoreError(error, OperationType.DELETE, `registrations/reg-${currentUser.uid}-${eventId}`);
    }
  };

  // Administrative deletion/takedown channel
  const handleDeleteEvent = async (eventId: string) => {
    const targetEvent = events.find(e => e.id === eventId);
    if (!targetEvent) return;

    if (!currentUser) {
      alert("Authenticate to perform custom tasks!");
      return;
    }

    if (targetEvent.createdBy !== currentUser.uid && targetEvent.createdBy !== 'system_seed') {
      alert("Only the verified creator of this set can request immediate takedown!");
      return;
    }

    if (currentUser.uid === 'sim_dev_host_user' || targetEvent.createdBy === 'sim_dev_host_user') {
      setLocalEvents(prev => prev.filter(e => e.id !== eventId));
      return;
    }

    try {
      await deleteDoc(doc(db, 'events', eventId));
    } catch (error) {
      console.warn("Firestore deletion failed: falling back to local simulation.");
      setLocalEvents(prev => prev.filter(e => e.id !== eventId));
      handleFirestoreError(error, OperationType.DELETE, `events/${eventId}`);
    }
  };

  const handleGoogleAuthAction = async () => {
    if (currentUser) {
      if (window.confirm("Do you want to log out from VibePulse Network?")) {
        if (user) {
          await logoutUser();
        } else {
          localStorage.removeItem('vibepulse_sim_active');
          setSimulatedUser(null);
        }
        setCurrentPage('LANDING');
      }
    } else {
      try {
        await loginWithGoogle();
        alert("Google Access Authorization Successful!");
      } catch (err: any) {
        console.error("Login call error:", err);
        if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
          setAuthDomainErrorModal(window.location.hostname);
        } else {
          alert(`Authorization failed. Ensure permission dialog bounds are set.\n\nError: ${err.message || err}`);
        }
      }
    }
  };

  // Set simulated developer user immediately
  const triggerSimulatedLogin = (customEmail?: string) => {
    const emailToUse = customEmail || 'anchanrameshpoojary@gmail.com';
    localStorage.setItem('vibepulse_sim_active', 'true');
    localStorage.setItem('vibepulse_sim_email', emailToUse);
    setSimulatedUser({
      uid: 'sim_dev_host_user',
      email: emailToUse,
      emailVerified: true,
      displayName: 'Developer Guest',
      isAnonymous: false,
      providerData: []
    });
    setAuthDomainErrorModal(null);
    alert(`Simulation active! Welcoming credentialed operator: ${emailToUse}`);
  };

  const activeBookedCount = derivedEvents.filter(e => e.isUserRegistered).length;

  return (
    <div className="min-h-screen relative font-sans bg-[#0F0F12]">
      
      {/* Dynamic Authentication & Database status strip on very top */}
      <div className="bg-[#18181f] border-b border-white/5 px-6 py-2 flex flex-wrap justify-between items-center text-[10px] text-[#d9bfd4]/70 font-mono gap-2 relative z-50">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-[#00eefc]" />
          <span>DATABASE STATE: </span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            FIRESTORE SYNCED
          </span>
          {simulatedUser && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9px] border border-amber-500/20 uppercase font-black tracking-widest">
              Simulated Mode
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {authLoading ? (
            <span className="text-[#ffa9fc]/70">Checking authentication...</span>
          ) : currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-[#ffa9fc] font-bold">User: {currentUser.email}</span>
              <button 
                onClick={handleGoogleAuthAction} 
                className="flex items-center gap-1 px-2.5 py-0.5 border border-white/10 rounded bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer text-[9px]"
              >
                <LogOut className="w-2.5 h-2.5" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAuthDomainErrorModal(window.location.hostname)}
                className="px-2 py-1 text-[9px] font-bold border border-amber-400/20 bg-amber-400/5 text-amber-400 rounded hover:bg-amber-400/10 transition-colors uppercase cursor-pointer"
              >
                Simulate auth
              </button>
              <button 
                onClick={handleGoogleAuthAction}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#ffa9fc]/10 hover:bg-[#ffa9fc]/20 text-[#ffa9fc] border border-[#ffa9fc]/20 rounded-md transition-colors cursor-pointer text-[9px] font-bold tracking-wider uppercase"
              >
                <LogIn className="w-3 h-3" /> Connect Google Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Unauthorized Domain & Simulated Session Gateway Modal Overlay */}
      {authDomainErrorModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-[#13131a] border border-[#f131ff]/30 rounded-2xl p-6 relative shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#f131ff]/10 blur-[60px] rounded-full pointer-events-none"></div>
            
            <button 
              type="button" 
              onClick={() => setAuthDomainErrorModal(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full whitespace-nowrap"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-headline text-base font-bold text-white uppercase tracking-wider">Auth Domain Warning</h3>
                <p className="text-[11px] font-mono text-gray-400">auth/unauthorized-domain</p>
              </div>
            </div>

            <div className="text-xs text-gray-300 space-y-3 mb-6 leading-relaxed">
              <p>
                Firebase Authentication blocks Google Popup operations initiated from unauthorized hostnames. 
                Your current frame origin is:
              </p>
              <div className="p-2.5 rounded bg-black/60 font-mono text-cyan-400 text-[11px] select-all break-all border border-cyan-500/25">
                {authDomainErrorModal}
              </div>
              <div className="space-y-1 p-3 rounded-lg bg-white/5 border border-white/5 text-[11px]">
                <p className="font-bold text-[#ffa9fc] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#00eefc]" /> Permanent Mitigation Steps:
                </p>
                <ol className="list-decimal pl-4 text-gray-400 space-y-1">
                  <li>Navigate to Google Firebase Console</li>
                  <li>Go to Authentication &rarr; Settings &rarr; Authorized Domains</li>
                  <li>Click "Add domain" and enter the sandbox hostname listed above</li>
                </ol>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => triggerSimulatedLogin('anchanrameshpoojary@gmail.com')}
                className="w-full py-3 bg-gradient-to-r from-[#f131ff] to-[#ffa9fc] hover:from-[#c214cf] hover:to-[#ffa9fc] text-black text-xs font-mono font-black rounded-xl uppercase transition-all tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-pink-500/10 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-black" /> Run Developer Fallback Bypass
              </button>
              
              <button
                type="button"
                onClick={() => setAuthDomainErrorModal(null)}
                className="w-full py-2.5 bg-transparent hover:bg-white/5 border border-white/10 text-gray-400 text-xs font-mono font-bold rounded-xl uppercase transition-all"
              >
                Explore Read-Only public data
              </button>
            </div>
            
            <p className="text-[9px] font-mono text-[#d9bfd4]/50 leading-tight text-center mt-4">
              Active simulation sets user to: anchanrameshpoojary@gmail.com
            </p>
          </div>
        </div>
      )}

      {/* Visual Simulation Screen Selector Dock at bottom */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 glass-panel p-2 rounded-2xl flex gap-1.5 items-center shadow-[0_4px_30px_rgba(0,0,0,0.5)] border border-white/10 max-w-[95vw] overflow-x-auto no-scrollbar">
        <div className="px-2 font-mono text-[9px] uppercase tracking-wider text-[#ffa9fc]/70 border-r border-white/10 py-1 font-bold whitespace-nowrap flex items-center gap-1">
          <Monitor className="w-3.5 h-3.5" /> Screens:
        </div>

        <button 
          onClick={() => setCurrentPage('LANDING')}
          className={`px-3 py-2 rounded-xl font-mono text-[9px] uppercase tracking-widest font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            currentPage === 'LANDING' ? 'bg-[#f131ff] text-[#37003b]' : 'hover:bg-white/5 text-[#d9bfd4]'
          }`}
          title="VIBE_PULSE Landing"
        >
          <Home className="w-3 h-3" /> Lobby
        </button>

        <button 
          onClick={() => setCurrentPage('DISCOVER')}
          className={`px-3 py-2 rounded-xl font-mono text-[9px] uppercase tracking-widest font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            currentPage === 'DISCOVER' ? 'bg-[#f131ff] text-[#37003b]' : 'hover:bg-white/5 text-[#d9bfd4]'
          }`}
          title="RHYTHM Pulse Search"
        >
          <Music className="w-3 h-3" /> Search
        </button>

        <button 
          onClick={() => setCurrentPage('CREATE_EVENT')}
          className={`px-3 py-2 rounded-xl font-mono text-[9px] uppercase tracking-widest font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            currentPage === 'CREATE_EVENT' ? 'bg-[#f131ff] text-[#37003b]' : 'hover:bg-white/5 text-[#d9bfd4]'
          }`}
          title="Broadcast Form"
        >
          <Plus className="w-3 h-3" /> Host Form
        </button>

        <button 
          onClick={() => setCurrentPage('DASHBOARD')}
          className={`px-3 py-2 rounded-xl font-mono text-[9px] uppercase tracking-widest font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer relative ${
            currentPage === 'DASHBOARD' ? 'bg-[#ffa9fc] text-[#37003b]' : 'hover:bg-white/5 text-[#d9bfd4]'
          }`}
          title="Volt Events Cockpit"
        >
          <UserCheck className="w-3 h-3" /> Cockpit
          {activeBookedCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#f131ff] text-[8px] text-white flex items-center justify-center font-bold rounded-full border border-[#131316]">
              {activeBookedCount}
            </span>
          )}
        </button>

        <button 
          onClick={() => setCurrentPage('ADMIN')}
          className={`px-3 py-2 rounded-xl font-mono text-[9px] uppercase tracking-widest font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            currentPage === 'ADMIN' ? 'bg-[#ffa9fc] text-[#37003b]' : 'hover:bg-white/5 text-[#d9bfd4]'
          }`}
          title="Volt Admin Dashboard"
        >
          <Settings className="w-3 h-3" /> Operations
        </button>

        <button 
          onClick={() => setCurrentPage('SECURE_SECTOR')}
          className={`px-3 py-2 rounded-xl font-mono text-[9px] uppercase tracking-widest font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            currentPage === 'SECURE_SECTOR' ? 'bg-[#00eefc] text-black' : 'hover:bg-white/5 text-cyan-400'
          }`}
          title="Zero-Trust Threat Simulator"
        >
          <Shield className="w-3 h-3" /> Secure Segment
        </button>
      </div>

      {/* Render subcomponents conditionally based on state */}
      {currentPage === 'LANDING' && (
        <LandingPage 
          events={derivedEvents} 
          onNavigate={setCurrentPage} 
        />
      )}

      {currentPage === 'CREATE_EVENT' && (
        <CreateEventPage 
          onAddEvent={handleAddEvent} 
          onNavigate={setCurrentPage} 
          currentUser={currentUser}
          onLoginGoogle={handleGoogleAuthAction}
        />
      )}

      {currentPage === 'DISCOVER' && (
        <EventDiscoveryPage 
          events={derivedEvents} 
          onRegisterEvent={handleRegisterEvent} 
          onNavigate={setCurrentPage} 
        />
      )}

      {currentPage === 'DASHBOARD' && (
        <DashboardPage 
          events={derivedEvents} 
          userStats={activeUserStats} 
          onNavigate={setCurrentPage} 
          onDeregisterEvent={handleDeregisterEvent} 
        />
      )}

      {currentPage === 'ADMIN' && (
        <AdminPage 
          events={derivedEvents} 
          stats={platformStats} 
          onNavigate={setCurrentPage} 
          onDeleteEvent={handleDeleteEvent} 
        />
      )}

      {currentPage === 'SECURE_SECTOR' && (
        <SecureSector 
          onNavigate={setCurrentPage}
          currentUserEmail={currentUser?.email}
          currentUserId={currentUser?.uid}
        />
      )}
    </div>
  );
}
