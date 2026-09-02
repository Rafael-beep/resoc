import React, { useState, useEffect } from 'react';
import { api, getMediaUrl } from '../services/api';
import { Users, Mail, RefreshCw } from 'lucide-react';

export function MembersPage({ onViewProfile }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await api.getDirectory();
        setMembers(res.users || []);
      } catch (err) {
        console.error("Erreur chargement membres", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={28} color="var(--accent-primary)" />
          Membres du Cercle Privé
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
          Cliquez sur la carte d'un membre pour afficher son profil et sa galerie de médias ({members.length} / 15 membres).
        </p>
      </div>

      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: 12 }} />
          <div>Chargement des membres...</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {members.map((m) => {
            const avatarUrl = getMediaUrl(m.avatar_url);

            return (
              <div
                key={m.id}
                className="glass-card"
                style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'transform var(--transition-fast)' }}
                onClick={() => onViewProfile && onViewProfile(m.username)}
              >
                <div className="insta-avatar-ring-sm">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={m.username} className="avatar avatar-lg" />
                  ) : (
                    <div className="avatar avatar-lg">
                      {(m.first_name?.[0] || m.username[0]).toUpperCase()}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {m.first_name ? `${m.first_name} ${m.last_name}` : m.username}
                    {m.is_admin && <span className="badge badge-admin">Admin</span>}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    @{m.username}
                  </div>

                  {m.bio && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', marginTop: 6, fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      "{m.bio}"
                    </div>
                  )}

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={14} />
                    <span>{m.email}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
