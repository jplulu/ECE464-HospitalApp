from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask
import enum

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tmp/test.db'
db = SQLAlchemy(app)


class UserType(enum.Enum):
    ADMIN = 0
    PATIENT = 1
    DOCTOR = 2


specializations = db.Table('specializations',
                           db.Column('doctor_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
                           db.Column('specialization_id', db.Integer, db.ForeignKey('specialization.id'),
                                     primary_key=True)
                           )


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String())
    first_name = db.Column(db.String(30), nullable=False)
    last_name = db.Column(db.String(30), nullable=False)
    dob = db.Column(db.Date)
    phone_number = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, server_default=func.current_timestamp())
    user_type = db.Column(db.Enum(UserType))

    specializations = db.relationship('Specialization', secondary=specializations, lazy='subquery',
                                      backref=db.backref('doctors', lazy=True))

    def __init__(self, email, first_name, last_name, dob, phone_number, user_type):
        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        self.dob = dob
        self.phone_number = phone_number
        self.user_type = user_type

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)


class Specialization(db.Model):
    __tablename__ = 'specialization'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String())


class Appointment(db.Model):
    __tablename__ = 'appointments'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    patient = db.relationship('User', foreign_keys=[patient_id], backref='p_appointments')
    doctor = db.relationship('User', foreign_keys=[doctor_id], backref='d_appointments')
    description = db.Column(db.String())
    date = db.Column(db.Date, nullable=False)
    start = db.Column(db.Time, nullable=False)
    end = db.Column(db.Time, nullable=False)
    status = db.Column(db.Integer, nullable=False)

    def __init__(self, description, date, start, end, status=1):
        self.description = description
        self.date = date
        self.start = start
        self.end = end
        self.status = status


class Prescription(db.Model):
    __tablename__ = 'prescriptions'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    patient = db.relationship('User', foreign_keys=[patient_id], backref='p_prescriptions')
    doctor = db.relationship('User', foreign_keys=[doctor_id], backref='d_prescriptions')
    drug = db.Column(db.String(), nullable=False)
    dosage = db.Column(db.String(), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.Integer)

    def __init__(self, drug, dosage, date, status=1):
        self.drug = drug
        self.date = date
        self.dosage = dosage
        self.status = status
