from datetime import datetime
from app.extensions import db

class Event(db.Model):
    __tablename__ = 'events'

    id = db.Column(db.Integer, primary_key=True)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(255), nullable=True)
    cover_image_url = db.Column(db.String(255), nullable=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relations
    rsvps = db.relationship('EventRSVP', backref='event', lazy=True, cascade="all, delete-orphan")

    def to_dict(self, current_user_id=None):
        now = datetime.utcnow()
        is_past = self.end_time < now if self.end_time else self.start_time < now
        is_ongoing = self.start_time <= now and (self.end_time >= now if self.end_time else True)

        user_rsvp = None
        rsvp_counts = {'going': 0, 'maybe': 0, 'declined': 0}
        
        for rsvp in self.rsvps:
            if rsvp.status in rsvp_counts:
                rsvp_counts[rsvp.status] += 1
            if current_user_id and rsvp.user_id == current_user_id:
                user_rsvp = rsvp.status

        return {
            'id': self.id,
            'creator_id': self.creator_id,
            'creator': self.creator.to_dict() if self.creator else None,
            'title': self.title,
            'description': self.description or '',
            'location': self.location or '',
            'cover_image_url': self.cover_image_url or '',
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_past': is_past,
            'is_ongoing': is_ongoing,
            'rsvp_counts': rsvp_counts,
            'user_rsvp': user_rsvp,
            'participants': [
                {
                    'user': rsvp.user.to_dict(),
                    'status': rsvp.status
                } for rsvp in self.rsvps if rsvp.user
            ]
        }


class EventRSVP(db.Model):
    __tablename__ = 'event_rsvps'

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    status = db.Column(db.String(20), nullable=False)  # 'going', 'maybe', 'declined'
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('event_id', 'user_id', name='unique_event_user_rsvp'),
    )
