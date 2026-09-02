from datetime import datetime
from app.extensions import db

class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    content = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    media_items = db.relationship('PostMedia', backref='post', lazy=True, cascade="all, delete-orphan", order_by="PostMedia.order_index")
    comments = db.relationship('Comment', backref='post', lazy=True, cascade="all, delete-orphan", order_by="Comment.created_at.asc()")
    reactions = db.relationship('Reaction', backref='post', lazy=True, cascade="all, delete-orphan")

    def to_dict(self, current_user_id=None):
        reactions_count = len(self.reactions)
        user_reaction = None
        if current_user_id:
            for r in self.reactions:
                if r.user_id == current_user_id:
                    user_reaction = r.reaction_type
                    break

        return {
            'id': self.id,
            'user_id': self.user_id,
            'author': self.author.to_dict() if self.author else None,
            'content': self.content or '',
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'media': [m.to_dict() for m in self.media_items],
            'comments_count': len(self.comments),
            'reactions_count': reactions_count,
            'user_reaction': user_reaction
        }
