from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.event import Event, EventRSVP
from app.utils.file_uploader import save_uploaded_file

events_bp = Blueprint('events', __name__, url_prefix='/api/events')

@events_bp.route('', methods=['GET'])
@jwt_required()
def get_events():
    user_id = int(get_jwt_identity())
    events = Event.query.order_by(Event.start_time.asc()).all()
    return jsonify({'events': [e.to_dict(current_user_id=user_id) for e in events]}), 200

@events_bp.route('', methods=['POST'])
@jwt_required()
def create_event():
    user_id = int(get_jwt_identity())
    
    # Form-data ou JSON
    if request.content_type and 'multipart/form-data' in request.content_type:
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        location = request.form.get('location', '').strip()
        start_time_str = request.form.get('start_time', '').strip()
        end_time_str = request.form.get('end_time', '').strip()
        cover_file = request.files.get('cover_image')
    else:
        data = request.get_json() or {}
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        location = data.get('location', '').strip()
        start_time_str = data.get('start_time', '').strip()
        end_time_str = data.get('end_time', '').strip()
        cover_file = None

    if not title or not start_time_str:
        return jsonify({'error': 'Le titre et la date de début sont obligatoires.'}), 400

    try:
        start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
    except ValueError:
        return jsonify({'error': 'Format de date de début invalide (ISO 8601 requis).'}), 400

    end_time = None
    if end_time_str:
        try:
            end_time = datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Format de date de fin invalide.'}), 400

    cover_image_url = None
    if cover_file and cover_file.filename != '':
        try:
            cover_image_url, _ = save_uploaded_file(cover_file, subfolder='events')
        except ValueError as err:
            return jsonify({'error': str(err)}), 400

    new_event = Event(
        creator_id=user_id,
        title=title,
        description=description,
        location=location,
        cover_image_url=cover_image_url,
        start_time=start_time,
        end_time=end_time
    )

    db.session.add(new_event)
    db.session.flush()

    # Le créateur participe par défaut
    creator_rsvp = EventRSVP(event_id=new_event.id, user_id=user_id, status='going')
    db.session.add(creator_rsvp)

    db.session.commit()

    return jsonify({
        'message': 'Événement temporaire créé avec succès.',
        'event': new_event.to_dict(current_user_id=user_id)
    }), 201

@events_bp.route('/<int:event_id>', methods=['GET'])
@jwt_required()
def get_event_detail(event_id):
    user_id = int(get_jwt_identity())
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Événement introuvable.'}), 404
    return jsonify({'event': event.to_dict(current_user_id=user_id)}), 200

@events_bp.route('/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    user_id = int(get_jwt_identity())
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Événement introuvable.'}), 404

    current_user = User.query.get(user_id)
    if event.creator_id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Vous n\'avez pas l\'autorisation de supprimer cet événement.'}), 403

    db.session.delete(event)
    db.session.commit()
    return jsonify({'message': 'Événement supprimé avec succès.'}), 200

@events_bp.route('/<int:event_id>/rsvp', methods=['POST'])
@jwt_required()
def rsvp_event(event_id):
    user_id = int(get_jwt_identity())
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Événement introuvable.'}), 404

    data = request.get_json() or {}
    status = data.get('status', '').strip().lower()  # 'going', 'maybe', 'declined'
    if status not in {'going', 'maybe', 'declined'}:
        return jsonify({'error': 'Statut invalide. Choisissez parmi : going, maybe, declined.'}), 400

    existing_rsvp = EventRSVP.query.filter_by(event_id=event_id, user_id=user_id).first()
    if existing_rsvp:
        existing_rsvp.status = status
    else:
        new_rsvp = EventRSVP(event_id=event_id, user_id=user_id, status=status)
        db.session.add(new_rsvp)

    db.session.commit()

    return jsonify({
        'message': 'Statut de participation mis à jour.',
        'event': event.to_dict(current_user_id=user_id)
    }), 200
