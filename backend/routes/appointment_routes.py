from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from backend.db import db
from backend.db.models import UserType, User, Specialization, Appointment, Prescription
from datetime import datetime

appointment_routes = Blueprint('appointment_routes', __name__, url_prefix='/appointment')


@appointment_routes.route('', methods=['POST'])
def addAppointment():
    data = request.get_json()
    patient = User.query.filter_by(username=data['patient'], user_type=UserType.PATIENT).first()
    doctor = User.query.filter_by(username=data['doctor'], user_type=UserType.DOCTOR).first()
    if patient is None:
        return jsonify({"error": "Patient not found"}), 400
    if doctor is None:
        return jsonify({"error": "Doctor not found"}), 400
    date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    start = datetime.strptime(data['start'], '%H:%M').time()
    end = datetime.strptime(data['end'], '%H:%M').time()

    new_appointment = Appointment(data['description'], date, start, end)
    new_appointment.patient = patient
    new_appointment.doctor = doctor

    try:
        db.session.add(new_appointment)
        db.session.commit()
    except IntegrityError:
        return jsonify({"error": "Failed to add appointment"}), 400

    return jsonify(new_appointment.serialize()), 200

# TODO: Filter by status, etc
@appointment_routes.route('/<username>', methods=['GET'])
def getAppointmentsByUser(username):
    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"error": "User not found"}), 404

    payload = {'appointments': []}
    if user.user_type == UserType.PATIENT:
        appointments = user.p_appointments
        for appointment in appointments:
            other_party = appointment.doctor
            name = other_party.first_name + " " + other_party.last_name
            appointment_ser = appointment.serialize()
            appointment_ser['other_party_name'] = name
            appointment_ser['other_party_uname'] = other_party.username
            payload['appointments'].append(appointment_ser)
    elif user.user_type == UserType.DOCTOR:
        appointments = user.d_appointments
        for appointment in appointments:
            other_party = appointment.patient
            name = other_party.first_name + " " + other_party.last_name
            appointment_ser = appointment.serialize()
            appointment_ser['other_party_name'] = name
            appointment_ser['other_party_uname'] = other_party.username
            payload['appointments'].append(appointment_ser)
    else:
        appointments = []

    if not appointments:
        return jsonify({"error": "No appointments found"}), 404

    return jsonify(payload), 200

# TODO: User authorization checking
@appointment_routes.route('/updateStatus', methods=['PUT'])
def updateAppointmentStatus():
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

    appointment = Appointment.query.filter_by(id=int(id)).first()
    if appointment is None:
        return jsonify({"error": "Appointment not found"}), 404
    appointment.status = int(status)
    db.session.commit()

    return jsonify(appointment.serialize()), 200
