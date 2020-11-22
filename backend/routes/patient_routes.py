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
    new_patient = User(data['email'], data['first_name'], data['last_name'], dob, data['phone_number'], UserType.PATIENT)
    new_patient.set_password(data['password'])
    try:
        db.session.add(new_patient)
        db.session.commit()
    except IntegrityError as e:
        return jsonify({"error": "Email already registered"}), 409

    return jsonify(new_patient.serialize()), 200
