import React, { useState } from 'react';
import { api } from '../services/api';
import { MediaUploader } from './MediaUploader';
import { X, Send } from 'lucide-react';

export function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) {
      setError('Veuillez ajouter du texte ou au moins un média.');
      return;
    }

    if (files.length > 10) {
      setError('Vous ne pouvez pas ajouter plus de 10 médias par publication.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      files.forEach((file) => {
        formData.append('media', file);
      });

      const res = await api.createPost(formData);
      setContent('');
      setFiles([]);
      if (onPostCreated) onPostCreated(res.post);
      onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de la création de la publication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Nouvelle publication</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <textarea
              className="form-textarea"
              placeholder="Exprimez-vous auprès de vos 15 membres..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Médias (Photos & Vidéos - Max 10)</label>
            <MediaUploader files={files} setFiles={setFiles} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || (!content.trim() && files.length === 0)}>
              <Send size={18} />
              <span>{loading ? 'Publication...' : 'Publier'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
