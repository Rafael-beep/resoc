import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Calendar, MapPin, PlusCircle } from 'lucide-react';

export function CreateEventModal({ isOpen, onClose, onEventCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !startTime) {
      setError('Veuillez renseigner le titre et la date/heure de début.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('location', location.trim());
      formData.append('start_time', new Date(startTime).toISOString());
      if (endTime) {
        formData.append('end_time', new Date(endTime).toISOString());
      }
      if (coverFile) {
        formData.append('cover_image', coverFile);
      }

      const res = await api.createEvent(formData);
      if (onEventCreated) onEventCreated(res.event);
      onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de la création de l\'événement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Créer un événement temporaire</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Titre de l'événement *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Barbecue du réseau, Soirée jeux..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Date & Heure de début *</label>
              <input
                type="datetime-local"
                className="form-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date & Heure de fin (optionnel)</label>
              <input
                type="datetime-local"
                className="form-input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Lieu</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Maison de campagne, En ligne..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Détails de l'événement..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Image de couverture (optionnelle)</label>
            <input
              type="file"
              accept="image/*"
              className="form-input"
              onChange={(e) => setCoverFile(e.target.files[0] || null)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <PlusCircle size={18} />
              <span>{loading ? 'Création...' : 'Créer l\'événement'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
