import React, { useState, useEffect } from 'react';
import { api, getMediaUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Send, Trash2 } from 'lucide-react';

export function CommentSection({ postId, onViewProfile }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await api.getComments(postId);
        setComments(res.comments || []);
      } catch (err) {
        console.error("Erreur chargement commentaires", err);
      } finally {
        setLoading(false);
      }
    }
    fetchComments();
  }, [postId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await api.addComment(postId, newComment.trim());
      setComments((prev) => [...prev, res.comment]);
      setNewComment('');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    try {
      await api.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
      {loading ? (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Chargement des commentaires...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {comments.map((comment) => {
            const authorAvatar = getMediaUrl(comment.author?.avatar_url);

            return (
              <div
                key={comment.id}
                style={{
                  display: 'flex',
                  gap: 10,
                  background: 'rgba(255,255,255,0.03)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div
                  onClick={() => onViewProfile && comment.author?.username && onViewProfile(comment.author.username)}
                  style={{ cursor: onViewProfile ? 'pointer' : 'default' }}
                >
                  {authorAvatar ? (
                    <img src={authorAvatar} alt={comment.author.username} className="avatar avatar-sm" />
                  ) : (
                    <div className="avatar avatar-sm">
                      {(comment.author?.first_name?.[0] || comment.author?.username?.[0] || '?').toUpperCase()}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{ fontWeight: 700, fontSize: '0.85rem', cursor: onViewProfile ? 'pointer' : 'default' }}
                      onClick={() => onViewProfile && comment.author?.username && onViewProfile(comment.author.username)}
                    >
                      {comment.author?.first_name ? `${comment.author.first_name} ${comment.author.last_name}` : comment.author?.username}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.9rem', marginTop: 4, color: 'var(--text-main)' }}>
                    {comment.content}
                  </div>
                </div>

                {(user?.is_admin || user?.id === comment.user_id) && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', alignSelf: 'flex-start' }}
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <input
          type="text"
          placeholder="Ajouter un commentaire..."
          className="form-input"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={submitting}
          style={{ borderRadius: 'var(--radius-full)', padding: '8px 16px' }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || !newComment.trim()}
          style={{ borderRadius: 'var(--radius-full)', padding: '8px 16px' }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
