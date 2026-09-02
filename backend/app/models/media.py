from datetime import datetime
from app.extensions import db

class PostMedia(db.Model):
    __tablename__ = 'post_media'

    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False, index=True)
    file_path = db.Column(db.String(255), nullable=False)
    media_type = db.Column(db.String(20), nullable=False)  # 'photo' ou 'video'
    order_index = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'post_id': self.post_id,
            'file_path': self.file_path,
            'media_type': self.media_type,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
