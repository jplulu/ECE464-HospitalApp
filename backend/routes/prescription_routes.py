from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from backend.db import db
from backend.db.models import UserType, User, Specialization, Appointment, Prescription
from datetime import datetime

prescription_routes = Blueprint('prescription_routes', __name__, url_prefix='/prescription')


@prescription_routes.route('', methods=['POST'])
def addPrescription():
    data = request.get_json()
    patient = User.query.filter_by(username=data['patient'], user_type=UserType.PATIENT).first()
    doctor = User.query.filter_by(username=data['doctor'], user_type=UserType.DOCTOR).first()
    if patient is None:
        return jsonify({"error": "Patient not found"}), 400
    if doctor is None:
        return jsonify({"error": "Doctor not found"}), 400

    date = datetime.strptime(data['date'], '%Y-%m-%d').date()

    new_prescription = Prescription(data['drug'], data['dosage'], date)
    new_prescription.patient = patient
    new_prescription.doctor = doctor

    try:
        db.session.add(new_prescription)
        db.session.commit()
    except IntegrityError:
        return jsonify({"error": "Failed to add prescription"}), 400

    return jsonify(new_prescription.serialize()), 200

# TODO: Filter by status, etc
@prescription_routes.route('/<username>', methods=['GET'])
def getPrescriptionsByUser(username):
    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"error": "User not found"}), 404

    payload = {'prescriptions': []}
    if user.user_type == UserType.PATIENT:
        prescriptions = user.p_prescriptions
        for prescription in prescriptions:
            other_party = prescription.doctor
            name = other_party.first_name + " " + other_party.last_name
            prescription_ser = prescription.serialize()
            prescription_ser['other_party_name'] = name
            prescription_ser['other_party_uname'] = other_party.username
            payload['prescriptions'].append(prescription_ser)
    elif user.user_type == UserType.DOCTOR:
        prescriptions = user.d_prescriptions
        for prescription in prescriptions:
            other_party = prescription.patient
            name = other_party.first_name + " " + other_party.last_name
            prescription_ser = prescription.serialize()
            prescription_ser['other_party_name'] = name
            prescription_ser['other_party_uname'] = other_party.username
            payload['prescriptions'].append(prescription_ser)
    else:
        prescriptions = []

    if not prescriptions:
        return jsonify({"error": "No prescriptions found"}), 404

    return jsonify(payload), 200

# TODO: User authorization checking
@prescription_routes.route('/updateStatus', methods=['PUT'])
def updatePrescriptionStatus():
    id = request.args.get('id')
    status = request.args.get('status')
    if id is None or status is None:
        return jsonify({"error": "Missing request parameters"}), 400
    if not id.isdigit():
        return jsonify({"error": "Invalid id"}), 400
    if status.isdigit():
        if int(status) > 2:
            return jsonify({"error": "Invalid status"}), 400
    else:
        return jsonify({"error": "Invalid status"}), 400

    prescription = Prescription.query.filter_by(id=int(id)).first()
    if prescription is None:
        return jsonify({"error": "Prescription not found"}), 404
    prescription.status = int(status)
    db.session.commit()

    return jsonify(prescription.serialize()), 200
