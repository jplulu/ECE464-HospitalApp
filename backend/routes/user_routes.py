from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from backend.db import db
from backend.db.models import UserType, User, Specialization, Appointment, Prescription
from datetime import datetime

user_routes = Blueprint('user_routes', __name__, url_prefix='/user')


@user_routes.route('/register', methods=['POST'])
def addPatient():
    data = request.get_json()
    dob = datetime.strptime(data['dob'], '%Y-%m-%d').date()
    if data['user_type'] == UserType.PATIENT.name:
        new_user = User(data['email'], data['username'], data['first_name'], data['last_name'], dob,
                        data['phone_number'], UserType.PATIENT)
    elif data['user_type'] == UserType.DOCTOR.name:
        new_user = User(data['email'], data['username'], data['first_name'], data['last_name'], dob,
                        data['phone_number'], UserType.DOCTOR)
        for specialization in data['specializations']:
            s = Specialization.query.filter_by(name=specialization).first()
            if s is None:
                new_spec = Specialization(specialization)
                new_user.specializations.append(new_spec)
            else:
                new_user.specializations.append(s)
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
    specialization_list = []
    if user.user_type == UserType.PATIENT:
        appointments = user.p_appointments
        prescriptions = user.p_prescriptions
        for appointment in appointments:
            doctor = appointment.doctor
            doctor_name = doctor.first_name + " " + doctor.last_name
            json = appointment.serialize()
            json['doctor_name'] = doctor_name
            appointments_list.append(json)
        for prescription in prescriptions:
            doctor = prescription.doctor
            doctor_name = doctor.first_name + " " + doctor.last_name
            json = prescription.serialize()
            json['doctor_name'] = doctor_name
            prescriptions_list.append(json)
    elif user.user_type == UserType.DOCTOR:
        appointments = user.d_appointments
        prescriptions = user.d_prescriptions
        for appointment in appointments:
            patient = appointment.patient
            patient_name = patient.first_name + " " + patient.last_name
            json = appointment.serialize()
            json['patient_name'] = patient_name
            appointments_list.append(json)
        for prescription in prescriptions:
            patient = prescription.patient
            patient_name = patient.first_name + " " + patient.last_name
            json = prescription.serialize()
            json['patient_name'] = patient_name
            prescriptions_list.append(json)
        payload['specializations'] = []
        for specialization in user.specializations:
            payload['specializations'].append(specialization.name)
    payload['appointments'] = appointments_list
    payload['prescriptions'] = prescriptions_list

    return jsonify(payload), 200
