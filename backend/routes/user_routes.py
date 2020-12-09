from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from backend.db import db
from backend.db.models import UserType, User, Specialization, UserStatus
from datetime import datetime

user_routes = Blueprint('user_routes', __name__, url_prefix='/user')


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


@user_routes.route('/<username>', methods=['GET'])
def getUserByUsername(username):
    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"error": "User not found"}), 404

    payload = user.serialize()
    appointments_list = []
    prescriptions_list = []
    if user.user_type == UserType.PATIENT:
        appointments = user.p_appointments
        prescriptions = user.p_prescriptions
        for appointment in appointments:
            appointments_list.append(appointment.serialize(UserType.PATIENT))
        for prescription in prescriptions:
            prescriptions_list.append(prescription.serialize(UserType.PATIENT))
    elif user.user_type == UserType.DOCTOR:
        appointments = user.d_appointments
        prescriptions = user.d_prescriptions
        for appointment in appointments:
            appointments_list.append(appointment.serialize(UserType.DOCTOR))
        for prescription in prescriptions:
            prescriptions_list.append(prescription.serialize(UserType.DOCTOR))

    payload['appointments'] = appointments_list
    payload['prescriptions'] = prescriptions_list

    return jsonify(payload), 200


@user_routes.route('/getAllDoctors', methods=['GET'])
def getAllDoctors():
    doctors = User.query.filter_by(user_type=UserType.DOCTOR).all()
    if doctors is None:
        return jsonify({"error": "No doctor found"}), 404

    payload = {'doctors': []}
    for doctor in doctors:
        payload['doctors'].append(doctor.serialize())
    return jsonify(payload), 200


@user_routes.route('/getDoctorBySpecialization', methods=['GET'])
def getDoctorBySpecialization():
    spec = request.args.get('spec')
    specialization = Specialization.query.filter_by(spec=spec).first()
    if specialization is None:
        return jsonify({"error": "Specialization not found"}), 404
    doctors = specialization.doctors
    if not doctors:
        return jsonify({"error": "No doctor found"}), 404

    payload = {'doctors': []}
    for doctor in doctors:
        payload['doctors'].append(doctor.serialize())

    return jsonify(payload), 200
