import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Shield, UserPlus, KeyRound, Power, Trash2, Check, X, RefreshCw, AlertCircle } from 'lucide-react';

export function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal Créer un compte
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modal Réinitialiser Mot de passe
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminUsers();
      setUsers(res.users || []);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Nom d\'utilisateur, email et mot de passe requis.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.createAdminUser({
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        is_admin: isAdmin
      });

      setSuccess(`Compte pour ${res.user.username} créé avec succès.`);
      setUsers((prev) => [res.user, ...prev]);

      // Réinitialiser formulaire
      setUsername('');
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setIsAdmin(false);
      setIsCreateModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (userObj) => {
    try {
      const res = await api.toggleUserStatus(userObj.id);
      setUsers((prev) =>
        prev.map((u) => (u.id === userObj.id ? { ...u, is_active: res.user.is_active } : u))
      );
      setSuccess(res.message);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetModalUser || !newPassword.trim()) return;

    try {
      const res = await api.resetUserPassword(resetModalUser.id, newPassword.trim());
      setSuccess(res.message);
      setResetModalUser(null);
      setNewPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userObj) => {
    if (!window.confirm(`Supprimer définitivement le compte de ${userObj.username} ?`)) return;
    try {
      await api.deleteUser(userObj.id);
      setUsers((prev) => prev.filter((u) => u.id !== userObj.id));
      setSuccess(`Compte de ${userObj.username} supprimé.`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={28} color="#c084fc" />
            Gestion Unique des Comptes
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Espace d'administration exclusive pour gérer les accès des 15 membres autorisés.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="badge badge-admin" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            {users.length} / 15 Membres
          </span>

          <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            <UserPlus size={18} />
            <span>Créer un compte</span>
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Tableau des utilisateurs */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="spin" style={{ marginBottom: 12 }} />
            <div>Chargement des comptes utilisateurs...</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>Utilisateur</th>
                  <th style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>Email</th>
                  <th style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>Rôle</th>
                  <th style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>Statut</th>
                  <th style={{ padding: '14px 20px', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar avatar-sm">
                        {(u.first_name?.[0] || u.username[0]).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{u.first_name ? `${u.first_name} ${u.last_name}` : u.username}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{u.username}</div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>{u.email}</td>
                    <td style={{ padding: '14px 20px' }}>
                      {u.is_admin ? (
                        <span className="badge badge-admin">Admin</span>
                      ) : (
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>Membre</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {u.is_active ? (
                        <span style={{ color: 'var(--color-success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Check size={14} /> Actif
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-danger)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <X size={14} /> Désactivé
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button
                          className={`btn btn-sm ${u.is_active ? 'btn-secondary' : 'btn-primary'}`}
                          onClick={() => handleToggleStatus(u)}
                          title={u.is_active ? 'Désactiver le compte' : 'Activer le compte'}
                        >
                          <Power size={14} />
                        </button>

                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setResetModalUser(u)}
                          title="Réinitialiser le mot de passe"
                        >
                          <KeyRound size={14} />
                        </button>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteUser(u)}
                          title="Supprimer le compte"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de création d'utilisateur par l'administrateur */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Créer un membre (Admin)</h2>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Prénom</label>
                  <input type="text" className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom</label>
                  <input type="text" className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nom d'utilisateur *</label>
                <input type="text" className="form-input" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Mot de passe initial *</label>
                <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
                <input
                  type="checkbox"
                  id="isAdminCheck"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--accent-primary)' }}
                />
                <label htmlFor="isAdminCheck" style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                  Accorder les privilèges Administrateur
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)} disabled={submitting}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  <span>{submitting ? 'Création...' : 'Créer le compte'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Réinitialisation Mot de Passe */}
      {resetModalUser && (
        <div className="modal-overlay" onClick={() => setResetModalUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2 className="modal-title">Réinitialiser le mot de passe</h2>
              <button onClick={() => setResetModalUser(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Nouveau mot de passe pour <strong>{resetModalUser.username}</strong> :
            </p>

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <input
                  type="password"
                  className="form-input"
                  placeholder="Minimum 6 caractères"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setResetModalUser(null)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={!newPassword.trim()}>
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
