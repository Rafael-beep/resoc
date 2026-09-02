import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { EventCard } from '../components/EventCard';
import { CreateEventModal } from '../components/CreateEventModal';
import { Calendar, PlusCircle, RefreshCw, Filter } from 'lucide-react';

export function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getEvents();
      setEvents(res.events || []);
    } catch (err) {
      console.error("Erreur chargement événements", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventCreated = (newEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  const handleEventDeleted = (deletedId) => {
    setEvents((prev) => prev.filter((e) => e.id !== deletedId));
  };

  const filteredEvents = events.filter((evt) => {
    if (filter === 'upcoming') return !evt.is_past;
    if (filter === 'past') return evt.is_past;
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calendar size={28} color="var(--accent-primary)" />
            Événements Temporaires
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Organisez et participez aux sorties et événements de la communauté.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={18} />
          <span>Créer un événement</span>
        </button>
      </div>

      {/* Filtres par statut */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('all')}
        >
          Tous ({events.length})
        </button>
        <button
          className={`btn btn-sm ${filter === 'upcoming' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('upcoming')}
        >
          À venir ({events.filter((e) => !e.is_past).length})
        </button>
        <button
          className={`btn btn-sm ${filter === 'past' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('past')}
        >
          Passés ({events.filter((e) => e.is_past).length})
        </button>
      </div>

      {/* Liste des événements */}
      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: 12 }} />
          <div>Chargement des événements...</div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <h3>Aucun événement trouvé</h3>
          <p style={{ marginTop: 8 }}>Créez un nouvel événement temporaire pour vous rassembler !</p>
        </div>
      ) : (
        filteredEvents.map((evt) => (
          <EventCard key={evt.id} event={evt} onDelete={handleEventDeleted} />
        ))
      )}

      {/* Modal de création d'événement */}
      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
}
