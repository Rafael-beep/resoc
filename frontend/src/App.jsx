import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { FeedPage } from './pages/FeedPage';
import { EventsPage } from './pages/EventsPage';
import { MembersPage } from './pages/MembersPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';
import { RefreshCw } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');

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

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        {activeTab === 'feed' && <FeedPage onNavigate={setActiveTab} />}
        {activeTab === 'events' && <EventsPage />}
        {activeTab === 'members' && <MembersPage />}
        {activeTab === 'admin' && user.is_admin && <AdminPage />}
        {activeTab === 'profile' && <ProfilePage />}
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
