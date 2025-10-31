import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';

type Event = {
  id: number;
  user_id: number;
  name: string;
  description: string;
  date: string;
  location: string;
};

const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    user_id: 2,
    name: 'Go Workshop',
    description: 'A workshop about Go and building APIs with Gin.',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    location: 'Online',
  },
  {
    id: 2,
    user_id: 1,
    name: 'Frontend Jam',
    description: 'Community frontend meetup with live coding.',
    date: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    location: 'Community Hall',
  },
  {
    id: 3,
    user_id: 3,
    name: 'Design Crit',
    description: 'Open design critique session for UI/UX folks.',
    date: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    location: 'Studio 5',
  },
];

export const MyEventsOffline: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'organizing' | 'attending'>('organizing');
  const [organizingEvents, setOrganizingEvents] = useState<Event[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading and split mock events
    setLoading(true);
    const userId = 1; // pretend logged-in user id 1
    const organizing = MOCK_EVENTS.filter((e) => e.user_id === userId);
    const attending = MOCK_EVENTS.filter((e) => e.user_id !== userId);
    // pretend the user is attending event id 1 and 3
    setTimeout(() => {
      setOrganizingEvents(organizing);
      setAttendingEvents(attending);
      setLoading(false);
    }, 400);
  }, []);

  const currentEvents = activeTab === 'organizing' ? organizingEvents : attendingEvents;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <button onClick={() => navigate('/events')} className="text-sm text-gray-400 mb-6">
        ← Back to Events
      </button>

      <h1 className="text-3xl font-bold mb-4">My Events (Offline)</h1>

      <div className="mb-6 inline-flex bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('organizing')}
          className={`px-4 py-2 rounded ${activeTab === 'organizing' ? 'bg-indigo-600' : 'text-gray-300'}`}
        >
          Organizing ({organizingEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('attending')}
          className={`px-4 py-2 rounded ${activeTab === 'attending' ? 'bg-indigo-600' : 'text-gray-300'}`}
        >
          Attending ({attendingEvents.length})
        </button>
      </div>

      {loading ? (
        <div>Loading events…</div>
      ) : currentEvents.length === 0 ? (
        <div className="p-8 bg-gray-800 rounded">No events to show.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentEvents.map((ev) => (
            <div key={ev.id} className="p-4 bg-gray-800 rounded">
              <h3 className="text-xl font-bold">{ev.name}</h3>
              <p className="text-sm text-gray-300">{ev.description}</p>
              <p className="mt-2 text-xs text-gray-400">{format(new Date(ev.date), 'MMM dd, yyyy • h:mm a')}</p>
              <p className="text-xs text-gray-400">{ev.location}</p>
              <Link to={`/events/${ev.id}`} className="inline-block mt-3 text-indigo-300 text-sm">View</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEventsOffline;
