import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/PostCard';
import { CreatePostModal } from '../components/CreatePostModal';
import { PlusCircle, Image, RefreshCw, Calendar, Users } from 'lucide-react';

export function FeedPage({ onNavigate }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.getPosts();
      setPosts(res.posts || []);
    } catch (err) {
      console.error("Erreur chargement posts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    api.getEvents().then((res) => {
      const ongoingOrUpcoming = (res.events || []).filter((e) => !e.is_past).slice(0, 3);
      setUpcomingEvents(ongoingOrUpcoming);
    }).catch(() => {});
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  return (
    <div className="feed-layout">
      {/* Colonne Principale : Publications */}
      <div>
        {/* Card de création rapide */}
        <div className="glass-card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} className="avatar" />
          ) : (
            <div className="avatar">
              {(user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase()}
            </div>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              flex: 1,
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-full)',
              padding: '12px 20px',
              textAlign: 'left',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'inherit',
              fontWeight: 500
            }}
          >
            <span>Partager des photos/vidéos (max 10) ou un message...</span>
            <Image size={18} color="var(--accent-primary)" />
          </button>

          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <PlusCircle size={18} />
            <span style={{ display: 'none', minWidth: 'md' }}>Publier</span>
          </button>
        </div>

        {/* Liste des publications */}
        {loading ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="spin" style={{ marginBottom: 12 }} />
            <div>Chargement du fil d'actualités...</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <h3>Aucune publication pour le moment</h3>
            <p style={{ marginTop: 8 }}>Soyez le premier à publier dans votre cercle privé !</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setIsModalOpen(true)}>
              <PlusCircle size={18} /> Publier un post
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />
          ))
        )}
      </div>

      {/* Colonne Latérale : Widgets & Événements à venir */}
      <aside>
        {/* Widget Événements à venir */}
        <div className="glass-card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={18} color="var(--accent-primary)" />
              Événements
            </h3>
            {onNavigate && (
              <button
                onClick={() => onNavigate('events')}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Voir tout
              </button>
            )}
          </div>

          {upcomingEvents.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Aucun événement prévu prochainement.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    padding: 12,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{evt.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    📅 {new Date(evt.start_time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Widget Quota Réseau */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Users size={18} color="#a855f7" />
            Cercle Privé
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Réseau restreint autohébergé. Capacité recommandée : 15 personnes sur VPS Linux LWS.
          </p>
        </div>
      </aside>

      {/* Modal de création de publication */}
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}
