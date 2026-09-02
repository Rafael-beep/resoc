import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Sparkles, LogIn } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Veuillez saisir votre nom d\'utilisateur et votre mot de passe.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(username.trim(), password.trim());
    } catch (err) {
      setError(err.message || 'Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
    >
      <div className="glass-card" style={{ width: '100%', maxWidth: 420, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--accent-gradient)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              boxShadow: '0 8px 24px var(--accent-glow)'
            }}
          >
            <Sparkles size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Cercle Privé</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 6 }}>
            Réseau social privé autohébergé (15 membres)
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nom d'utilisateur</label>
            <div style={{ position: 'relative' }}>
              <User
                size={18}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Ex: admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: 42 }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}
              />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: 42 }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 10 }}>
            <LogIn size={18} />
            <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
          </button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
          🔒 Accès réservé. Les comptes sont attribués exclusivement par l'administrateur système.
        </div>
      </div>
    </div>
  );
}
