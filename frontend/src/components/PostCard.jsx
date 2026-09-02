import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, getMediaUrl } from '../services/api';
import { MediaCarousel } from './MediaCarousel';
import { CommentSection } from './CommentSection';
import { Heart, MessageSquare, Trash2 } from 'lucide-react';

export function PostCard({ post, onDelete, onViewProfile }) {
  const { user } = useAuth();
  const [reactionsCount, setReactionsCount] = useState(post.reactions_count || 0);
  const [userReaction, setUserReaction] = useState(post.user_reaction);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount] = useState(post.comments_count || 0);

  const handleToggleReaction = async () => {
    try {
      const res = await api.toggleReaction(post.id, 'like');
      if (res.user_reaction) {
        if (!userReaction) setReactionsCount((c) => c + 1);
        setUserReaction('like');
      } else {
        setReactionsCount((c) => Math.max(0, c - 1));
        setUserReaction(null);
      }
    } catch (err) {
      console.error("Erreur réaction", err);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette publication ?")) return;
    try {
      await api.deletePost(post.id);
      if (onDelete) onDelete(post.id);
    } catch (err) {
      alert(err.message);
    }
  };

  const author = post.author || {};
  const authorAvatarUrl = getMediaUrl(author.avatar_url);
  const isAuthorOrAdmin = user?.is_admin || user?.id === post.user_id;

  const handleAuthorClick = () => {
    if (onViewProfile && author.username) {
      onViewProfile(author.username);
    }
  };

  return (
    <article className="glass-card post-card">
      <header className="post-header">
        <div
          className="post-author"
          onClick={handleAuthorClick}
          style={{ cursor: onViewProfile ? 'pointer' : 'default' }}
          title={onViewProfile ? `Voir le profil de ${author.username}` : ''}
        >
          {authorAvatarUrl ? (
            <img src={authorAvatarUrl} alt={author.username} className="avatar" />
          ) : (
            <div className="avatar">
              {(author.first_name?.[0] || author.username?.[0] || '?').toUpperCase()}
            </div>
          )}

          <div>
            <div className="post-author-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{author.first_name ? `${author.first_name} ${author.last_name}` : author.username}</span>
              {author.is_admin && <span className="badge badge-admin">Admin</span>}
            </div>
            <div className="post-date">
              {new Date(post.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        {isAuthorOrAdmin && (
          <button
            onClick={handleDeletePost}
            className="action-btn"
            style={{ color: 'var(--color-danger)' }}
            title="Supprimer la publication"
          >
            <Trash2 size={18} />
          </button>
        )}
      </header>

      {post.content && <div className="post-content">{post.content}</div>}

      {post.media && post.media.length > 0 && <MediaCarousel mediaList={post.media} />}

      <footer className="post-actions">
        <button
          className={`action-btn ${userReaction ? 'active' : ''}`}
          onClick={handleToggleReaction}
          style={{ color: userReaction ? '#ef4444' : undefined }}
        >
          <Heart size={20} fill={userReaction ? '#ef4444' : 'none'} />
          <span>{reactionsCount}</span>
        </button>

        <button
          className={`action-btn ${showComments ? 'active' : ''}`}
          onClick={() => setShowComments(!showComments)}
        >
          <MessageSquare size={20} />
          <span>{commentsCount} commentaires</span>
        </button>
      </footer>

      {showComments && <CommentSection postId={post.id} onViewProfile={onViewProfile} />}
    </article>
  );
}
