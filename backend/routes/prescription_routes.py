from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from backend.db import db
from backend.db.models import UserType, User, Prescription, PrescriptionStatus
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

    return jsonify(new_prescription.serialize(None)), 200


@prescription_routes.route('/<username>', methods=['GET'])
def getPrescriptionsByUser(username):
    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"error": "User not found"}), 404

    status_filter = request.args.get('status')
    payload = {'prescriptions': []}
    if user.user_type == UserType.PATIENT:
        if status_filter:
            prescriptions = Prescription.query.filter_by(patient=user, status=status_filter).all()
        else:
            prescriptions = user.p_prescriptions
    elif user.user_type == UserType.DOCTOR:
        if status_filter:
            prescriptions = Prescription.query.filter_by(doctor=user, status=status_filter).all()
        else:
            prescriptions = user.d_prescriptions
    else:
        prescriptions = Prescription.query.all()

    if not prescriptions:
        return jsonify({"error": "No prescriptions found"}), 404

    for prescription in prescriptions:
        payload['prescriptions'].append(prescription.serialize(user.user_type))

    return jsonify(payload), 200


@prescription_routes.route('', methods=['PUT'])
def updatePrescription():
    id = request.args.get('id')
    new_status = request.args.get('status')
    new_dosage = request.args.get('dosage')
    if id is None:
        return jsonify({"error": "Missing request parameters"}), 400
    if not id.isdigit():
        return jsonify({"error": "Invalid id"}), 400
    if new_status and new_status not in ['ACTIVE', 'INACTIVE']:
        return jsonify({"error": "Invalid status"}), 400

    prescription = Prescription.query.filter_by(id=int(id)).first()
    if prescription is None:
        return jsonify({"error": "Prescription not found"}), 404
    if new_status:
        prescription.status = PrescriptionStatus[new_status]
    if new_dosage:
        prescription.dosage = new_dosage
    db.session.commit()

    return jsonify(prescription.serialize(None)), 200
