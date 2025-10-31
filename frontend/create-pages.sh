#!/bin/bash
# Create remaining pages

# Events page (list with pagination)
cat > src/pages/Events.tsx << 'EOF'
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventsAPI, Event } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { format } from 'date-fns';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, [page, search]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.getAll(page, 12, search);
      setEvents(data.data);
      setTotalPages(data.pagination.total_pages);
    } catch (error) {
      console.error('Failed to load events', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">EventHub</h1>
              <div className="ml-10 flex space-x-4">
                <Link to="/events" className="text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  All Events
                </Link>
                <Link to="/my-events" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  My Events
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Hello, {user?.name}</span>
              <Button size="sm" variant="ghost" onClick={logout}>Logout</Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">All Events</h2>
          <Button onClick={() => navigate('/events/new')}>Create Event</Button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link
                  key={event.ID}
                  to={`/events/${event.ID}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {format(new Date(event.date), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center space-x-2">
                <Button
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
EOF

# EventDetail and MyEvents stubs
cat > src/pages/EventDetail.tsx << 'EOF'
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const EventDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <button onClick={() => navigate(-1)} className="text-primary-600 mb-4">← Back</button>
      <h1 className="text-3xl font-bold">Event Detail {id}</h1>
    </div>
  );
};
EOF

cat > src/pages/MyEvents.tsx << 'EOF'
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const MyEvents: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <button onClick={() => navigate(-1)} className="text-primary-600 mb-4">← Back</button>
      <h1 className="text-3xl font-bold">My Events</h1>
    </div>
  );
};
EOF

chmod +x create-pages.sh
./create-pages.sh
echo "✅ All pages created"
