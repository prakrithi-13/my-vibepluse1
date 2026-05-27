import React, { useState } from 'react';
import { PageType, MusicEvent, EventType } from '../types';
import { Volume2, MapPin, Mail, Phone, CloudUpload, Sparkles, Zap, DollarSign, Calendar, Users, AlertCircle, ArrowLeft } from 'lucide-react';

interface CreateEventPageProps {
  onAddEvent: (event: Omit<MusicEvent, 'id' | 'isUserRegistered' | 'currentCapacity'> & { bannerPresetId?: string }) => void;
  onNavigate: (page: PageType) => void;
  currentUser?: any | null;
  onLoginGoogle?: () => void;
}

// Preset high-fidelity imagery so the user has some templates if they don't upload a file!
const BANNER_PRESETS = [
  { id: 'pres-1', name: 'Cyber Neon Rave', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAxJoq2xdc9VGZK_WK8LoaDTpq3wy-CLJO-8GOEAO0y3Gfpats4rnQyva8L_EPg0-jq2PlzfvLIIM5M7mPZQBYqDVOTO_igmVJ35Q1n-E0AUL7llrV2ZIw824NGt4MTYs6K_DJ3kdpo0dCpDpouFye-FvAFbolsC8ntwpG5v2bwr5jObLgVVT7Au1Qu9lU5tEiIEVxafaVQpOtgXX2SfgYENUs4Bw-vduQry4zaqEyJpjY0lClVOFVq51VVxdm4RFLhyaoYzKN0Q' },
  { id: 'pres-2', name: 'Electric Teal Stage', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiBZ3X8udXVxbegXD5n08Y3PUg-gC0K_xk8Hym7jwJmLeCzgcCxZNnQADFdL9vmL-KR4FLIKPeWv5_AACCh_QtkntixKwkdd34Ri6zKYTRIIh50gculQpFoUeklqZRSlMFQJe3epUWqiYtwmvnhU4Kg5ux_rise9ZavS4UTuD6QnIq4v67V0IfJlky2_B2dUk2IjiEZ2rqKY9Ro57dT6_vLkXSqEl4Pu6u2zZCpJCSQdtGLAEHX2c0LyBZjW9FE3dR5d8DHgy6eQ' },
  { id: 'pres-3', name: 'Rooftop Lounge Sunset', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVAiyoatcCWGzFUsV832m8Jez3yvxtYcGzthKnZC68GmlhNbojX3H5-x5a68DFMKmtUD6QRnTBy7pH4nadneBdy8hWPH0ge1FD5xVgvgEkAHufonYsTdVpeeNY60CwJdGLsbeAJisndw4FPF3KAad5Y6Bd1QkHBGi5JN-wUAPK9GEO8XrwfyN6CsfZiwuNsENKK5DGOf61pu14qh6ylQbjsf3I_95v7kQxJrO9Fa6MX6j-CH5hBEo6FNynHEaQWZPJrs2mLz4xig' }
];

export default function CreateEventPage({ onAddEvent, onNavigate, currentUser, onLoginGoogle }: CreateEventPageProps) {
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState<EventType | ''>('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [price, setPrice] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handlePrefillDemo = () => {
    setEventName("Subterranean Cyber Rave 2026");
    setEventType("underground");
    setMaxCapacity("450");
    setLocation("Shibu-X Underground, Tokyo");
    setVenueAddress("Shibuya 2-Chome 14-8 B3F");
    setDescription("An immersive dark cyber-rave featuring absolute boundary conditions, high loyalty payouts, and extreme bass frequencies on the synced VIBE_PULSE networks.");
    
    // Set a realistic upcoming time
    const today = new Date();
    today.setDate(today.getDate() + 3);
    const formatDate = (d: Date, hours: number) => {
      const copy = new Date(d);
      copy.setHours(hours, 0, 0, 0);
      const tzoffset = copy.getTimezoneOffset() * 60000;
      return new Date(copy.getTime() - tzoffset).toISOString().slice(0, 16);
    };
    
    setStartTime(formatDate(today, 21)); // 9 PM
    setEndTime(formatDate(today, 27)); // 3 AM next morning
    setPrice("35");
    setEmail(currentUser?.email || "broadcaster@cyberpulse.net");
    setPhone("+81 90 2849 5032");
    setSelectedPresetUrl(BANNER_PRESETS[0].url);
  };
  
  // Custom states
  const [selectedPresetUrl, setSelectedPresetUrl] = useState(BANNER_PRESETS[0].url);
  const [customFileLoaded, setCustomFileLoaded] = useState(false);
  const [customFileName, setCustomFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<Omit<MusicEvent, 'id' | 'isUserRegistered' | 'currentCapacity'> & { bannerPresetId?: string } | null>(null);

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCustomFileName(e.target.files[0].name);
      setCustomFileLoaded(true);
      // Simulate file load and map to random preset to keep it beautiful
      const randomPreset = BANNER_PRESETS[Math.floor(Math.random() * BANNER_PRESETS.length)].url;
      setSelectedPresetUrl(randomPreset);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || !eventType || !location || !venueAddress || !startTime || !endTime || !price) {
      alert("Please fill in all required fields (Event Name, Type, Location, Venue Address, Start/End Schedule & Ticket Price)!");
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      onAddEvent({
        name: eventName,
        type: eventType as EventType,
        maxCapacity: parseInt(maxCapacity) || 500,
        location,
        address: venueAddress,
        description: description || "An immersive modern electronic soundscape performance on the VIBE_PULSE network.",
        startTime,
        endTime,
        price: parseFloat(price) || 0,
        email: email || "organizer@vibepulse.com",
        phone: phone || "+91 XXXXX XXXXX",
        bannerUrl: selectedPresetUrl,
        tag: 'Selling Fast'
      });
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="relative min-h-screen text-[#e4e1e6] pb-32">
      {/* Dynamic Background decor */}
      <div className="absolute top-32 right-10 w-96 h-96 bg-[#f131ff]/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* Top Header */}
      <header className="sticky top-0 w-full bg-[#131316]/30 backdrop-blur-[30px] border-b border-white/10 z-50">
        <div className="flex justify-between items-center px-6 md:px-12 w-full max-w-7xl mx-auto h-20">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('LANDING')}>
            <Volume2 className="text-[#ffa9fc] w-8 h-8" />
            <h1 className="font-headline text-2xl font-black tracking-tighter text-[#ffa9fc]">CREATE EVENT</h1>
          </div>
          <nav className="flex gap-6">
            <button onClick={() => onNavigate('LANDING')} className="text-sm hover:text-[#00eefc] transition-colors uppercase tracking-wider font-mono">Home</button>
            <button onClick={() => onNavigate('DISCOVER')} className="text-sm hover:text-[#00eefc] transition-colors uppercase tracking-wider font-mono">Discover</button>
          </nav>
        </div>
      </header>

      {/* Main Form content Area */}
      <main className="pt-12 pb-16 px-6 max-w-4xl mx-auto">
        {/* Back and Page head details style */}
        <div className="mb-10 animate-fade-in">
          <button 
            onClick={() => onNavigate('LANDING')} 
            className="flex items-center gap-2 text-xs text-[#d9bfd4] hover:text-[#ffa9fc] font-mono uppercase tracking-widest pb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <p className="font-mono text-xs text-[#ffa9fc] uppercase tracking-widest mb-2 font-semibold">Sonic Pulse Network</p>
          <h2 className="font-headline text-3xl md:text-4xl text-white font-extrabold tracking-tight leading-none uppercase">
            Broadcast Your Rhythm
          </h2>
          <p className="font-sans text-xs md:text-sm text-[#d9bfd4]/80 mt-2">
            Fill in the schedule, parameters, tickets, and description details to broadcast your live set or festival on the shared VIBE_PULSE network.
          </p>
        </div>

        {/* Dynamic Success overlay */}
        {isSubmitting ? (
          <div className="glass-panel-heavy rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px] gap-6 border border-[#ffa9fc]/20 shadow-[0_0_30px_rgba(241,49,255,0.15)] animate-pulse">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-dashed border-[#ffa9fc] animate-spin"></div>
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#ffa9fc] w-6 h-6" />
            </div>
            <div>
              <h3 className="font-headline text-2xl text-white uppercase font-bold">Broadcasting Set...</h3>
              <p className="font-sans text-sm text-[#d9bfd4]/70 mt-2">Publishing frequencies across 50,000+ active music accounts in your region.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Dynamic Registration & Prefill Toolbelt */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch justify-between p-4 rounded-xl border border-[#ffa9fc]/20 bg-[#ffa9fc]/5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#ffa9fc]/10 text-[#ffa9fc]">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-headline text-sm font-bold text-white uppercase tracking-wider">Fast Broadcast Tester</h4>
                  <p className="font-sans text-[11px] text-[#d9bfd4]/80">Instantly populate high-fidelity club and rave details in one click.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="demo-prefill-btn"
                  onClick={handlePrefillDemo}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-[#00eefc] to-teal-500 text-black text-xs font-mono font-black rounded-lg uppercase transition-all tracking-wider hover:opacity-90 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-black" /> Auto-Fill Demo Set
                </button>
              </div>
            </div>

            {/* Warning if not logged in */}
            {!currentUser && (
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-rose-500/30 bg-rose-950/10 backdrop-blur-md">
                <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
                <div className="flex-1 text-center sm:text-left">
                  <h5 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Authentication Required to Broadcast</h5>
                  <p className="text-[11px] text-rose-300">You must sign in with a Google account to save and broadcast live events to Firestore.</p>
                </div>
                {onLoginGoogle && (
                  <button
                    type="button"
                    onClick={onLoginGoogle}
                    className="w-full sm:w-auto px-4 py-2 border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 text-xs font-mono font-bold rounded-lg uppercase transition-all"
                  >
                    Connect Account
                  </button>
                )}
              </div>
            )}

            <div className="glass-panel-heavy rounded-2xl p-6 md:p-10 relative overflow-hidden transition-all duration-300">
              {/* Corner visual flare */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#ffa9fc]/10 blur-[80px] rounded-full pointer-events-none"></div>

              <form onSubmit={handleFormSubmit} className="space-y-8 relative z-10">
              
              {/* Section: Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className={`font-mono text-[10px] uppercase tracking-widest font-semibold transition-colors ${focusedField === 'name' ? 'text-[#00eefc]' : 'text-[#ffa9fc]'}`}>
                    Event Name <span className="text-[#f131ff]">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="e.g. Neon Horizon Festival" 
                    className="w-full bg-[#131316]/50 border border-white/10 rounded-xl py-3 px-4 text-white font-sans focus:ring-2 focus:ring-[#ffa9fc] focus:border-transparent transition-all outline-none text-sm placeholder:text-[#d9bfd4]/30"
                  />
                </div>

                <div className="space-y-2">
                  <label className={`font-mono text-[10px] uppercase tracking-widest font-semibold transition-colors ${focusedField === 'type' ? 'text-[#00eefc]' : 'text-[#ffa9fc]'}`}>
                    Event Type <span className="text-[#f131ff]">*</span>
                  </label>
                  <select 
                    required
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as EventType)}
                    onFocus={() => setFocusedField('type')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-[#131316]/80 text-white border border-white/10 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#ffa9fc] focus:border-transparent transition-all outline-none"
                  >
                    <option value="" disabled>Select rhythm type...</option>
                    <option value="live">Live Concert</option>
                    <option value="dj">DJ Set</option>
                    <option value="festival">Music Festival</option>
                    <option value="underground">Underground Rave</option>
                    <option value="workshop">Music Workshop</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className={`font-mono text-[10px] uppercase tracking-widest font-semibold transition-colors ${focusedField === 'capacity' ? 'text-[#00eefc]' : 'text-[#ffa9fc]'}`}>
                    Max Capacity
                  </label>
                  <input 
                    type="number" 
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                    onFocus={() => setFocusedField('capacity')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="e.g. 500" 
                    className="w-full bg-[#131316]/50 border border-white/10 rounded-xl py-3 px-4 text-white font-sans focus:ring-2 focus:ring-[#ffa9fc] focus:border-transparent transition-all outline-none text-sm placeholder:text-[#d9bfd4]/30"
                  />
                </div>
              </div>

              {/* Section: Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`font-mono text-[10px] uppercase tracking-widest font-semibold transition-colors ${focusedField === 'location' ? 'text-[#00eefc]' : 'text-[#ffa9fc]'}`}>
                    City / General Location <span className="text-[#f131ff]">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d9bfd4]/60 w-4 h-4" />
                    <input 
                      type="text" 
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onFocus={() => setFocusedField('location')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="e.g. Nexus Arena, Tokyo" 
                      className="w-full bg-[#131316]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white font-sans focus:ring-2 focus:ring-[#ffa9fc] focus:border-transparent transition-all outline-none text-sm placeholder:text-[#d9bfd4]/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`font-mono text-[10px] uppercase tracking-widest font-semibold transition-colors ${focusedField === 'address' ? 'text-[#00eefc]' : 'text-[#ffa9fc]'}`}>
                    Venue Address <span className="text-[#f131ff]">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    onFocus={() => setFocusedField('address')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Full street address, room, or gate" 
                    className="w-full bg-[#131316]/50 border border-white/10 rounded-xl py-3 px-4 text-white font-sans focus:ring-2 focus:ring-[#ffa9fc] focus:border-transparent transition-all outline-none text-sm placeholder:text-[#d9bfd4]/30"
                  />
                </div>
              </div>

              {/* Section: Description */}
              <div className="space-y-2">
                <label className={`font-mono text-[10px] uppercase tracking-widest font-semibold transition-colors ${focusedField === 'desc' ? 'text-[#00eefc]' : 'text-[#ffa9fc]'}`}>
                  Vibe Description
                </label>
                <textarea 
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={() => setFocusedField('desc')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Describe the artists lineup, the visual production aesthetic, acoustics, and experience vibes..." 
                  className="w-full bg-[#131316]/50 border border-white/10 rounded-xl py-3 px-4 text-white font-sans focus:ring-2 focus:ring-[#ffa9fc] focus:border-transparent transition-all outline-none text-sm placeholder:text-[#d9bfd4]/30 resize-none"
                />
              </div>

              {/* Section: Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`font-mono text-[10px] uppercase tracking-widest font-semibold transition-colors ${focusedField === 'start' ? 'text-[#00eefc]' : 'text-[#ffa9fc]'}`}>
                    Start Date & Time <span className="text-[#f131ff]">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="datetime-local" 
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      onFocus={() => setFocusedField('start')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full bg-[#131316]/50 border border-white/10 rounded-xl py-3 px-4 text-white font-sans focus:ring-2 focus:ring-[#ffa9fc] focus:border-transparent transition-all outline-[#f131ff] text-sm [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`font-mono text-[10px] uppercase tracking-widest font-semibold transition-colors ${focusedField === 'end' ? 'text-[#00eefc]' : 'text-[#ffa9fc]'}`}>
                    End Date & Time <span className="text-[#f131ff]">*</span>
                  </label>
                  <input 
                    type="datetime-local" 
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    onFocus={() => setFocusedField('end')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-[#131316]/50 border border-white/10 rounded-xl py-3 px-4 text-white font-sans focus:ring-2 focus:ring-[#ffa9fc] focus:border-transparent transition-all outline-none text-sm [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Section: Tickets & Contact */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className={`font-mono text-[10px] uppercase tracking-widest font-semibold transition-colors ${focusedField === 'price' ? 'text-[#00eefc]' : 'text-[#ffa9fc]'}`}>
                    Ticket Price ($ USD) <span className="text-[#f131ff]">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d9bfd4]/60 w-4 h-4" />
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      onFocus={() => setFocusedField('price')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="e.g. 45" 
                      className="w-full bg-[#131316]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white font-sans focus:ring-2 focus:ring-[#ffa9fc] focus:border-transparent transition-all outline-none text-sm placeholder:text-[#d9bfd4]/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`font-mono text-[10px] uppercase tracking-widest font-semibold transition-colors ${focusedField === 'email' ? 'text-[#00eefc]' : 'text-[#ffa9fc]'}`}>
                    Contact Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d9bfd4]/60 w-4 h-4" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="organizer@vibepulse.com" 
                      className="w-full bg-[#131316]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white font-sans focus:ring-2 focus:ring-[#ffa9fc] focus:border-transparent transition-all outline-none text-sm placeholder:text-[#d9bfd4]/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`font-mono text-[10px] uppercase tracking-widest font-semibold transition-colors ${focusedField === 'phone' ? 'text-[#00eefc]' : 'text-[#ffa9fc]'}`}>
                    Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d9bfd4]/60 w-4 h-4" />
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="+1 XXXXX XXXXX" 
                      className="w-full bg-[#131316]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white font-sans focus:ring-2 focus:ring-[#ffa9fc] focus:border-transparent transition-all outline-none text-sm placeholder:text-[#d9bfd4]/30"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Banner Picker */}
              <div className="space-y-3">
                <label className="font-mono text-[10px] uppercase tracking-widest font-semibold text-[#ffa9fc]">
                  Select Stage Visual Template (Or upload custom background)
                </label>
                
                {/* 3 presets list */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {BANNER_PRESETS.map((preset) => (
                    <div 
                      key={preset.id}
                      onClick={() => {
                        setSelectedPresetUrl(preset.url);
                        setCustomFileLoaded(false);
                      }}
                      className={`relative rounded-xl overflow-hidden h-20 cursor-pointer border transition-all ${
                        !customFileLoaded && selectedPresetUrl === preset.url 
                          ? 'border-[#00eefc] ring-2 ring-[#00eefc]' 
                          : 'border-white/5 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2 text-center">
                        <span className="font-headline font-bold italic tracking-wide text-xs text-white uppercase drop-shadow">
                          {preset.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload box */}
                <div className="relative group">
                  <input 
                    type="file" 
                    id="banner_upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                  <label 
                    htmlFor="banner_upload"
                    className={`flex flex-col items-center justify-center w-full h-32 bg-black/40 border-2 border-dashed rounded-xl cursor-pointer hover:bg-black/60 transition-all ${
                      customFileLoaded ? 'border-[#00eefc]' : 'border-white/10'
                    }`}
                  >
                    <CloudUpload className={`w-8 h-8 mb-2 ${customFileLoaded ? 'text-[#00eefc]' : 'text-[#d9bfd4]/60'}`} />
                    <p className="font-sans text-xs text-white">
                      {customFileLoaded ? (
                        <span>Loaded Custom File: <b className="text-[#00eefc]">{customFileName}</b></span>
                      ) : (
                        <span>Drag and drop event banner image or <b className="text-[#ffa9fc]">browse locally</b></span>
                      )}
                    </p>
                    <p className="font-mono text-[10px] text-[#d9bfd4]/50 mt-1">High resolution PNG, JPG, or SVG (Max 5MB)</p>
                  </label>
                </div>
              </div>

              {/* Form submit buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-4 items-center justify-end pt-6 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => onNavigate('LANDING')}
                  className="w-full sm:w-auto px-8 h-12 text-sm font-semibold text-[#d9bfd4] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-full sm:w-auto px-10 h-12 bg-gradient-to-r from-[#f131ff] to-[#ffa9fc] text-[#37003b] font-headline text-sm font-black rounded-full active:scale-95 transition-all shadow-md hover:scale-[1.01]"
                >
                  BROADCAST EVENT
                </button>
              </div>
            </form>
          </div>
        </div>
        )}

        {/* Dynamic decorative alert blocks */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-6 rounded-xl border-l-4 border-l-[#00eefc]">
            <div className="flex items-center gap-2.5 mb-2">
              <Sparkles className="text-[#00eefc] w-5 h-5" />
              <h4 className="font-headline text-md text-white uppercase font-bold">AI Pulse Optimization</h4>
            </div>
            <p className="font-sans text-xs text-[#d9bfd4]/85 leading-relaxed">
              Our algorithms analyze event descriptions to automatically suggest optimization keywords, ideal slot durations, and match coordinates for maximum attendee conversion.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-xl border-l-4 border-l-[#f131ff]">
            <div className="flex items-center gap-2.5 mb-2">
              <Zap className="text-[#f131ff] w-5 h-5" />
              <h4 className="font-headline text-md text-white uppercase font-bold">Instant Distribution</h4>
            </div>
            <p className="font-sans text-xs text-[#d9bfd4]/85 leading-relaxed">
              Once verified, your broadcast goes live instantly. It distributes invitations seamlessly to the smart recommendation queue of over 50,000+ local techno listeners.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
