import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Camera, Lock, Save, KeyRound } from 'lucide-react';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || '');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

  // Changement de mot de passe
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [pwdMsg, setPwdMsg] = useState({ text: '', type: '' });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    setProfileMsg({ text: '', type: '' });

    try {
      const formData = new FormData();
      formData.append('first_name', firstName.trim());
      formData.append('last_name', lastName.trim());
      formData.append('email', email.trim());
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await api.updateProfile(formData);
      updateUser(res.user);
      setProfileMsg({ text: 'Profil mis à jour avec succès.', type: 'success' });
    } catch (err) {
      setProfileMsg({ text: err.message || 'Erreur lors de la mise à jour du profil.', type: 'danger' });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;

    setLoadingPassword(true);
    setPwdMsg({ text: '', type: '' });

    try {
      const res = await api.changePassword(oldPassword, newPassword);
      setPwdMsg({ text: res.message, type: 'success' });
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setPwdMsg({ text: err.message, type: 'danger' });
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <User size={28} color="var(--accent-primary)" />
          Mon Profil
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
          Gérez vos informations personnelles et la sécurité de votre compte.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        {/* Formulaire de profil */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20 }}>Informations Personnelles</h2>

          {profileMsg.text && (
            <div className={`alert alert-${profileMsg.type}`}>{profileMsg.text}</div>
          )}

          <form onSubmit={handleSaveProfile}>
            {/* Photo de profil / Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
              <div style={{ position: 'relative' }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="avatar avatar-lg" />
                ) : (
                  <div className="avatar avatar-lg">
                    {(firstName?.[0] || user?.username?.[0] || '?').toUpperCase()}
                  </div>
                )}
                <label
                  htmlFor="avatarInput"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: 'var(--accent-primary)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                  }}
                  title="Changer la photo de profil"
                >
                  <Camera size={16} />
                </label>
                <input
                  type="file"
                  id="avatarInput"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>@{user?.username}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Rôle : {user?.is_admin ? 'Administrateur' : 'Membre'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Prénom</label>
                <input
                  type="text"
                  className="form-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nom</label>
                <input
                  type="text"
                  className="form-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Adresse Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loadingProfile} style={{ marginTop: 10 }}>
              <Save size={18} />
              <span>{loadingProfile ? 'Enregistrement...' : 'Enregistrer le profil'}</span>
            </button>
          </form>
        </div>

        {/* Formulaire de sécurité & mot de passe */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <KeyRound size={20} color="var(--accent-primary)" />
            Sécurité du Compte
          </h2>

          {pwdMsg.text && (
            <div className={`alert alert-${pwdMsg.type}`}>{pwdMsg.text}</div>
          )}

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Ancien mot de passe</label>
              <input
                type="password"
                className="form-input"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nouveau mot de passe</label>
              <input
                type="password"
                className="form-input"
                placeholder="Minimum 6 caractères"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-secondary" disabled={loadingPassword || !oldPassword || !newPassword}>
              <span>{loadingPassword ? 'Modification...' : 'Modifier le mot de passe'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
