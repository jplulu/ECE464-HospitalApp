from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from backend.db import db
from backend.db.models import UserType, User, Specialization, UserStatus
from datetime import datetime

user_routes = Blueprint('user_routes', __name__, url_prefix='/user')


@user_routes.route('/login', methods=['POST'])
def login():
    email = request.args.get('email')
    password = request.args.get('password')
    user_type = request.args.get('user_type')

    user = User.query.filter_by(email=email, user_type=user_type).first()
    if user is not None and user.check_password(password):
        return jsonify({
            'id': user.id,
            'username': user.username,
            'user_type': user.user_type.name,
            'user_status': user.user_status.name
        }), 200

    return jsonify({"error": "Login failed"}), 401


@user_routes.route('/register', methods=['POST'])
def addUser():
    data = request.get_json()

    if data['user_type'] == UserType.PATIENT.name:
        dob = datetime.strptime(data['dob'], '%Y-%m-%d').date()
        new_user = User(data['email'], data['username'], data['first_name'], data['last_name'], dob,
                        data['phone_number'], UserType.PATIENT, UserStatus.APPROVED)
    elif data['user_type'] == UserType.DOCTOR.name:
        dob = datetime.strptime(data['dob'], '%Y-%m-%d').date()
        specialization = Specialization.query.filter_by(spec=data['specialization']).first()
        if specialization is None:
            return jsonify({"error": "Specialization not found"}), 404
        new_user = User(data['email'], data['username'], data['first_name'], data['last_name'], dob,
                        data['phone_number'], UserType.DOCTOR, UserStatus.PENDING)
        new_user.specialization = specialization
    else:
        new_user = User(data['email'], data['username'], data['first_name'], data['last_name'], None, None,
                        UserType.ADMIN, UserStatus.APPROVED)
    new_user.set_password(data['password'])

    try:
        db.session.add(new_user)
        db.session.commit()
    except IntegrityError:
        return jsonify({"error": "Email or username already registered"}), 409

    return jsonify(new_user.serialize()), 200


@user_routes.route('', methods=['GET'])
def getUserByUsername():
    username = request.args.get('username')
    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"error": "User not found"}), 404

    return jsonify(user.serialize()), 200


# Allows filtering of doctors based on specialization and status
@user_routes.route('/getDoctors', methods=['GET'])
def getDoctors():
    spec_filter = request.args.get('spec')
    status_filter = request.args.get('status')
    doctors = User.query.filter_by(user_type=UserType.DOCTOR)
    if status_filter:
        doctors = doctors.filter_by(user_status=status_filter)
    if spec_filter:
        specialization = Specialization.query.filter_by(spec=spec_filter).first()
        if specialization is None:
            return jsonify({"error": "Specialization not found"}), 404
        doctors = doctors.filter_by(specialization=specialization)
    doctors = doctors.all()
    if not doctors:
        return jsonify({"error": "No doctor found"}), 404

    payload = {'doctors': []}
    for doctor in doctors:
        payload['doctors'].append(doctor.serialize())

    return jsonify(payload), 200


# Allows updating of user status
@user_routes.route('', methods=['PUT'])
def updateUser():
    username = request.args.get('username')
    new_status = request.args.get('status')
    if username is None:
        return jsonify({"error": "Missing request parameters"}), 400

    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"error": "User not found"}), 404

    if new_status:
        if new_status not in ['PENDING', 'APPROVED', 'REJECTED']:
            return jsonify({"error": "Invalid status"}), 400
        user.user_status = new_status
    db.session.commit()

    return jsonify(user.serialize()), 200
