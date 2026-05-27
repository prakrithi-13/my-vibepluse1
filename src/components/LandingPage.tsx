import { MusicEvent, PageType } from '../types';
import { Volume2, Mic, Disc, Tent, ArrowRight, MapPin, Share2, Bell, Lock } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  events: MusicEvent[];
  onNavigate: (page: PageType) => void;
}

export default function LandingPage({ events, onNavigate }: LandingPageProps) {
  // Filter trending events (excluding past ones)
  const trendingEvents = events.filter(e => e.id === 'evt-1' || e.id === 'evt-2');

  return (
    <div className="relative min-h-screen text-[#e4e1e6] pb-32">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-[300px] h-[300px] bg-[#f131ff]/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-[#00eefc]/5 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <img 
          className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-overlay"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQux6aiuiKEVskhNJlvEYXAsQHi89KRWZotc9238-5tBoJTHrNouSmimVoRjMqNHSoCbviSuXInVvr-BVkJjyoYBxZ8_lS6iCyEMCiQWoyRC2kuOwRbrvIwR3oiBjVY14WTKxu8rYZupDjAoW7GG7wqzaN1KA44WfFRwGHDZil0Z4RojpjqxMgDuFAPfGhHYgOZoOLpAUZaPeeCKjhPltU3ekesYtVsE87RFx84RcUgfhFvfrzMDTrAOx1oOsnPIh6KPzD4xRDbg"
          alt="Concert background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#131316]/40 via-[#0F0F12] to-[#0F0F12]"></div>
      </div>

      {/* TopAppBar Navigation */}
      <header className="sticky top-0 w-full h-20 z-50 bg-[#131316]/30 backdrop-blur-[30px] border-b border-white/10">
        <div className="flex justify-between items-center px-6 md:px-12 w-full max-w-7xl mx-auto h-full">
          <div className="flex items-center gap-2 cursor-pointer" id="brand-logo" onClick={() => onNavigate('LANDING')}>
            <Volume2 className="text-[#ffa9fc] w-8 h-8 animate-pulse" />
            <h1 className="font-headline text-2xl font-black tracking-tighter text-[#ffa9fc]">VIBE_PULSE</h1>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onNavigate('SECURE_SECTOR')} 
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/10 hover:bg-cyan-950/25 font-mono uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(0,238,252,0.1)] cursor-pointer"
              title="Enter Zero-Trust Secure Sector"
            >
              <Lock className="w-3 h-3 text-cyan-400" /> Secure Sector
            </button>
            <button 
              onClick={() => onNavigate('ADMIN')} 
              className="text-xs transition-colors hover:text-[#ffa9fc] px-3 py-1.5 rounded-full border border-white/5 bg-white/5 font-mono uppercase tracking-wider"
            >
              Operations Panel
            </button>
            <button 
              onClick={() => onNavigate('DASHBOARD')} 
              className="font-mono text-sm font-medium text-[#d9bfd4] hover:text-[#f131ff] transition-colors"
            >
              My Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center pt-16 px-6 overflow-hidden">
        <div className="relative z-10 text-center flex flex-col items-center gap-8 max-w-xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border-white/5 mb-2 shadow-[0_0_15px_rgba(241,49,255,0.1)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f131ff] animate-pulse shadow-[0_0_8px_#f131ff]"></span>
            <span className="font-mono text-[10px] text-[#f131ff] uppercase tracking-widest font-semibold">Live Now</span>
          </div>

          <h2 className="font-headline text-4xl md:text-6xl tracking-tight uppercase font-extrabold leading-none">
            Feel the <span className="gradient-text font-black">Pulse.</span>
          </h2>

          <p className="font-sans text-[#d9bfd4]/90 text-sm md:text-base leading-relaxed px-4">
            Experience the raw energy of live music. From underground DJ sets to massive festivals, find your rhythm and live the frequencies.
          </p>

          <div className="flex flex-col w-full gap-3 pt-4 sm:max-w-md">
            <button 
              onClick={() => onNavigate('CREATE_EVENT')} 
              className="w-full h-14 bg-gradient-to-r from-[#f131ff] to-[#ffa9fc] text-[#37003b] font-headline text-lg font-extrabold rounded-full shadow-lg neon-glow-primary active:scale-95 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
            >
              Create Event
            </button>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => onNavigate('DISCOVER')} 
                className="flex-1 h-14 bg-[#1f1f22] text-[#e4e1e6] border border-white/10 font-headline text-md rounded-full hover:bg-white/5 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Find Events
              </button>
              <button 
                onClick={() => onNavigate('DASHBOARD')} 
                className="flex-1 h-14 bg-transparent border border-[#ffa9fc]/30 text-[#ffa9fc] font-headline text-md rounded-full hover:bg-[#ffa9fc]/5 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
          <div>
            <h3 className="font-headline text-2xl uppercase tracking-wider text-white">Categories</h3>
            <div className="h-1 w-12 bg-[#f131ff] rounded-full mt-1.5"></div>
          </div>
          <button 
            onClick={() => onNavigate('DISCOVER')}
            className="font-mono text-xs text-[#d9bfd4] flex items-center gap-1 hover:text-[#00eefc] transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Card: Live Concerts */}
          <div 
            onClick={() => onNavigate('DISCOVER')} 
            className="relative overflow-hidden h-40 rounded-2xl group cursor-pointer border border-white/5 shadow-md"
          >
            <img 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-40 group-hover:opacity-50"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2U-vlcB9JNDI03hHBkOzwYE4Fe1Y1OJ83iUEeJRQWSQ6zLljCfdxq6XYZHNosJFyA4ZYAdt43Nrk0MribnjfaKsao6MAToUppg-K-50mgdHNrNdB6HxxVgtGOvCmmk4Uxnov6D35hpq9FAjEfWGoiNIKfEnFMrL-NjKcc0a-ypEveZdC2rVktuwu1TDvBwHMVnJYP53ipdRWt6FtO5KFtX2NuE8iBooMnmKAAcvWXSaj6LSEhF57eyRbLeakhjAVETSCBP0tnNA"
              alt="Live Concert Category"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#00dbe9]/80 to-transparent"></div>
            <div className="relative h-full flex flex-col justify-between p-6 z-10">
              <div className="bg-black/40 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center border border-white/10">
                <Mic className="text-white w-5 h-5" />
              </div>
              <div>
                <h4 className="font-headline text-lg text-white uppercase italic tracking-wider">Live Concerts</h4>
                <p className="font-mono text-[11px] text-[#secondary-fixed]/90">142 Events nearby</p>
              </div>
            </div>
          </div>

          {/* Category Card: DJ Sets */}
          <div 
            onClick={() => onNavigate('DISCOVER')} 
            className="relative overflow-hidden h-40 rounded-2xl group cursor-pointer border border-white/5 shadow-md"
          >
            <img 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-40 group-hover:opacity-50"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAep1W52K19KeCqbdrbF_0TFVFKuyNONmha_UCGEzXn47gYG8peXPjHvEMbR4KBl6LypjL1YfvK8wJe2k7MD-6Y6attmcyr7f8jjt_nTlLcJLaFcn6ZfvDvDKWUc4VTOMnkd2UNZUuGf9QDowW0y_RR6VpsEktKyETdW2htbwK_72nxj2NeC-D1kSEtfIDP0TNmaSk51eXg4cHCSGuNayQfxaObsuNGZu1pyJzeA30g5tlq4mh7y-_o1Uhqz6gzCu68ckWnC2ZucQ"
              alt="DJ Sets Category"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#a178ff]/80 to-transparent"></div>
            <div className="relative h-full flex flex-col justify-between p-6 z-10">
              <div className="bg-black/40 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center border border-white/10">
                <Disc className="text-white w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <h4 className="font-headline text-lg text-white uppercase italic tracking-wider">DJ Sets</h4>
                <p className="font-mono text-[11px] text-[#secondary-fixed]/90">89 Clubs active</p>
              </div>
            </div>
          </div>

          {/* Category Card: Festivals */}
          <div 
            onClick={() => onNavigate('DISCOVER')} 
            className="relative overflow-hidden h-40 rounded-2xl group cursor-pointer border border-white/5 shadow-md"
          >
            <img 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-40 group-hover:opacity-50"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfq6VL-b-GTrRMKmAOL5xkio03Bj9wwFDJXFz5QrghEb6Uctw-hd36gM1ygs-5bpXju9bmfv21nv8y3IaDKKQ28lhxvwbG92OKBFl6AlFZp0GGy5cMIsxKFR-ASHgsqqSv2HjbAUEKCnHBpTrW7SwiGreicm6dQ7Tj5-U6mBz6ygRoDTggl_uV7YG7EAPwIq0G0rTkS4NcQZp64FmFfKK87N9XRyceASElxN4jb-0CDyyxbwlUdYl8_WryS6ABH2cZS_plFcbXRw"
              alt="Festivals Category"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#f131ff]/80 to-transparent"></div>
            <div className="relative h-full flex flex-col justify-between p-6 z-10">
              <div className="bg-black/40 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center border border-white/10">
                <Tent className="text-white w-5 h-5" />
              </div>
              <div>
                <h4 className="font-headline text-lg text-white uppercase italic tracking-wider">Festivals</h4>
                <p className="font-mono text-[11px] text-[#secondary-fixed]/90">12 Global tours</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Events */}
      <section className="py-12 relative overflow-hidden max-w-7xl mx-auto">
        <div className="px-6 mb-8">
          <h3 className="font-headline text-2xl uppercase tracking-wider text-white">Trending Events</h3>
          <div className="h-1 w-12 bg-[#00eefc] rounded-full mt-1.5 animate-pulse"></div>
        </div>

        <div className="flex overflow-x-auto gap-6 px-6 no-scrollbar pb-6 scroll-smooth">
          {trendingEvents.map((evt) => (
            <div 
              key={evt.id}
              onClick={() => onNavigate('DISCOVER')}
              className="flex-shrink-0 w-80 glass-panel rounded-2xl overflow-hidden flex flex-col cursor-pointer border border-white/10 hover:border-[#f131ff]/40 hover:scale-[1.01] transition-all duration-300 group"
            >
              <div className="h-48 relative overflow-hidden">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src={evt.bannerUrl}
                  alt={evt.name}
                />
                <div className="absolute top-4 left-4 px-3.5 py-1 bg-[#ffa9fc] text-[#37003b] text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {evt.tag || 'Trending'}
                </div>
              </div>
              <div className="p-5 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                  <h5 className="font-headline text-lg group-hover:text-[#ffa9fc] transition-colors leading-tight text-[#ffa9fc] font-bold">
                    {evt.name}
                  </h5>
                  <span className="font-mono text-sm text-[#00eefc] font-semibold">
                    ${evt.price}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#d9bfd4]/70">
                  <MapPin className="w-3.5 h-3.5 text-[#00eefc]" />
                  <span>{evt.location}</span>
                </div>
                <div className="mt-2 pt-3 border-t border-white/5 flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    <div className="w-6 h-6 rounded-full border border-[#131316] bg-[#00eefc]/20 flex items-center justify-center text-[8px] font-bold">DJ</div>
                    <div className="w-6 h-6 rounded-full border border-[#131316] bg-[#ffa9fc]/20 flex items-center justify-center text-[8px] font-bold">VIP</div>
                    <div className="w-6 h-6 rounded-full border border-[#131316] bg-[#a178ff]/20 flex items-center justify-center text-[8px] font-bold">LIVE</div>
                  </div>
                  <span className="font-mono text-[10px] text-[#d9bfd4]/65">
                    {evt.id === 'evt-1' ? '+2k Going' : '400+ VIPs'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Quick Create Highlight Card */}
          <div 
            onClick={() => onNavigate('CREATE_EVENT')}
            className="flex-shrink-0 w-80 rounded-2xl border-2 border-dashed border-[#ffa9fc]/25 bg-[#ffa9fc]/2 p-6 flex flex-col justify-between items-center text-center cursor-pointer hover:border-[#ffa9fc]/60 hover:bg-[#ffa9fc]/5 transition-all duration-300"
          >
            <div className="my-auto flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#ffa9fc]/10 flex items-center justify-center border border-[#ffa9fc]/20">
                <Volume2 className="text-[#ffa9fc] w-6 h-6" />
              </div>
              <div>
                <h6 className="font-headline text-md text-[#ffa9fc] uppercase font-bold tracking-wider">Host Your Own Set?</h6>
                <p className="font-sans text-xs text-[#d9bfd4]/70 mt-1 max-w-[200px]">
                  Broadcast your rhythm. Publish event page layouts instantly for over 50,000+ active listeners.
                </p>
              </div>
            </div>
            <button className="h-10 px-5 bg-gradient-to-r from-[#f131ff] to-[#ffa9fc] text-[#37003b] font-headline text-xs font-extrabold rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all uppercase tracking-wider">
              Publish Event Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0e0e11] w-full py-12 border-t border-white/5 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 w-full max-w-7xl mx-auto gap-8 text-center md:text-left">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Volume2 className="text-[#ffa9fc] w-6 h-6" />
              <h2 className="font-headline text-xl text-[#ffa9fc] font-black tracking-tight">VIBE_PULSE</h2>
            </div>
            <p className="font-sans text-xs text-[#d9bfd4]/60 max-w-xs">
              Your portal to the world's most rhythmic live experiences and underground frequencies.
            </p>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-6">
            <button onClick={() => onNavigate('DISCOVER')} className="font-mono text-xs text-[#d9bfd4]/80 hover:text-[#00eefc] transition-colors uppercase tracking-wider">Events</button>
            <button onClick={() => onNavigate('DISCOVER')} className="font-mono text-xs text-[#d9bfd4]/80 hover:text-[#00eefc] transition-colors uppercase tracking-wider">Venues</button>
            <button onClick={() => onNavigate('CREATE_EVENT')} className="font-mono text-xs text-[#d9bfd4]/80 hover:text-[#00eefc] transition-colors uppercase tracking-wider">Host</button>
            <button onClick={() => onNavigate('ADMIN')} className="font-mono text-xs text-[#d9bfd4]/80 hover:text-[#00eefc] transition-colors uppercase tracking-wider">Admin</button>
            <button onClick={() => onNavigate('SECURE_SECTOR')} className="font-mono text-xs text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider font-extrabold">Secure Sector</button>
          </nav>
          
          <div className="flex flex-col gap-4 items-center md:items-end">
            <div className="flex gap-4">
              <button 
                onClick={() => alert("Share Vibe Pulse with your crew! App Link copied to clipboard.")}
                className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-[#d9bfd4] hover:text-[#ffa9fc] transition-colors"
                title="Share Pulse"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onNavigate('DASHBOARD')}
                className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-[#d9bfd4] hover:text-[#ffa9fc] transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4 animate-bounce" />
              </button>
            </div>
            <p className="font-mono text-[9px] text-[#d9bfd4]/40 uppercase tracking-widest">
              © 2026 VIBE_PULSE. STAY RHYTHMIC.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
