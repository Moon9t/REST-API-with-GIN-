import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI, attendeesAPI, Event, User } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', location: '', date: '' });
  
  const isOrganizer = event && user && event.user_id === user.id;
  const isAdmin = user?.role === 'admin';
  const canEdit = isOrganizer || isAdmin;
  
  useEffect(() => {
    loadEventData();
  }, [id]);
  
  const loadEventData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const eventData = await eventsAPI.getById(id);
      setEvent(eventData);
      setEditForm({
        name: eventData.name,
        description: eventData.description,
        location: eventData.location,
        date: eventData.date,
      });
      
      // Load attendees
      try {
        const attendeeData = await attendeesAPI.getEventAttendees(eventData.id);
        setAttendees(attendeeData || []);
      } catch (err) {
        console.error('Failed to load attendees:', err);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = async () => {
    if (!id || !event) return;
    
    try {
      await eventsAPI.update(event.id, editForm);
      setEvent({ ...event, ...editForm });
      setIsEditing(false);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update event');
    }
  };
  
  const handleDelete = async () => {
    if (!id || !event) return;
    
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await eventsAPI.delete(event.id);
      navigate('/events');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete event');
    }
  };
  
  const handleJoinEvent = async () => {
    if (!id || !event || !user) return;
    
    try {
      await attendeesAPI.addAttendee(event.id, user.id);
      await loadEventData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to join event');
    }
  };
  
  const handleLeaveEvent = async () => {
    if (!id || !event || !user) return;
    
    try {
      await attendeesAPI.removeAttendee(event.id, user.id);
      await loadEventData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to leave event');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-purple-300 opacity-20"></div>
          </div>
          <p className="text-white/70 font-medium">Loading event details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="text-purple-400 hover:text-purple-300 mb-4 flex items-center space-x-2 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
          <div className="glass rounded-2xl p-6 border-red-500/20">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400">{error || 'Event not found'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const isAttending = attendees.some(a => a.id === user?.id);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>

      <div className="relative z-10 max-w-4xl mx-auto p-8">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white mb-6 flex items-center space-x-2 transition-colors group">
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-semibold">Back to Events</span>
        </button>
        
        {/* Header with Role Badge */}
        <div className="glass rounded-3xl shadow-2xl p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-3xl font-bold w-full bg-transparent border-b-2 border-purple-500 focus:outline-none text-white"
                />
              ) : (
                <h1 className="text-4xl font-bold text-white mb-3">{event.name}</h1>
              )}
              
              {/* Role Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {isOrganizer && (
                  <span className="inline-flex items-center space-x-1 bg-purple-500/20 text-purple-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-purple-500/30">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span>Organizer</span>
                  </span>
                )}
                {isAdmin && (
                  <span className="inline-flex items-center space-x-1 bg-red-500/20 text-red-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-red-500/30">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Admin</span>
                  </span>
                )}
                {isAttending && !isOrganizer && (
                  <span className="inline-flex items-center space-x-1 bg-green-500/20 text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-500/30">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Attending</span>
                  </span>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            {canEdit && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all font-semibold flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-semibold"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-semibold flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Event Details */}
          <div className="space-y-6 mt-6 border-t border-white/10 pt-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Description</span>
              </h3>
              {isEditing ? (
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                  rows={3}
                />
              ) : (
                <p className="text-gray-300 leading-relaxed">{event.description}</p>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Location</span>
              </h3>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
              ) : (
                <p className="text-gray-300">{event.location}</p>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Date & Time</span>
              </h3>
              {isEditing ? (
                <input
                  type="datetime-local"
                  value={editForm.date.slice(0, 16)}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value + ':00Z' })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
              ) : (
                <p className="text-gray-300">{new Date(event.date).toLocaleString()}</p>
              )}
            </div>
          </div>
          
          {/* Join/Leave Button */}
          {user && !isOrganizer && (
            <div className="mt-6 border-t border-white/10 pt-6">
              {isAttending ? (
                <button
                  onClick={handleLeaveEvent}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Leave Event</span>
                </button>
              ) : (
                <button
                  onClick={handleJoinEvent}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Join Event</span>
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Attendees Section */}
        <div className="glass rounded-3xl shadow-2xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Attendees ({attendees.length})</h2>
          </div>
          {attendees.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-400 text-lg">No attendees yet</p>
              <p className="text-gray-500 text-sm mt-2">Be the first to join this event!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attendees.map((attendee) => (
                <div
                  key={attendee.id}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {attendee.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{attendee.name}</p>
                      <p className="text-sm text-gray-400">{attendee.email}</p>
                    </div>
                  </div>
                  {attendee.id === event.user_id && (
                    <span className="inline-flex items-center space-x-1 text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      <span>Organizer</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
