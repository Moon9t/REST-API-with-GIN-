import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { eventsAPI, Event } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

export const MyEvents: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'organizing' | 'attending'>('organizing');
  const [organizingEvents, setOrganizingEvents] = useState<Event[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [offlineFallback, setOfflineFallback] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const allEvents = await eventsAPI.getAll(1, 100);
      
      // Filter events user is organizing
      const organizing = allEvents.data.filter((event: Event) => event.user_id === user?.id);
      setOrganizingEvents(organizing);
      
      // Try to load attending events from backend; if that fails, fall back to cached or mock data.
      try {
        const attending = await eventsAPI.getAttending(user?.id);
        setAttendingEvents(attending.data);
        // cache for offline fallback
        try { localStorage.setItem('attendingEvents', JSON.stringify(attending.data)); } catch (_) {}
        setOfflineFallback(false);
      } catch (err) {
        console.warn('Attending events fetch failed, using fallback:', err);
        // try cached
        try {
          const cached = localStorage.getItem('attendingEvents');
          if (cached) {
            setAttendingEvents(JSON.parse(cached));
            setOfflineFallback(true);
          } else {
            // last resort: small local mock so UI isn't empty
            const fallbackMock: Event[] = [
              { id: 9991, user_id: 2, name: 'Offline Sample 1', description: 'Mock attending event', date: new Date().toISOString(), location: 'Offline' },
            ];
            setAttendingEvents(fallbackMock);
            setOfflineFallback(true);
          }
        } catch (e) {
          console.error('Failed to read cached attending events', e);
          setAttendingEvents([]);
          setOfflineFallback(true);
        }
      }
    } catch (error) {
      console.error('Failed to load events', error);
    } finally {
      setLoading(false);
    }
  };

  const currentEvents = activeTab === 'organizing' ? organizingEvents : attendingEvents;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>

      <div className="relative z-10 max-w-7xl mx-auto p-8">
        <button onClick={() => navigate('/events')} className="text-gray-400 hover:text-white mb-6 flex items-center space-x-2 transition-colors group">
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-semibold">Back to Events</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-3">My Events</h1>
          <p className="text-gray-400 text-lg">Manage your events and registrations</p>
        </div>

        {offlineFallback && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-600/10 border border-yellow-500 text-yellow-200">
            You're viewing cached/offline data because the server couldn't be reached.
            <button
              onClick={() => window.location.reload()}
              className="ml-4 px-3 py-1 bg-yellow-500 text-black rounded-md font-semibold"
            >
              Retry
            </button>
            <Link to="/my-events-offline" className="ml-4 underline text-yellow-200">Open offline demo</Link>
          </div>
        )}

        {/* Tabs */}
        <div className="glass rounded-2xl p-2 inline-flex mb-8">
          <button
            onClick={() => setActiveTab('organizing')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
              activeTab === 'organizing'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span>Organizing ({organizingEvents.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('attending')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
              activeTab === 'attending'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Attending ({attendingEvents.length})</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-purple-300 opacity-20"></div>
              </div>
              <p className="text-white/70 font-medium">Loading your events...</p>
            </div>
          </div>
        ) : currentEvents.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <svg className="w-20 h-20 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-2xl font-bold text-white mb-2">
              {activeTab === 'organizing' ? 'No events created yet' : 'Not attending any events'}
            </h3>
            <p className="text-gray-400 mb-6">
              {activeTab === 'organizing'
                ? 'Start by creating your first event'
                : 'Browse events and join the ones that interest you'}
            </p>
            <button
              onClick={() => navigate(activeTab === 'organizing' ? '/events/new' : '/events')}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all inline-flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{activeTab === 'organizing' ? 'Create Event' : 'Browse Events'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="group relative overflow-hidden"
              >
                <div className="glass rounded-2xl p-6 hover:bg-white/15 border border-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">
                        {event.name}
                      </h3>
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    
                    <p className="text-white/70 text-sm mb-4 line-clamp-2 group-hover:text-white/90 transition-colors">
                      {event.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-white/60 group-hover:text-purple-200 transition-colors">
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">{format(new Date(event.date), 'MMM dd, yyyy • h:mm a')}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-white/60 group-hover:text-blue-200 transition-colors">
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">{event.location}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center text-white/40 group-hover:text-white transition-colors">
                      <span className="text-sm font-medium">View details</span>
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
