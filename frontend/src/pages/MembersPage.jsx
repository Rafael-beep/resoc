import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, Mail, Shield, Calendar, RefreshCw } from 'lucide-react';

export function MembersPage() {
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
          Annuaire des Membres
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
          Membres faisant partie du réseau social privé ({members.length} / 15 membres actifs).
        </p>
      </div>

      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: 12 }} />
          <div>Chargement de l'annuaire...</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {members.map((m) => (
            <div key={m.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {m.avatar_url ? (
                <img src={m.avatar_url} alt={m.username} className="avatar avatar-lg" />
              ) : (
                <div className="avatar avatar-lg">
                  {(m.first_name?.[0] || m.username[0]).toUpperCase()}
                </div>
              )}

              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {m.first_name ? `${m.first_name} ${m.last_name}` : m.username}
                  {m.is_admin && <span className="badge badge-admin">Admin</span>}
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  @{m.username}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={14} />
                  <span>{m.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
