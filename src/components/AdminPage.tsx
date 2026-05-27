import React, { useState } from 'react';
import { PageType, MusicEvent, PlatformStats } from '../types';
import { Sliders, Settings, LogOut, CheckCircle, Search, Filter, Edit, Eye, Music, Users, CreditCard, ChevronLeft, ChevronRight, Menu, Bell, Download, Trash, BarChart, Settings2, Mail, Plus } from 'lucide-react';

interface AdminPageProps {
  events: MusicEvent[];
  stats: PlatformStats;
  onNavigate: (page: PageType) => void;
  onDeleteEvent: (eventId: string) => void;
}

export default function AdminPage({ events, stats, onNavigate, onDeleteEvent }: AdminPageProps) {
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'EVENTS' | 'USERS'>('OVERVIEW');

  // Filter events for administrative table (excluding deleted/past completed are fine too)
  const administrationEvents = events.filter(evt => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return evt.name.toLowerCase().includes(q) || 
             evt.location.toLowerCase().includes(q) ||
             evt.type.toLowerCase().includes(q);
    }
    return true;
  });

  const getStatusBadge = (evt: MusicEvent) => {
    // Dynamically compute status
    const isCompleted = evt.tag === 'Completed' || new Date(evt.startTime).getFullYear() < 2026;
    if (isCompleted) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
          Done
        </span>
      );
    }

    const isLive = evt.tag === 'Live Now' || evt.id === 'evt-3';
    if (isLive) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-1.5 animate-pulse"></span>
          Live
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#dae1ff]/50 text-[#0050cb]">
        Upcoming
      </span>
    );
  };

  const calculateDynamicStats = () => {
    // Dynamic additions
    const addedEvents = events.length;
    const dynamicTotalEvents = stats.totalEventsCount + (addedEvents - 11);
    const dynamicTicketsSold = stats.ticketsSoldCount + events.filter(e => e.isUserRegistered).length;
    const dynamicRevenue = stats.revenueRub + (events.filter(e => e.isUserRegistered).reduce((sum, e) => sum + e.price, 0) * 85); // converted standard rupees multiple

    return {
      totalEvents: dynamicTotalEvents,
      ticketsSold: dynamicTicketsSold,
      revenue: dynamicRevenue
    };
  };

  const dynamicStats = calculateDynamicStats();

  const handleExportReport = () => {
    alert("Successfully generated high-density CSV spreadsheet report. Initiating package download: VIBEPULSE_OPS_REPORT_2026.csv");
  };

  const handleDeleteClick = (eventId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete / take down this event broadcast set from the active live nodes?");
    if (confirmDelete) {
      onDeleteEvent(eventId);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#191b24] font-sans antialiased overflow-x-hidden">
      
      {/* 1. Fixed Navigation Drawer Sidebar (volt admin deep navy color specs matching mockup) */}
      <aside className={`fixed left-0 top-0 h-full w-[280px] bg-[#2e303a] text-white z-50 transition-transform duration-300 md:translate-x-0 ${
        isAdminSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full py-8 justify-between">
          <div className="space-y-8">
            
            {/* Operator Head Identity */}
            <div className="px-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#b3c5ff]/20">
                <img 
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoW4doeuyoxRxEvt8JJUat5leFAbKyVHJhO-PyuWEZNdqvvyNSjdHfWfsFhA5yCleBwqijF25-8zmm8_1LFh60hCc5KmEyoehK2hQ4O2qMH25wBWpShAae_EDElekHyqOGEi5P0soClOito4zacrPZxrtz6LkLELS_JHPiTy1O_ONsL3p74wJpvPk9KVfEVFOnYgFf0M2bgcvDgwkKpDUYk7h2aGEaZlBCK2R06WlJB1jn47plmiBa6z5IWi2F014jooNUkx8Ehg"
                  alt="Platform Manager Avatar"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-md font-bold text-white leading-tight">Alex Rivera</span>
                <span className="font-sans text-[11px] text-[#c2c6d8] font-medium tracking-wide">Platform Manager</span>
              </div>
            </div>

            {/* Sidebar list items */}
            <nav className="space-y-1">
              <button 
                onClick={() => { setActiveTab('OVERVIEW'); setIsAdminSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-all duration-200 relative ${
                  activeTab === 'OVERVIEW' 
                    ? 'text-white border-l-4 border-[#b3c5ff] bg-white/5 font-semibold' 
                    : 'text-[#c2c6d8] hover:text-white hover:bg-white/2'
                }`}
              >
                <Sliders className="w-4 h-4 text-[#b3c5ff]" />
                <span className="text-xs uppercase tracking-wider font-mono">Overview</span>
              </button>
              
              <button 
                onClick={() => { setActiveTab('EVENTS'); setIsAdminSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-all duration-200 relative ${
                  activeTab === 'EVENTS'
                    ? 'text-white border-l-4 border-[#b3c5ff] bg-white/5 font-semibold' 
                    : 'text-[#c2c6d8] hover:text-white hover:bg-white/2'
                }`}
              >
                <Music className="w-4 h-4 text-[#b3c5ff]" />
                <span className="text-xs uppercase tracking-wider font-mono">All Events Nodes</span>
              </button>

              <button 
                onClick={() => onNavigate('LANDING')}
                className="w-full flex items-center gap-3 px-6 py-4 text-left text-[#c2c6d8] hover:text-white hover:bg-white/2 transition-colors"
              >
                <LogOut className="w-4 h-4 text-[#b3c5ff]" />
                <span className="text-xs uppercase tracking-wider font-mono">Exit App Lobby</span>
              </button>
            </nav>
          </div>

          {/* Underneath Brand Tag */}
          <div className="px-6 pt-4 border-t border-white/5">
            <h4 className="font-headline text-lg font-black text-[#b3c5ff]/80 tracking-widest uppercase">VOLT ADMIN</h4>
            <p className="font-mono text-[9px] text-[#c2c6d8]/40 mt-1 uppercase tracking-wider">© 2026 Pulse Network</p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile toggling drawer */}
      {isAdminSidebarOpen && (
        <div 
          onClick={() => setIsAdminSidebarOpen(false)} 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        ></div>
      )}

      {/* 2. Work Space Canvas Content */}
      <main className="md:ml-[280px] min-h-screen transition-all duration-300">
        
        {/* Top Header navbar with Admin Title */}
        <header className="flex justify-between items-center px-6 md:px-10 h-16 sticky top-0 z-40 bg-[#faf8ff] border-b border-[#c2c6d8]/30 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsAdminSidebarOpen(true)}
              className="md:hidden p-1.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-headline text-xl md:text-2xl font-black text-[#191b24] uppercase tracking-tight">
              Event Operations
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative transition-colors focus:outline-none">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#0050cb] animate-ping"></span>
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#0050cb]"></span>
              </button>
            </div>
            
            <div className="h-6 w-px bg-gray-200"></div>

            <button 
              onClick={() => onNavigate('DASHBOARD')}
              className="text-xs font-semibold px-3 py-1.5 text-[#0050cb] bg-[#0050cb]/5 border border-[#0050cb]/15 hover:bg-[#0050cb]/10 transition-colors rounded-lg font-mono uppercase"
            >
              Platform Cockpit
            </button>
          </div>
        </header>

        {/* Dashboard Panels Container */}
        <div className="p-6 md:p-10 space-y-8">
          
          {/* KPI Widget Row */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Events */}
            <div className="bg-white p-5 rounded-xl border border-[#c2c6d8]/25 shadow-sm group hover:scale-[1.01] transition-transform flex items-center justify-between">
              <div>
                <p className="font-semibold text-xs text-[#424656] uppercase tracking-wider">Total Events</p>
                <h2 className="font-headline text-2xl font-black text-[#191b24] tracking-tight mt-1">
                  {dynamicStats.totalEvents.toLocaleString()}
                </h2>
              </div>
              <div className="p-3 bg-[#0d50cb]/5 rounded-xl text-[#0050cb] border border-[#0050cb]/10">
                <Music className="w-5 h-5" />
              </div>
            </div>

            {/* Active Users */}
            <div className="bg-white p-5 rounded-xl border border-[#c2c6d8]/25 shadow-sm group hover:scale-[1.01] transition-transform flex items-center justify-between">
              <div>
                <p className="font-semibold text-xs text-[#424656] uppercase tracking-wider">Active Users</p>
                <h2 className="font-headline text-2xl font-black text-[#191b24] tracking-tight mt-1">
                  {(stats.activeUsersCount/1000).toFixed(1)}k
                </h2>
              </div>
              <div className="p-3 bg-teal-50 rounded-xl text-teal-600 border border-teal-100">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Tickets Sold */}
            <div className="bg-white p-5 rounded-xl border border-[#c2c6d8]/25 shadow-sm group hover:scale-[1.01] transition-transform flex items-center justify-between">
              <div>
                <p className="font-semibold text-xs text-[#424656] uppercase tracking-wider">Tickets Sold</p>
                <h2 className="font-headline text-2xl font-black text-[#191b24] tracking-tight mt-1">
                  {(dynamicStats.ticketsSold/1000).toFixed(1)}k
                </h2>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl text-purple-600 border border-purple-100">
                <Sliders className="w-5 h-5" />
              </div>
            </div>

            {/* Revenue Widget */}
            <div className="bg-white p-5 rounded-xl border border-[#c2c6d8]/25 shadow-sm group hover:scale-[1.01] transition-transform flex items-center justify-between">
              <div>
                <p className="font-semibold text-xs text-[#424656] uppercase tracking-wider">Revenue (₹)</p>
                <h2 className="font-headline text-2xl font-black text-[#191b24] tracking-tight mt-1">
                  {(dynamicStats.revenue/1000000).toFixed(1)}M
                </h2>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
          </section>

          {/* Table container card */}
          <section className="bg-white rounded-2xl border border-[#c2c6d8]/25 shadow-sm overflow-hidden">
            
            {/* Table Header toolbar control strip */}
            <div className="px-6 py-5 border-b border-[#c2c6d8]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-headline text-lg font-bold text-[#191b24] uppercase tracking-wider">
                  {activeTab === 'EVENTS' ? 'All Active Platform Broadcasts' : 'Recent Event Status'}
                </h3>
                <p className="text-xs text-gray-500 mt-1 font-sans">Verify telemetry statistics, live state toggles, and remove stale events nodes.</p>
              </div>

              {/* Table search filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search events index..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 pl-9 pr-4 py-2 border border-gray-200 text-xs text-[#191b24] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0050cb]"
                  />
                </div>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="p-2 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  title="Reset Filter"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Table layout */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs md:text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 border-b border-gray-100 text-[10px] uppercase tracking-wider font-semibold font-mono">
                    <th className="px-6 py-4">Event Name & Node Info</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Platform Users count</th>
                    <th className="px-6 py-4 text-right">Operational Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans text-xs text-gray-700">
                  {administrationEvents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                        No events matched your search query in the platform database.
                      </td>
                    </tr>
                  ) : (
                    administrationEvents.map((evt) => (
                      <tr key={evt.id} className="hover:bg-[#fafafc] transition-colors group">
                        
                        {/* Event Name info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-7 rounded overflow-hidden border border-gray-100 flex-shrink-0">
                              <img src={evt.bannerUrl} alt={evt.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="block font-bold text-gray-900 group-hover:text-[#0050cb] transition-colors">
                                {evt.name}
                              </span>
                              <span className="text-[10px] font-mono text-gray-400 block whitespace-nowrap uppercase">
                                ID: {evt.id.substring(0, 8)} • {evt.location}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status tag */}
                        <td className="px-6 py-4">
                          {getStatusBadge(evt)}
                        </td>

                        {/* attends/users count */}
                        <td className="px-6 py-4 text-center font-bold font-mono text-[#191b24]">
                          {evt.usersCount ? evt.usersCount.toLocaleString() : (evt.currentCapacity + (evt.isUserRegistered ? 110 : 100)).toLocaleString()}
                        </td>

                        {/* Actions column */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => {
                                alert(`Spectating live metrics telemetry raw feed for set ID: ${evt.id}. Log points and database synchronizing validated.`);
                              }}
                              className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-lg transition-colors focus:outline-none"
                              title="Specs Specs"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            <button 
                              onClick={() => handleDeleteClick(evt.id)}
                              className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-colors focus:outline-none"
                              title="Take Down Node"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination block bottom */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 font-mono">
              <span>Showing {administrationEvents.length} active network listings</span>
              <div className="flex gap-2.5">
                <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-800 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-800 transition-colors"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </section>

          {/* Admin Operations Sub Action row */}
          <section className="flex flex-col sm:flex-row gap-4 pt-2">
            <button 
              onClick={() => onNavigate('CREATE_EVENT')}
              className="flex-1 sm:flex-none px-8 py-3.5 bg-[#0050cb] hover:bg-[#0050cb]/90 text-white font-headline text-xs font-black uppercase tracking-wider rounded-lg shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Broadcast Node
            </button>
            
            <button 
              onClick={handleExportReport}
              className="flex-1 sm:flex-none px-8 py-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-headline text-xs font-black uppercase tracking-wider rounded-lg shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#0050cb]" /> Export Platform Report
            </button>
          </section>

        </div>
      </main>

    </div>
  );
}
