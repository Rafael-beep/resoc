import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Home, Calendar, Users, Shield, LogOut, User as UserIcon } from 'lucide-react';

export function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('feed')}>
          <span>✦</span> Cercle Privé
        </div>

        <nav className="navbar-nav">
          <button
            className={`nav-link ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            <Home size={18} />
            <span>Fil</span>
          </button>

          <button
            className={`nav-link ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <Calendar size={18} />
            <span>Événements</span>
          </button>

          <button
            className={`nav-link ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <Users size={18} />
            <span>Membres</span>
          </button>

          {user.is_admin && (
            <button
              className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <Shield size={18} />
              <span>Admin</span>
              <span className="badge badge-admin">Admin</span>
            </button>
          )}

          <button
            className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} className="avatar avatar-sm" />
            ) : (
              <div className="avatar avatar-sm">
                {(user.first_name?.[0] || user.username[0]).toUpperCase()}
              </div>
            )}
            <span>{user.first_name || user.username}</span>
          </button>

          <button className="action-btn" onClick={logout} title="Déconnexion" style={{ color: 'var(--color-danger)' }}>
            <LogOut size={18} />
          </button>
        </nav>
      </div>
    </header>
  );
}
