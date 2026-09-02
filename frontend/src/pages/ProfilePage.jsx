import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, getMediaUrl } from '../services/api';
import { PostCard } from '../components/PostCard';
import { Grid, Layers, Settings, Camera, Save, KeyRound, Mail, Heart, MessageSquare, X, Film, Image as ImageIcon } from 'lucide-react';

export function ProfilePage({ targetUsername }) {
  const { user: currentUser, updateUser } = useAuth();
  
  // Si aucun targetUsername n'est fourni, afficher le profil de l'utilisateur connecté
  const usernameToFetch = targetUsername || currentUser?.username;
  const isOwnProfile = currentUser?.username === usernameToFetch;

  const [userProfile, setUserProfile] = useState(isOwnProfile ? currentUser : null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('grid'); // 'grid', 'feed', 'settings'
  const [selectedPostModal, setSelectedPostModal] = useState(null);

  // Édition de profil (Propriétaire)
  const [firstName, setFirstName] = useState(currentUser?.first_name || '');
  const [lastName, setLastName] = useState(currentUser?.last_name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(getMediaUrl(currentUser?.avatar_url) || '');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

  // Changement de mot de passe
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [pwdMsg, setPwdMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const res = await api.getUserProfile(usernameToFetch);
        setUserProfile(res.user);
        setUserPosts(res.posts || []);
        if (isOwnProfile) {
          setFirstName(res.user.first_name || '');
          setLastName(res.user.last_name || '');
          setBio(res.user.bio || '');
          setEmail(res.user.email || '');
          setAvatarPreview(getMediaUrl(res.user.avatar_url));
        }
      } catch (err) {
        console.error("Erreur chargement profil", err);
      } finally {
        setLoading(false);
      }
    }
    if (usernameToFetch) {
      loadProfile();
    }
  }, [usernameToFetch]);

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
      formData.append('bio', bio.trim());
      formData.append('email', email.trim());
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await api.updateProfile(formData);
      updateUser(res.user);
      setUserProfile(res.user);
      setProfileMsg({ text: 'Profil mis à jour avec succès.', type: 'success' });
    } catch (err) {
      setProfileMsg({ text: err.message || 'Erreur lors de la mise à jour.', type: 'danger' });
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

  // Récupérer la liste plate de tous les médias du membre pour la grille Instagram
  const allMediaItems = userPosts.flatMap((post) =>
    (post.media || []).map((m) => ({
      ...m,
      post: post
    }))
  );

  const avatarUrl = getMediaUrl(userProfile?.avatar_url);

  if (loading) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
        Chargement du profil...
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: 40 }}>
        Membre introuvable.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      {/* En-tête Profil Style Instagram */}
      <div className="glass-card" style={{ marginBottom: 24, padding: '28px 24px' }}>
        <div className="insta-profile-header">
          {/* Avatar avec anneau dégradé vibrant */}
          <div className="insta-avatar-ring">
            {avatarUrl ? (
              <img src={avatarUrl} alt={userProfile.username} className="insta-avatar-img" />
            ) : (
              <div className="insta-avatar-placeholder">
                {(userProfile.first_name?.[0] || userProfile.username[0]).toUpperCase()}
              </div>
            )}
          </div>

          {/* Informations Utilisateur */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>@{userProfile.username}</h2>
              {userProfile.is_admin && <span className="badge badge-admin">Admin</span>}

              {isOwnProfile ? (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveTab(activeTab === 'settings' ? 'grid' : 'settings')}
                >
                  <Settings size={14} />
                  <span>{activeTab === 'settings' ? 'Voir mon profil' : 'Éditer le profil'}</span>
                </button>
              ) : (
                <a
                  href={`mailto:${userProfile.email}`}
                  className="btn btn-secondary btn-sm"
                >
                  <Mail size={14} />
                  <span>Contacter</span>
                </a>
              )}
            </div>

            {/* Compteurs / Stats */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 14, fontSize: '0.95rem' }}>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>{userPosts.length}</strong>{' '}
                <span style={{ color: 'var(--text-muted)' }}>publications</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>{allMediaItems.length}</strong>{' '}
                <span style={{ color: 'var(--text-muted)' }}>médias</span>
              </div>
            </div>

            {/* Nom & Prénom */}
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
              {userProfile.first_name ? `${userProfile.first_name} ${userProfile.last_name}` : userProfile.username}
            </div>

            {/* Bio / Citation */}
            {userProfile.bio ? (
              <p style={{ fontSize: '0.92rem', marginTop: 6, color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                {userProfile.bio}
              </p>
            ) : (
              isOwnProfile && (
                <div
                  style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', marginTop: 4, cursor: 'pointer', fontStyle: 'italic' }}
                  onClick={() => setActiveTab('settings')}
                >
                  + Ajouter une bio ou une phrase de présentation...
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Barre d'onglets Style Instagram */}
      <div className="insta-tabs-bar">
        <button
          className={`insta-tab-btn ${activeTab === 'grid' ? 'active' : ''}`}
          onClick={() => setActiveTab('grid')}
        >
          <Grid size={18} />
          <span>GRILLE</span>
        </button>

        <button
          className={`insta-tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          <Layers size={18} />
          <span>PUBLICATIONS</span>
        </button>

        {isOwnProfile && (
          <button
            className={`insta-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            <span>PARAMÈTRES</span>
          </button>
        )}
      </div>

      {/* ONGLET 1 : GRILLE MÉDIAS INSTAGRAM */}
      {activeTab === 'grid' && (
        <div>
          {allMediaItems.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              Aucune photo ou vidéo publiée.
            </div>
          ) : (
            <div className="insta-media-grid">
              {allMediaItems.map((item, idx) => {
                const fullUrl = getMediaUrl(item.file_path);
                const isVideo = item.media_type === 'video';
                const hasMultipleMedia = item.post?.media?.length > 1;

                return (
                  <div
                    key={idx}
                    className="insta-grid-item"
                    onClick={() => setSelectedPostModal(item.post)}
                  >
                    {isVideo ? (
                      <video src={fullUrl} className="insta-grid-media" />
                    ) : (
                      <img src={fullUrl} alt={`Média ${idx + 1}`} className="insta-grid-media" />
                    )}

                    {/* Indicateurs en haut à droite (Vidéo / Multiples photos) */}
                    <div className="insta-grid-badge">
                      {hasMultipleMedia ? <Layers size={14} color="#fff" /> : isVideo ? <Film size={14} color="#fff" /> : null}
                    </div>

                    {/* Effet de survol avec likes et commentaires */}
                    <div className="insta-grid-overlay">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Heart size={18} fill="#fff" />
                        <span>{item.post?.reactions_count || 0}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MessageSquare size={18} fill="#fff" />
                        <span>{item.post?.comments_count || 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ONGLET 2 : FIL DE PUBLICATIONS */}
      {activeTab === 'feed' && (
        <div>
          {userPosts.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              Aucune publication.
            </div>
          ) : (
            userPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={(deletedId) => setUserPosts((prev) => prev.filter((p) => p.id !== deletedId))}
              />
            ))
          )}
        </div>
      )}

      {/* ONGLET 3 : PARAMÈTRES ET ÉDITION DU PROFIL (Si propre profil) */}
      {activeTab === 'settings' && isOwnProfile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Éditer mon profil</h3>

            {profileMsg.text && <div className={`alert alert-${profileMsg.type}`}>{profileMsg.text}</div>}

            <form onSubmit={handleSaveProfile}>
              {/* Photo de profil / Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                <div style={{ position: 'relative' }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="avatar avatar-lg" />
                  ) : (
                    <div className="avatar avatar-lg">
                      {(firstName?.[0] || currentUser?.username?.[0] || '?').toUpperCase()}
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
                      cursor: 'pointer'
                    }}
                    title="Changer la photo"
                  >
                    <Camera size={16} />
                  </label>
                  <input type="file" id="avatarInput" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                </div>

                <div>
                  <div style={{ fontWeight: 700 }}>@{currentUser?.username}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Changer de photo de profil</div>
                </div>
              </div>

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
                <label className="form-label">Bio / Citation</label>
                <textarea
                  className="form-textarea"
                  placeholder="Écrivez une phrase de présentation ou une citation..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Adresse Email</label>
                <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loadingProfile} style={{ marginTop: 10 }}>
                <Save size={16} />
                <span>{loadingProfile ? 'Enregistrement...' : 'Sauvegarder le profil'}</span>
              </button>
            </form>
          </div>

          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <KeyRound size={18} color="var(--accent-primary)" />
              Sécurité & Mot de passe
            </h3>

            {pwdMsg.text && <div className={`alert alert-${pwdMsg.type}`}>{pwdMsg.text}</div>}

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Ancien mot de passe</label>
                <input type="password" className="form-input" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Nouveau mot de passe</label>
                <input type="password" className="form-input" placeholder="Minimum 6 caractères" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>

              <button type="submit" className="btn btn-secondary" disabled={loadingPassword || !oldPassword || !newPassword}>
                <span>{loadingPassword ? 'Modification...' : 'Modifier le mot de passe'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL POUR AFFICHER LA PUBLICATION CLIQUÉE DANS LA GRILLE */}
      {selectedPostModal && (
        <div className="modal-overlay" onClick={() => setSelectedPostModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <button onClick={() => setSelectedPostModal(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <PostCard
              post={selectedPostModal}
              onDelete={(deletedId) => {
                setUserPosts((prev) => prev.filter((p) => p.id !== deletedId));
                setSelectedPostModal(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
