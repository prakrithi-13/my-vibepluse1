import React, { useState } from 'react';
import { PageType, MusicEvent, UserStats } from '../types';
import { Calendar, CheckCircle, Award, Search, MoreVertical, MapPin, SlidersHorizontal, Trash2, ArrowUpRight, Flame, Volume2 } from 'lucide-react';

interface DashboardPageProps {
  events: MusicEvent[];
  userStats: UserStats;
  onNavigate: (page: PageType) => void;
  onDeregisterEvent: (eventId: string) => void;
}

export default function DashboardPage({ events, userStats, onNavigate, onDeregisterEvent }: DashboardPageProps) {
  const [searchTable, setSearchTable] = useState('');
  const [activeMenuEventId, setActiveMenuEventId] = useState<string | null>(null);

  // Filter registered forthcoming events (excluding past records)
  const upcomingRegistered = events.filter(evt => {
    const isCompleted = evt.tag === 'Completed' || new Date(evt.startTime).getFullYear() < 2026;
    if (isCompleted) return false;
    
    if (!evt.isUserRegistered) return false;

    if (searchTable) {
      const q = searchTable.toLowerCase();
      return evt.name.toLowerCase().includes(q) || 
             evt.location.toLowerCase().includes(q);
    }
    return true;
  });

  // Past completed records list
  const pastExperiences = events.filter(evt => evt.tag === 'Completed' && evt.isUserRegistered);

  const handleToggleMenu = (eventId: string) => {
    if (activeMenuEventId === eventId) {
      setActiveMenuEventId(null);
    } else {
      setActiveMenuEventId(eventId);
    }
  };

  const handleCancelRegistration = (eventId: string) => {
    onDeregisterEvent(eventId);
    setActiveMenuEventId(null);
    alert('Entry admission cancelled successfully. Refund processed to your source account.');
  };

  return (
    <div className="relative min-h-screen text-[#e4e1e6] pb-32">
      {/* Background Decor */}
      <div className="absolute top-24 right-1/4 w-80 h-80 bg-[#ffa9fc]/2 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Top Navigation */}
      <header className="sticky top-0 w-full bg-[#131316]/30 backdrop-blur-[30px] border-b border-white/10 z-50">
        <div className="flex justify-between items-center px-6 md:px-12 w-full max-w-7xl mx-auto h-20">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('LANDING')}>
            <span className="font-headline text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#ffa9fc] to-[#f131ff] font-black tracking-tighter">
              VOLT_EVENTS
            </span>
          </div>
          
          <nav className="flex gap-8 items-center">
            <button onClick={() => onNavigate('DISCOVER')} className="text-[#ffa9fc] font-mono text-xs uppercase tracking-widest font-semibold hover:underline">Explore Sets</button>
            <button onClick={() => onNavigate('CREATE_EVENT')} className="bg-[#ffa9fc]/10 text-[#ffa9fc] font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-xl border border-[#ffa9fc]/20 hover:bg-[#ffa9fc]/20 transition-all">Broadcast</button>
          </nav>
        </div>
      </header>

      {/* Cockpit Canvas Context */}
      <main className="max-w-6xl mx-auto px-6 pt-12">
        
        {/* Welcome Section */}
        <section className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <h2 className="font-headline text-3xl font-extrabold text-white uppercase tracking-tight">User Cockpit</h2>
            <p className="font-sans text-xs text-[#d9bfd4]/70 mt-1">Manage generated tickets, credentials, accumulated vibe scores, and historical stats.</p>
          </div>
          <button 
            onClick={() => onNavigate('DISCOVER')}
            className="px-6 h-11 bg-gradient-to-r from-[#f131ff] to-[#ffa9fc] text-[#37003b] font-headline text-xs font-black rounded-full uppercase tracking-wider shadow-sm active:scale-95 hover:scale-[1.01] transition-all"
          >
            Discover Events
          </button>
        </section>

        {/* Bento-style KPI Widget Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          
          {/* Card 1: Registered Events */}
          <div className="bg-[#0e0e11]/50 p-6 rounded-2xl glass-panel border border-white/5 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#ffa9fc]/10 rounded-xl text-[#ffa9fc] border border-[#ffa9fc]/10">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-widest font-bold text-emerald-400 bg-emerald-400/5 px-2.5 py-1 rounded-full border border-emerald-400/10">
                +2 this month
              </span>
            </div>
            <div>
              <h3 className="font-mono text-3xl font-black text-white">{upcomingRegistered.length + pastExperiences.length}</h3>
              <p className="font-sans text-xs text-[#d9bfd4]/60 mt-1">Registered Events</p>
            </div>
          </div>

          {/* Card 2: Completed Experiences */}
          <div className="bg-[#0e0e11]/50 p-6 rounded-2xl glass-panel border border-white/5 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#00eefc]/10 rounded-xl text-[#00eefc] border border-[#00eefc]/10">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-widest font-bold text-[#00eefc] bg-[#00eefc]/5 px-2.5 py-1 rounded-full border border-[#00eefc]/10">
                92% attendance
              </span>
            </div>
            <div>
              <h3 className="font-mono text-3xl font-black text-white">{userStats.completedExperiencesCount}</h3>
              <p className="font-sans text-xs text-[#d9bfd4]/60 mt-1">Completed Experiences</p>
            </div>
          </div>

          {/* Card 3: Vibe Points */}
          <div className="bg-[#0e0e11]/50 p-6 rounded-2xl glass-panel border border-white/5 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#a178ff]/10 rounded-xl text-[#a178ff] border border-[#a178ff]/10">
                <Award className="w-5 h-5 animate-pulse" />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-widest font-bold text-[#ffa9fc] bg-[#ffa9fc]/5 px-2.5 py-1 rounded-full border border-[#ffa9fc]/15 flex items-center gap-1">
                <Flame className="w-3 h-3 text-[#ffa9fc]" /> {userStats.tier} Tier
              </span>
            </div>
            <div>
              <h3 className="font-mono text-3xl font-black text-white">
                {userStats.vibePoints + (events.filter(e => e.isUserRegistered && e.tag !== 'Completed').length * 100)}
              </h3>
              <p className="font-sans text-xs text-[#d9bfd4]/60 mt-1">Vibe Points (Rewards)</p>
            </div>
          </div>
        </section>

        {/* Dynamic Schedule Table of Upcoming Sets */}
        <section className="bg-[#0e0e11]/40 rounded-2xl border border-white/5 overflow-hidden mb-12">
          
          {/* Table Controls */}
          <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-headline text-lg uppercase text-white font-bold tracking-wider">
              Upcoming Registered Events
            </h3>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d9bfd4]/50" />
              <input 
                type="text" 
                placeholder="Search schedule list..." 
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
                className="w-full bg-[#131316]/60 border border-white/5 pl-9 pr-4 py-2 text-xs text-white rounded-xl focus:outline-none focus:border-[#ffa9fc] focus:ring-1 focus:ring-[#ffa9fc]"
              />
            </div>
          </div>

          {/* Table element */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs sm:text-sm">
              <thead className="bg-white/[0.02] text-[#d9bfd4]/50 border-b border-white/5 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Event Name</th>
                  <th className="px-6 py-4 font-semibold">Scheduled Date</th>
                  <th className="px-6 py-4 font-semibold">Acoustic Venue</th>
                  <th className="px-6 py-4 font-semibold">Registration Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {upcomingRegistered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#d9bfd4]/50 font-sans italic text-xs">
                      No upcoming sets booked. Use the discovery page to locate and lock your admission tickets!
                    </td>
                  </tr>
                ) : (
                  upcomingRegistered.map((evt) => (
                    <tr key={evt.id} className="hover:bg-white/[0.01] transition-all relative">
                      <td className="px-6 py-4 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          <img 
                            src={evt.bannerUrl} 
                            alt={evt.name} 
                            className="w-10 h-7 rounded object-cover border border-white/5 flex-shrink-0" 
                          />
                          <div>
                            <span className="block font-headline text-xs hover:text-[#ffa9fc] cursor-pointer" onClick={() => onNavigate('DISCOVER')}>
                              {evt.name}
                            </span>
                            <span className="font-mono text-[10px] text-[#ffa9fc] uppercase tracking-wider block">
                              Pass Locked
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-[#d9bfd4] whitespace-nowrap">
                        {new Date(evt.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-[#d9bfd4] text-xs">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#00eefc]" />
                          {evt.location.split(',')[0]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ffa9fc]/10 text-[#ffa9fc] border border-[#ffa9fc]/20 uppercase font-mono">
                          Confirmed
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block text-left">
                          <button 
                            onClick={() => handleToggleMenu(evt.id)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-[#d9bfd4] hover:text-white transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {/* Options dropdown */}
                          {activeMenuEventId === evt.id && (
                            <div className="absolute right-0 mt-2 z-20 w-44 rounded-xl border border-white/10 bg-[#131316] p-1.5 shadow-2xl">
                              <button 
                                onClick={() => handleCancelRegistration(evt.id)}
                                className="w-full px-3 py-2 text-left rounded-lg text-xs font-mono uppercase tracking-wider text-red-400 hover:bg-red-400/10 flex items-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Cancel Admission
                              </button>
                              <button 
                                onClick={() => { setActiveMenuEventId(null); onNavigate('DISCOVER'); }}
                                className="w-full px-3 py-2 text-left rounded-lg text-xs font-mono uppercase tracking-wider text-[#00eefc] hover:bg-[#00eefc]/10 flex items-center gap-2 mt-1"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" /> View Specs
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section: Past Completed Experiences */}
        <section className="mb-8">
          <div className="mb-6 flex justify-between items-end border-b border-white/5 pb-3">
            <div>
              <h3 className="font-headline text-lg uppercase text-white font-bold tracking-wider">Past Experiences Completed</h3>
              <div className="h-0.5 w-8 bg-[#00eefc] mt-1.5"></div>
            </div>
            <span className="font-mono text-[9px] text-[#d9bfd4]/40 uppercase">Archived records</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastExperiences.map((evt) => (
              <div 
                key={evt.id}
                className="p-4 rounded-xl glass-panel border border-white/5 flex gap-4 hover:border-white/10 transition-all duration-300"
              >
                <div className="w-24 aspect-[4/3] rounded-lg overflow-hidden border border-white/5 flex-shrink-0">
                  <img src={evt.bannerUrl} alt={evt.name} className="w-full h-full object-cover grayscale opacity-60" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[8px] uppercase tracking-widest font-black text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/10 inline-block mb-1">
                      Completed ✓
                    </span>
                    <h5 className="font-headline text-xs font-bold text-white uppercase truncate">{evt.name}</h5>
                    <p className="font-mono text-[10px] text-[#d9bfd4]/50 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#ffa9fc]" /> {evt.location.split(',')[1] || evt.location}
                    </p>
                  </div>
                  <span className="font-mono text-[9px] text-[#d9bfd4]/60 block mt-1">
                    Checked in: {new Date(evt.startTime).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Embedded footer */}
      <footer className="mt-16 text-center text-xs text-[#d9bfd4]/30 font-mono py-12 border-t border-white/5 bg-[#0e0e11]">
        © 2026 VOLT EVENTS. STAY SYNCED TO YOUR PULSE.
      </footer>
    </div>
  );
}
