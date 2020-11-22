from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from backend.db import db
from backend.db.models import UserType, User, Specialization, Appointment, Prescription
from datetime import datetime

patient_routes = Blueprint('patient_routes', __name__, url_prefix='/patient')


@patient_routes.route('/register', methods=['POST'])
def addPatient():
    data = request.get_json()
    dob = datetime.strptime(data['dob'], '%Y-%m-%d').date()
    new_patient = User(data['email'], data['username'], data['first_name'], data['last_name'], dob,
                       data['phone_number'], UserType.PATIENT)
    new_patient.set_password(data['password'])
    try:
        db.session.add(new_patient)
        db.session.commit()
    except IntegrityError:
        return jsonify({"error": "Email or username already registered"}), 409

    return jsonify(new_patient.serialize()), 200


@patient_routes.route('/<username>', methods=['GET'])
def getPatientByUsername(username):
    patient = User.query.filter_by(username=username, user_type=UserType.PATIENT).first()
    if patient is None:
        return jsonify({"error": "Patient not found"}), 404

    appointments = []
    for appointment in patient.p_appointments:
        doctor = appointment.doctor
        doctor_name = doctor.first_name + " " + doctor.last_name
        json = appointment.serialize()
        json['doctor_name'] = doctor_name
        appointments.append(json)
    prescriptions = []
    for prescription in patient.p_prescriptions:
        doctor = prescription.doctor
        doctor_name = doctor.first_name + " " + doctor.last_name
        json = prescription.serialize()
        json['doctor_name'] = doctor_name
        prescriptions.append(json)

    payload = patient.serialize()
    payload['appointments'] = appointments
    payload['prescriptions'] = prescriptions

    return jsonify(payload), 200
