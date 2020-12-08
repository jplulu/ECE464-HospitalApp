from sqlalchemy.sql import func
from werkzeug.security import generate_password_hash, check_password_hash
import enum
from datetime import date, time
from backend.db import db


class UserType(enum.Enum):
    ADMIN = 0
    PATIENT = 1
    DOCTOR = 2


class UserStatus(enum.Enum):
    PENDING = 0
    APPROVED = 1
    REJECTED = 2


class AppointmentStatus(enum.Enum):
    CANCELED = 0
    PENDING = 1
    ACTIVE = 2
    COMPLETE = 3


class PrescriptionStatus(enum.Enum):
    INACTIVE = 0
    ACTIVE = 1


# specializations = db.Table('specializations',
#                            db.Column('doctor_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
#                            db.Column('specialization_id', db.Integer, db.ForeignKey('specialization.id'),
#                                      primary_key=True)
#                            )


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    first_name = db.Column(db.String(30), nullable=False)
    last_name = db.Column(db.String(30), nullable=False)
    dob = db.Column(db.Date)
    phone_number = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, server_default=func.current_timestamp())
    user_type = db.Column(db.Enum(UserType), nullable=False)
    user_status = db.Column(db.Enum(UserStatus), nullable=False)

    specialization_id = db.Column(db.Integer, db.ForeignKey('specializations.id'))
    specialization = db.relationship('Specialization', backref='doctors')

    def __init__(self, email, username, first_name, last_name, dob, phone_number, user_type, user_status):
        self.email = email
        self.username = username
        self.first_name = first_name
        self.last_name = last_name
        self.dob = dob
        self.phone_number = phone_number
        self.user_type = user_type
        self.user_status = user_status

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def serialize(self):
        payload = {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "user_type": self.user_type.name,
            "user_status": self.user_status.name
        }
        if self.user_type == UserType.PATIENT:
            payload['dob'] = self.dob.strftime("%Y-%m-%d")
            payload['phone_number'] = self.phone_number
        elif self.user_type == UserType.DOCTOR:
            payload['dob'] = self.dob.strftime("%Y-%m-%d")
            payload['phone_number'] = self.phone_number
            payload['specialization'] = self.specialization.spec

        return payload


class Specialization(db.Model):
    __tablename__ = 'specializations'

    id = db.Column(db.Integer, primary_key=True)
    spec = db.Column(db.String(50), unique=True)

    def __init__(self, spec):
        self.spec = spec

    def serialize(self):
        return {
            "id": self.id,
            "spec": self.spec
        }


class Appointment(db.Model):
    __tablename__ = 'appointments'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    description = db.Column(db.String(120))
    doctor_notes = db.Column(db.String(120))
    date = db.Column(db.Date, nullable=False)
    start = db.Column(db.Time, nullable=False)
    end = db.Column(db.Time, nullable=False)
    status = db.Column(db.Enum(AppointmentStatus), nullable=False)

    patient = db.relationship('User', foreign_keys=[patient_id], backref='p_appointments')
    doctor = db.relationship('User', foreign_keys=[doctor_id], backref='d_appointments')

    def __init__(self, description, date, start, end, status=AppointmentStatus.PENDING):
        self.description = description
        self.date = date
        self.start = start
        self.end = end
        self.status = status

    def serialize(self, user_type):
        payload = {
                "id": self.id,
                "description": self.description,
                "doctor_notes": self.doctor_notes,
                "date": self.date.strftime("%Y-%m-%d"),
                "start": self.start.strftime("%H:%M"),
                "end": self.end.strftime("%H:%M"),
                "status": self.status.name
            }
        if user_type == UserType.DOCTOR:
            payload['patient'] = self.patient.serialize()
        elif user_type == UserType.PATIENT:
            payload['doctor'] = self.doctor.serialize()
        else:
            payload['patient'] = self.patient.serialize()
            payload['doctor'] = self.doctor.serialize()

        return payload


class Prescription(db.Model):
    __tablename__ = 'prescriptions'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    drug = db.Column(db.String(50), nullable=False)
    dosage = db.Column(db.String(50), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.Enum(PrescriptionStatus), nullable=False)

    patient = db.relationship('User', foreign_keys=[patient_id], backref='p_prescriptions')
    doctor = db.relationship('User', foreign_keys=[doctor_id], backref='d_prescriptions')

    def __init__(self, drug, dosage, date, status=PrescriptionStatus.ACTIVE):
        self.drug = drug
        self.date = date
        self.dosage = dosage
        self.status = status

    def serialize(self, user_type):
        payload = {
            "id": self.id,
            "drug": self.drug,
            "date": self.date.strftime("%Y-%m-%d"),
            "dosage": self.dosage,
            "status": self.status.name
        }

        if user_type == UserType.DOCTOR:
            payload['patient'] = self.patient.serialize()
        elif user_type == UserType.PATIENT:
            payload['doctor'] = self.doctor.serialize()
        else:
            payload['patient'] = self.patient.serialize()
            payload['doctor'] = self.doctor.serialize()

        return payload


if __name__ == "__main__":
    db.engine.execute("DROP DATABASE hospital;")
    db.engine.execute("CREATE DATABASE hospital;")
    db.engine.execute("USE hospital;")
    db.create_all()
