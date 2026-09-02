import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, getMediaUrl } from '../services/api';
import { PostCard } from '../components/PostCard';
import { Grid, Layers, Settings, Camera, Save, KeyRound, Mail, Heart, MessageSquare, X, Film, Edit3 } from 'lucide-react';

export function ProfilePage({ targetUsername }) {
  const { user: currentUser, updateUser } = useAuth();
  
  const usernameToFetch = targetUsername || currentUser?.username;
  const isOwnProfile = currentUser?.username === usernameToFetch;

  const [userProfile, setUserProfile] = useState(isOwnProfile ? currentUser : null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('grid');
  const [selectedPostModal, setSelectedPostModal] = useState(null);

  // Édition rapide de la Bio & Avatar (En-tête & Paramètres)
  const [firstName, setFirstName] = useState(currentUser?.first_name || '');
  const [lastName, setLastName] = useState(currentUser?.last_name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatarPreview, setAvatarPreview] = useState(getMediaUrl(currentUser?.avatar_url) || '');
  const [isEditingBioInline, setIsEditingBioInline] = useState(false);
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

  // Upload immédiat de photo de profil (Avatar)
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));
    setLoadingProfile(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('bio', bio);
      formData.append('email', email);

      const res = await api.updateProfile(formData);
      updateUser(res.user);
      setUserProfile(res.user);
      setAvatarPreview(getMediaUrl(res.user.avatar_url));
      setProfileMsg({ text: 'Photo de profil mise à jour !', type: 'success' });
    } catch (err) {
      setProfileMsg({ text: err.message || 'Erreur lors de l\'envoi de la photo.', type: 'danger' });
    } finally {
      setLoadingProfile(false);
    }
  };

  // Enregistrement de la bio et des infos
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setLoadingProfile(true);
    setProfileMsg({ text: '', type: '' });

    try {
      const formData = new FormData();
      formData.append('first_name', firstName.trim());
      formData.append('last_name', lastName.trim());
      formData.append('bio', bio.trim());
      formData.append('email', email.trim());

      const res = await api.updateProfile(formData);
      updateUser(res.user);
      setUserProfile(res.user);
      setIsEditingBioInline(false);
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

  const allMediaItems = userPosts.flatMap((post) =>
    (post.media || []).map((m) => ({
      ...m,
      post: post
    }))
  );

  const avatarUrl = isOwnProfile ? avatarPreview : getMediaUrl(userProfile?.avatar_url);

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
      {/* En-tête Profil Instagram */}
      <div className="glass-card" style={{ marginBottom: 24, padding: '28px 24px' }}>
        {profileMsg.text && <div className={`alert alert-${profileMsg.type}`} style={{ marginBottom: 20 }}>{profileMsg.text}</div>}

        <div className="insta-profile-header">
          {/* Avatar avec anneau dégradé vibrant & bouton de changement de photo si propre compte */}
          <div style={{ position: 'relative' }}>
            <div className="insta-avatar-ring">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userProfile.username} className="insta-avatar-img" />
              ) : (
                <div className="insta-avatar-placeholder">
                  {(userProfile.first_name?.[0] || userProfile.username[0]).toUpperCase()}
                </div>
              )}
            </div>

            {isOwnProfile && (
              <label
                htmlFor="headerAvatarInput"
                style={{
                  position: 'absolute',
                  bottom: 4,
                  right: 4,
                  background: 'var(--accent-gradient)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: 34,
                  height: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  border: '2px solid var(--bg-secondary)'
                }}
                title="Changer ma photo de profil"
              >
                <Camera size={18} />
              </label>
            )}
            <input
              type="file"
              id="headerAvatarInput"
              accept="image/*"
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
            />
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
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
              {userProfile.first_name ? `${userProfile.first_name} ${userProfile.last_name}` : userProfile.username}
            </div>

            {/* BIO DE L'UTILISATEUR AFFICHÉE SUR LE PROFIL */}
            <div style={{ marginTop: 8 }}>
              {isEditingBioInline ? (
                <div style={{ marginTop: 8 }}>
                  <textarea
                    className="form-textarea"
                    placeholder="Écrivez votre bio / citation..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    style={{ fontSize: '0.9rem' }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveProfile} disabled={loadingProfile}>
                      <Save size={14} /> Enregistrer la bio
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setIsEditingBioInline(false)}>
                      Annuler
                    </button>
                  </div>
                </div>
              ) : userProfile.bio ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 4 }}>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: 1.5, fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-primary)', width: '100%' }}>
                    "{userProfile.bio}"
                  </p>
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditingBioInline(true)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                      title="Modifier la bio"
                    >
                      <Edit3 size={16} />
                    </button>
                  )}
                </div>
              ) : (
                isOwnProfile && (
                  <div
                    style={{ fontSize: '0.88rem', color: 'var(--accent-primary)', marginTop: 6, cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    onClick={() => setIsEditingBioInline(true)}
                  >
                    <Edit3 size={14} /> + Ajouter une bio ou une phrase de présentation...
                  </div>
                )
              )}
            </div>
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

      {/* ONGLET 1 : GRILLE MÉDIAS */}
      {activeTab === 'grid' && (
        <div>
          {allMediaItems.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              Aucune photo ou vidéo publiée par ce membre.
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

                    <div className="insta-grid-badge">
                      {hasMultipleMedia ? <Layers size={14} color="#fff" /> : isVideo ? <Film size={14} color="#fff" /> : null}
                    </div>

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

      {/* ONGLET 2 : PUBLICATIONS */}
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

      {/* ONGLET 3 : PARAMÈTRES */}
      {activeTab === 'settings' && isOwnProfile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Changer ma photo & mes informations</h3>

            <form onSubmit={handleSaveProfile}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                <div style={{ position: 'relative' }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="avatar avatar-lg" />
                  ) : (
                    <div className="avatar avatar-lg">
                      {(firstName?.[0] || currentUser?.username?.[0] || '?').toUpperCase()}
                    </div>
                  )}
                  <label
                    htmlFor="settingsAvatarInput"
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
                  <input type="file" id="settingsAvatarInput" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                </div>

                <div>
                  <div style={{ fontWeight: 700 }}>@{currentUser?.username}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cliquez sur l'icône de caméra pour importer votre photo de profil</div>
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

      {/* MODAL DU POST */}
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
