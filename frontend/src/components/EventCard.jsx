import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, CheckCircle2, HelpCircle, XCircle, Trash2, Clock } from 'lucide-react';

export function EventCard({ event, onUpdate, onDelete }) {
  const { user } = useAuth();
  const [userRsvp, setUserRsvp] = useState(event.user_rsvp);
  const [rsvpCounts, setRsvpCounts] = useState(event.rsvp_counts || { going: 0, maybe: 0, declined: 0 });
  const [loadingRsvp, setLoadingRsvp] = useState(false);

  const handleRsvp = async (status) => {
    setLoadingRsvp(true);
    try {
      const res = await api.rsvpEvent(event.id, status);
      setUserRsvp(status);
      setRsvpCounts(res.event.rsvp_counts);
      if (onUpdate) onUpdate(res.event);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingRsvp(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer cet événement temporaire ?")) return;
    try {
      await api.deleteEvent(event.id);
      if (onDelete) onDelete(event.id);
    } catch (err) {
      alert(err.message);
    }
  };

  const startDate = new Date(event.start_time);
  const formattedStart = startDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });

  const isCreatorOrAdmin = user?.is_admin || user?.id === event.creator_id;

  return (
    <div className="glass-card" style={{ marginBottom: 20, overflow: 'hidden' }}>
      {/* Cover Image optionnelle */}
      {event.cover_image_url && (
        <div style={{ width: '100%', height: '180px', overflow: 'hidden', margin: '-20px -20px 16px -20px' }}>
          <img
            src={event.cover_image_url}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            {event.is_ongoing ? (
              <span className="badge badge-ongoing">⚡ En cours</span>
            ) : event.is_past ? (
              <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>Terminé</span>
            ) : (
              <span className="badge" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>À venir</span>
            )}
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{event.title}</h3>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={16} color="var(--accent-primary)" />
              <span style={{ textTransform: 'capitalize' }}>{formattedStart}</span>
            </div>

            {event.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} color="#ec4899" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </div>

        {isCreatorOrAdmin && (
          <button
            onClick={handleDelete}
            style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
            title="Supprimer l'événement"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Description */}
      {event.description && (
        <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: 16, lineHeight: 1.6 }}>
          {event.description}
        </p>
      )}

      {/* Boutons RSVP & Présence */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn btn-sm ${userRsvp === 'going' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleRsvp('going')}
            disabled={loadingRsvp}
          >
            <CheckCircle2 size={16} />
            <span>J'y vais ({rsvpCounts.going})</span>
          </button>

          <button
            className={`btn btn-sm ${userRsvp === 'maybe' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleRsvp('maybe')}
            disabled={loadingRsvp}
          >
            <HelpCircle size={16} />
            <span>Peut-être ({rsvpCounts.maybe})</span>
          </button>

          <button
            className={`btn btn-sm ${userRsvp === 'declined' ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => handleRsvp('declined')}
            disabled={loadingRsvp}
          >
            <XCircle size={16} />
            <span>Absence ({rsvpCounts.declined})</span>
          </button>
        </div>

        {/* Liste condensée des participants */}
        {event.participants && event.participants.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {event.participants.slice(0, 5).map((pt, idx) => (
              <div
                key={idx}
                title={`${pt.user.first_name || pt.user.username} (${pt.status})`}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: '2px solid var(--bg-secondary)',
                  marginLeft: idx > 0 ? -8 : 0
                }}
              >
                {(pt.user.first_name?.[0] || pt.user.username[0]).toUpperCase()}
              </div>
            ))}
            {event.participants.length > 5 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 4 }}>
                +{event.participants.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
