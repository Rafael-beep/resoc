import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { FeedPage } from './pages/FeedPage';
import { EventsPage } from './pages/EventsPage';
import { MembersPage } from './pages/MembersPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';
import { RefreshCw, ArrowLeft } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [targetProfileUsername, setTargetProfileUsername] = useState(null);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={32} className="spin" style={{ marginBottom: 12, color: 'var(--accent-primary)' }} />
          <div>Chargement du Cercle Privé...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setTargetProfileUsername(null);
  };

  const handleOpenUserProfile = (username) => {
    setTargetProfileUsername(username);
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />
      
      <main className="main-content">
        {targetProfileUsername ? (
          <div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setTargetProfileUsername(null)}
              style={{ marginBottom: 16 }}
            >
              <ArrowLeft size={16} />
              <span>Retour</span>
            </button>
            <ProfilePage targetUsername={targetProfileUsername} />
          </div>
        ) : (
          <>
            {activeTab === 'feed' && <FeedPage onNavigate={handleTabChange} onViewProfile={handleOpenUserProfile} />}
            {activeTab === 'events' && <EventsPage />}
            {activeTab === 'members' && <MembersPage onViewProfile={handleOpenUserProfile} />}
            {activeTab === 'admin' && user.is_admin && <AdminPage />}
            {activeTab === 'profile' && <ProfilePage targetUsername={user.username} />}
          </>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
