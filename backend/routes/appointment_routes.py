from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from backend.db import db
from backend.db.models import UserType, User, Appointment, AppointmentStatus
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
    

    new_appointment = Appointment(data['description'], date, start)
    new_appointment.patient = patient
    new_appointment.doctor = doctor

    try:
        db.session.add(new_appointment)
        db.session.commit()
    except IntegrityError:
        return jsonify({"error": "Failed to add appointment"}), 400

    return jsonify(new_appointment.serialize(None)), 200


@appointment_routes.route('/<username>', methods=['GET'])
def getAppointmentsByUser(username):
    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"error": "User not found"}), 404

    status_filter = request.args.get('status')
    payload = {'appointments': []}
    if user.user_type == UserType.PATIENT:
        if status_filter:
            appointments = Appointment.query.filter_by(patient=user, status=status_filter).all()
        else:
            appointments = user.p_appointments
    elif user.user_type == UserType.DOCTOR:
        if status_filter:
            appointments = Appointment.query.filter_by(doctor=user, status=status_filter).all()
        else:
            appointments = user.d_appointments
    else:
        if status_filter:
            appointments = Appointment.query.filter_by(status=status_filter).all()
        else:
            appointments = Appointment.query.all()

    if not appointments:
        return jsonify({"error": "No appointments found"}), 404

    for appointment in appointments:
        payload['appointments'].append(appointment.serialize(user.user_type))

    return jsonify(payload), 200


@appointment_routes.route('', methods=['PUT'])
def updateAppointment():
    id = request.args.get('id')
    new_status = request.args.get('status')
    new_note = request.args.get('note')
    if id is None:
        return jsonify({"error": "Missing request parameters"}), 400
    if not id.isdigit():
        return jsonify({"error": "Invalid id"}), 400

    appointment = Appointment.query.filter_by(id=int(id)).first()
    if appointment is None:
        return jsonify({"error": "Appointment not found"}), 404

    if new_status:
        if new_status not in ['CANCELED', 'ACTIVE', 'COMPLETE']:
            return jsonify({"error": "Invalid status"}), 400
        appointment.status = AppointmentStatus[new_status]
    if new_note:
        appointment.doctor_notes = new_note
    db.session.commit()

    return jsonify(appointment.serialize(None)), 200
