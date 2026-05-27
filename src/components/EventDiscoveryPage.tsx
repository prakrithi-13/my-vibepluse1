import React, { useState } from 'react';
import { PageType, MusicEvent } from '../types';
import { Ticket, MapPin, Calendar, Users, SlidersHorizontal, Info, Check, Sparkles, X, PlusCircle, ArrowUpRight } from 'lucide-react';

interface EventDiscoveryPageProps {
  events: MusicEvent[];
  onRegisterEvent: (eventId: string) => void;
  onNavigate: (page: PageType) => void;
}

export default function EventDiscoveryPage({ events, onRegisterEvent, onNavigate }: EventDiscoveryPageProps) {
  const [filter, setFilter] = useState<'LIVE' | 'UPCOMING' | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventDetails, setSelectedEventDetails] = useState<MusicEvent | null>(null);
  const [showCelebrationTicket, setShowCelebrationTicket] = useState<MusicEvent | null>(null);

  // Filter events based on filter pill and search text
  const filteredEvents = events.filter(evt => {
    // Exclude past mock events from active list in discovery
    const isPast = evt.tag === 'Completed';
    if (isPast) return false;

    // Filter pill matching
    if (filter === 'LIVE') {
      if (evt.tag !== 'Live Now' && evt.id !== 'evt-3') return false;
    } else if (filter === 'UPCOMING') {
      if (evt.tag === 'Live Now' || evt.id === 'evt-3') return false;
    }

    // Search query matching
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = evt.name.toLowerCase().includes(q);
      const matchLoc = evt.location.toLowerCase().includes(q);
      const matchDesc = evt.description.toLowerCase().includes(q);
      return matchName || matchLoc || matchDesc;
    }

    return true;
  });

  const handleRegisterClick = (evt: MusicEvent) => {
    onRegisterEvent(evt.id);
    if (!evt.isUserRegistered) {
      // Trigger instant ticket confirmation toast
      setShowCelebrationTicket(evt);
    }
  };

  const getLeftBorderClass = (id: string, index: number) => {
    if (id === 'evt-3') return 'bg-[#f131ff]'; // neon magenta
    if (id === 'evt-4') return 'bg-[#00eefc]'; // neon cyan
    if (id === 'evt-5') return 'bg-[#a178ff]'; // neon purple
    return index % 2 === 0 ? 'bg-[#f131ff]' : 'bg-[#00eefc]';
  };

  return (
    <div className="relative min-h-screen text-[#e4e1e6] pb-32">
      {/* Top Banner overlay background */}
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-[#ffa9fc]/5 to-transparent pointer-events-none"></div>

      {/* Top Bar Navigation */}
      <header className="sticky top-0 w-full z-50 bg-[#0F0F12]/80 backdrop-blur-xl border-b border-white/10 shadow-[0_0_24px_rgba(255,169,252,0.08)] h-20 flex justify-between items-center px-6 md:px-12">
        <div className="flex items-center gap-3 cursor-pointer active:scale-95 transition-transform" onClick={() => onNavigate('LANDING')}>
          <Ticket className="text-[#ffa9fc] w-8 h-8 rotate-12" />
          <span className="font-headline text-2xl text-[#ffa9fc] font-black tracking-tighter">RHYTHM</span>
        </div>
        
        <nav className="hidden md:flex gap-10 items-center">
          <button onClick={() => onNavigate('LANDING')} className="text-[#d9bfd4] font-mono text-xs uppercase tracking-widest hover:text-[#00eefc] transition-colors">Home</button>
          <button onClick={() => onNavigate('DISCOVER')} className="text-[#ffa9fc] font-mono text-xs uppercase tracking-widest font-bold">Discover</button>
          <button onClick={() => onNavigate('DASHBOARD')} className="text-[#d9bfd4]/80 font-mono text-xs uppercase tracking-widest hover:text-[#ffa9fc] transition-colors">Tickets / Saved</button>
          <button onClick={() => onNavigate('ADMIN')} className="text-[#d9bfd4]/80 font-mono text-xs uppercase tracking-widest hover:text-[#ffa9fc] transition-colors">Operations</button>
        </nav>
        
        <button 
          onClick={() => onNavigate('DASHBOARD')} 
          className="bg-gradient-to-r from-[#f131ff] to-[#ffa9fc] text-[#37003b] px-6 py-2 rounded-full font-mono text-xs font-black tracking-wider hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        >
          My Profile
        </button>
      </header>

      {/* Main Page Layout */}
      <main className="pt-12 max-w-5xl mx-auto px-6">
        
        {/* Header Section */}
        <section className="mb-10 animate-fade-in flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="font-headline text-4xl md:text-5xl font-black text-white hover:opacity-95 transition-opacity tracking-tighter uppercase leading-none">
              PULSING <span className="gradient-text font-black select-all">VIBES</span>
            </h1>
            <p className="font-sans text-xs text-[#d9bfd4]/70 mt-2 max-w-md">
              Discover real-time, high-octane live concerts, festival tours, and deep rhythm sets curated in the district.
            </p>
          </div>

          <button 
            onClick={() => onNavigate('CREATE_EVENT')}
            className="flex items-center gap-2 px-4 py-2 border border-[#ffa9fc]/30 rounded-xl bg-[#ffa9fc]/5 text-[#ffa9fc] text-xs font-mono uppercase tracking-wider hover:bg-[#ffa9fc]/10 transition-all active:scale-95 cursor-pointer ml-auto md:ml-0"
          >
            <PlusCircle className="w-4 h-4" /> Broadcast Your Set
          </button>
        </section>

        {/* Filters and Search Bar Container */}
        <section className="mb-10 p-4 rounded-xl glass-panel flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Pills Tabs list */}
          <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
            <button 
              onClick={() => setFilter('LIVE')}
              className={`px-6 py-2.5 rounded-full font-mono text-[10px] uppercase font-bold tracking-wider transition-all ${
                filter === 'LIVE' 
                  ? 'bg-[#f131ff] text-[#37003b] font-black shadow-[0_0_15px_rgba(241,49,255,0.4)]' 
                  : 'glass-panel text-[#d9bfd4] hover:text-[#f131ff] hover:border-[#f131ff]/40'
              }`}
            >
              LIVE NOW
            </button>
            <button 
              onClick={() => setFilter('UPCOMING')}
              className={`px-6 py-2.5 rounded-full font-mono text-[10px] uppercase font-bold tracking-wider transition-all ${
                filter === 'UPCOMING' 
                  ? 'bg-[#ffa9fc] text-[#37003b] font-black shadow-[0_0_15px_rgba(255,169,252,0.4)]' 
                  : 'glass-panel text-[#d9bfd4] hover:text-[#ffa9fc] hover:border-[#ffa9fc]/40'
              }`}
            >
              UPCOMING
            </button>
            <button 
              onClick={() => setFilter('ALL')}
              className={`px-6 py-2.5 rounded-full font-mono text-[10px] uppercase font-bold tracking-wider transition-all ${
                filter === 'ALL' 
                  ? 'bg-white text-black font-black' 
                  : 'glass-panel text-[#d9bfd4] hover:text-white'
              }`}
            >
              ALL EVENTS
            </button>
          </div>

          {/* Local quick search input */}
          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="Search by artist, city or arena..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-[#131316]/50 border border-white/10 rounded-full text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#ffa9fc]"
            />
            <SlidersHorizontal className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d9bfd4]/50 pointer-events-none" />
          </div>
        </section>

        {/* Vertically Styled Rhythm Event listings */}
        <section className="grid grid-cols-1 gap-8">
          {filteredEvents.length === 0 ? (
            <div className="glass-panel p-12 rounded-xl text-center flex flex-col items-center gap-3">
              <Info className="w-8 h-8 text-[#ffa9fc]" />
              <p className="font-headline font-bold text-lg text-white">No active sets found matching criteria</p>
              <p className="font-sans text-xs text-[#d9bfd4]/60">Try searching for other keywords, or host a new broadcast listing right away.</p>
              <button 
                onClick={() => { setSearchQuery(''); setFilter('ALL'); }}
                className="mt-2 text-xs font-mono text-[#00eefc] hover:underline uppercase tracking-wider"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredEvents.map((evt, idx) => {
              // Calculate registration percentage
              const registeredCount = evt.currentCapacity;
              const maxCount = evt.maxCapacity;
              const ratioPercent = Math.min(100, Math.round((registeredCount / maxCount) * 100)) || 0;

              return (
                <div 
                  key={evt.id} 
                  className="glass-panel p-5 md:p-6 flex flex-col md:flex-row gap-6 relative group rounded-2xl overflow-hidden shadow-lg border border-white/5"
                >
                  {/* Neon Left glowing bounding line bar */}
                  <div className={`absolute top-0 left-0 w-1.5 h-full z-10 ${getLeftBorderClass(evt.id, idx)} shadow-[0_0_12px_rgba(241,49,255,0.4)]`}></div>

                  {/* Right side background ambient glows */}
                  <div className="absolute top-1/2 right-0 w-44 h-44 bg-[#ffa9fc]/2 blur-[50px] rounded-full pointer-events-none"></div>

                  {/* Thumbnail Cover Image with crop layout */}
                  <div className="w-full md:w-[280px] aspect-[4/3] rounded-xl overflow-hidden relative border border-white/5 shadow-inner flex-shrink-0">
                    <img 
                      src={evt.bannerUrl} 
                      alt={evt.name} 
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" 
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                  </div>

                  {/* Detailed Description and Controls */}
                  <div className="flex-1 flex flex-col justify-between pt-1">
                    <div>
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                        <h3 className="font-headline text-lg md:text-xl font-extrabold text-white group-hover:text-[#ffa9fc] transition-colors uppercase italic tracking-wide">
                          {evt.name}
                        </h3>
                        
                        {/* Live, imminent, or schedule tags list */}
                        {(evt.tag === 'Live Now' || evt.id === 'evt-3') ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#ffa9fc]/10 border border-[#ffa9fc]/25 rounded-full select-none shadow-[0_0_8px_rgba(241,49,255,0.08)]">
                            <span className="w-1.5 h-1.5 bg-[#ffa9fc] rounded-full animate-pulse"></span>
                            <span className="font-mono text-[9px] font-bold text-[#ffa9fc] uppercase tracking-wider">Live Now</span>
                          </div>
                        ) : (
                          <span className="font-mono text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 bg-white/5 font-semibold text-[#d9bfd4]/80">
                            {evt.tag || 'Upcoming'}
                          </span>
                        )}
                      </div>

                      {/* Location details */}
                      <div className="flex items-center gap-1.5 text-xs text-[#d9bfd4]/80 mb-4 select-all">
                        <MapPin className="w-3.5 h-3.5 text-[#00eefc]" />
                        <span>{evt.location} <b className="text-white/30 px-1 font-normal">•</b> {evt.address}</span>
                      </div>

                      {/* Real dynamic progress capacity gauge bar */}
                      <div className="mb-6 max-w-md">
                        <div className="flex justify-between items-end mb-1">
                          <span className="font-mono text-[10px] text-[#d9bfd4]/60 uppercase tracking-widest">Capacity Level</span>
                          <span className="font-mono text-[10px] text-[#00eefc] font-bold">
                            {registeredCount} / {maxCount} <span className="text-[#d9bfd4]/40 ml-1 font-normal uppercase">Slots</span>
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className="h-full bg-gradient-to-r from-[#00eefc] to-[#ffa9fc] rounded-full transition-all duration-1000" 
                            style={{ width: `${ratioPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Operational Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button 
                        onClick={() => setSelectedEventDetails(evt)}
                        className="flex-1 h-11 border border-white/10 text-[#d9bfd4] px-5 py-2.5 rounded-full font-mono text-[10px] uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" /> Specs info
                      </button>
                      
                      <button 
                        onClick={() => handleRegisterClick(evt)}
                        className={`flex-1 h-11 px-5 rounded-full font-mono text-[10px] uppercase tracking-widest font-black transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer ${
                          evt.isUserRegistered 
                            ? 'bg-[#00eefc]/15 border border-[#00eefc]/30 text-[#00eefc]'
                            : 'bg-gradient-to-r from-[#ffa9fc] to-[#f131ff] text-[#37003b] shadow-md hover:scale-[1.01]'
                        }`}
                      >
                        {evt.isUserRegistered ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Registered
                          </>
                        ) : (
                          <>
                            Register Now <ArrowUpRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

      {/* MODAL 1: Specs Info details popup */}
      {selectedEventDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel-heavy rounded-2xl w-full max-w-lg p-6 relative border border-white/15 animate-fade-in shadow-2xl">
            <button 
              onClick={() => setSelectedEventDetails(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="mb-4">
              <span className="font-mono text-[10px] text-[#ffa9fc] uppercase tracking-widest font-semibold">Performance Specs</span>
              <h4 className="font-headline text-xl text-white uppercase font-bold mt-1">{selectedEventDetails.name}</h4>
              <p className="font-mono text-xs text-[#00eefc] mt-0.5">${selectedEventDetails.price} Admission Fee</p>
            </div>

            <div className="space-y-4 text-xs md:text-sm">
              <div className="p-3 bg-white/2 rounded-xl border border-white/5 text-[#d9bfd4]">
                <p className="font-semibold text-white mb-1">Acoustic & Vibe:</p>
                <p className="leading-relaxed font-sans text-xs">{selectedEventDetails.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="p-3 bg-white/2 rounded-xl border border-white/5">
                  <span className="text-[#d9bfd4]/50 block uppercase tracking-wider">Start Time</span>
                  <span className="text-white">{new Date(selectedEventDetails.startTime).toLocaleString()}</span>
                </div>
                <div className="p-3 bg-white/2 rounded-xl border border-white/5">
                  <span className="text-[#d9bfd4]/50 block uppercase tracking-wider">End Time</span>
                  <span className="text-white">{new Date(selectedEventDetails.endTime).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 bg-white/2 rounded-xl border border-white/5 space-y-1.5 font-sans text-xs">
                <p className="text-[#d9bfd4]/50 font-mono text-[10px] uppercase">Box Office Contact</p>
                <p className="text-[#ffa9fc] flex items-center gap-1.5">
                  <span className="font-mono">Email:</span> {selectedEventDetails.email}
                </p>
                <p className="text-[#00eefc] flex items-center gap-1.5">
                  <span className="font-mono">Phone:</span> {selectedEventDetails.phone}
                </p>
              </div>
            </div>

            <button 
              onClick={() => {
                handleRegisterClick(selectedEventDetails);
                setSelectedEventDetails(null);
              }}
              className="mt-6 w-full h-11 bg-gradient-to-r from-[#f131ff] to-[#ffa9fc] text-[#37003b] font-headline text-xs font-black rounded-lg uppercase tracking-wider shadow-sm hover:opacity-90 transition-all cursor-pointer"
            >
              {selectedEventDetails.isUserRegistered ? 'DEREGISTER' : 'CONFIRM ENTRY REGISTRATION'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Celebration Ticket generation success trigger overlay */}
      {showCelebrationTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in">
          <div className="relative max-w-md w-full p-6 bg-[#131316] border border-[#00eefc]/30 rounded-2xl shadow-[0_0_35px_rgba(0,238,252,0.2)] text-center space-y-6">
            
            {/* confetti decorations */}
            <div className="absolute top-4 left-6 text-[#ffa9fc] select-none animate-bounce"><Sparkles className="w-5 h-5" /></div>
            <div className="absolute bottom-6 right-8 text-[#00eefc] select-none animate-pulse"><Sparkles className="w-6 h-6" /></div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-[#00eefc]/15 border border-[#00eefc]/30 flex items-center justify-center text-[#00eefc] animate-bounce">
                <Ticket className="w-8 h-8 rotate-12" />
              </div>
              <h3 className="font-headline text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#ffa9fc] to-[#00eefc] uppercase font-black tracking-tight mt-1">
                ADMISSION LOCKED
              </h3>
              <p className="font-sans text-xs text-[#d9bfd4]/80">Your ticket has been generated and credited to your local user database!</p>
            </div>

            {/* High fidelity ticket receipt */}
            <div className="p-5 border border-dashed border-white/10 rounded-xl bg-black/40 text-left font-mono text-xs space-y-3 relative select-all">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#131316] border-l border-white/10 rounded-l-full"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#131316] border-r border-[#00eefc]/30 rounded-r-full"></div>

              <div className="flex justify-between items-center text-[10px] text-[#ffa9fc]">
                <span>TICKET CODE: VP-{showCelebrationTicket.id.toUpperCase()}</span>
                <span>STATUS: PAID</span>
              </div>
              
              <div className="border-b border-white/5 pb-2">
                <p className="text-white font-sans text-sm font-bold uppercase truncate">{showCelebrationTicket.name}</p>
                <p className="text-[#d9bfd4]/60 text-[10px] mt-0.5">{showCelebrationTicket.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-[#d9bfd4]/40 block uppercase">Admission Fee</span>
                  <span className="text-[#00eefc] font-bold">${showCelebrationTicket.price} USD</span>
                </div>
                <div>
                  <span className="text-[#d9bfd4]/40 block uppercase">Rewards Credited</span>
                  <span className="text-emerald-400 font-bold font-mono">+100 VIBE PTS</span>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-center text-[#ffa9fc]/70 uppercase tracking-widest border-t border-white/5">
                © VIBE_PULSE SONIC PASS
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button 
                onClick={() => {
                  setShowCelebrationTicket(null);
                  onNavigate('DASHBOARD');
                }}
                className="w-full h-11 bg-[#00eefc] text-[#00363a] font-headline text-xs font-black rounded-full uppercase tracking-wider shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                Go view in my dashboard
              </button>
              <button 
                onClick={() => setShowCelebrationTicket(null)}
                className="w-full h-11 bg-transparent text-[#d9bfd4] text-xs font-mono uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
              >
                Keep Discovering
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
