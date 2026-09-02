import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Home, Calendar, Users, Shield, LogOut, User as UserIcon } from 'lucide-react';

export function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <>
      {/* Header Desktop & Tablet */}
      <header className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('feed')}>
            <span>✦</span> Cercle Privé
          </div>

          <nav className="navbar-nav desktop-nav">
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

            <button className="action-btn" onClick={logout} title="Déconnexion" style={{ color: 'var(--color-danger)', marginLeft: 8 }}>
              <LogOut size={18} />
            </button>
          </nav>
        </div>
      </header>

      {/* Navigation Bas de Page dédiée aux Smartphones / Mobiles */}
      <nav className="mobile-bottom-bar">
        <button
          className={`mobile-nav-item ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          <Home size={20} />
          <span>Fil</span>
        </button>

        <button
          className={`mobile-nav-item ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <Calendar size={20} />
          <span>Événements</span>
        </button>

        <button
          className={`mobile-nav-item ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <Users size={20} />
          <span>Membres</span>
        </button>

        {user.is_admin && (
          <button
            className={`mobile-nav-item ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <Shield size={20} />
            <span>Admin</span>
          </button>
        )}

        <button
          className={`mobile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} className="avatar avatar-sm" style={{ width: 22, height: 22 }} />
          ) : (
            <UserIcon size={20} />
          )}
          <span>Profil</span>
        </button>
      </nav>
    </>
  );
}
