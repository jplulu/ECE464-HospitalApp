import names
from random import randrange, choice, randint
from datetime import timedelta, datetime, time
from sqlalchemy import exc
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db import models
import secrets

dob_range = [datetime.strptime('1/1/1950 1:30 PM', '%m/%d/%Y %I:%M %p'),
             datetime.strptime('1/1/2000 4:50 AM', '%m/%d/%Y %I:%M %p')]

# Generates random users
def create_users(num_entries):
    # Init arrays
    user_arr, email_arr, pw_arr, fname_arr, \
    lname_arr, dob_arr, pnum_arr, usertype_arr, uname_arr, userstat_arr = ([] for i in range(10))
    usertype_weighting = [models.UserType.PATIENT] * 100 + [models.UserType.DOCTOR] * 13 + [models.UserType.ADMIN] * 3

    def random_date(start, end):
        # https://stackoverflow.com/questions/553303/generate-a-random-date-between-two-other-dates
        delta = end - start
        int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
        random_second = randrange(int_delta)
        return start + timedelta(seconds=random_second)

    for i in range(num_entries):
        first_name = names.get_first_name()
        last_name = names.get_last_name()
        dob = random_date(dob_range[0], dob_range[1])
        phone_number = ''.join(str(randint(0, 9)) for _ in range(10))
        use_type = choice(usertype_weighting)

        dob_arr.append(dob)
        email_arr.append(first_name + last_name + str(i) + "@example.com")
        uname_arr.append(first_name + last_name + str(i))
        fname_arr.append(first_name)
        lname_arr.append(last_name)
        usertype_arr.append(use_type)
        if use_type == models.UserType.PATIENT or use_type == models.UserType.ADMIN:
            userstat_arr.append(models.UserStatus.APPROVED)
        else:
            userstat_arr.append(choice([models.UserStatus.APPROVED, models.UserStatus.PENDING]))
        pnum_arr.append(phone_number)

    ret = [email_arr, uname_arr, fname_arr, lname_arr, dob_arr, pnum_arr, usertype_arr, userstat_arr]

    for i in range(num_entries):
        new_usr = models.User(ret[0][i], ret[1][i], ret[2][i], ret[3][i], ret[4][i], ret[5][i], ret[6][i], ret[7][i])
        user_arr.append(new_usr)
    return user_arr


def create_specialization():
    spec_arr = []
    specializations = open("./backend/specializations.txt").read().splitlines()
    for spec in specializations:
        spec_arr.append(models.Specialization(spec))

    return spec_arr


# Generates appointments for around 60% of the patients
def create_appointment(patients, doctors):
    app_arr = []
    date_range = [datetime.strptime('1/1/2000 1:30 PM', '%m/%d/%Y %I:%M %p'),
                  datetime.strptime('1/1/2010 4:50 AM', '%m/%d/%Y %I:%M %p')]

    def rand_date(d_range):
        time_between_dates = d_range[1] - d_range[0]
        days_between_dates = time_between_dates.days
        random_number_of_days = randrange(days_between_dates)
        random_date = d_range[0] + timedelta(days=random_number_of_days)
        return random_date

    for patient in patients:
        # limit # of appointments
        if randint(1, 10) > 4:
            description = "Placeholder"
            date = rand_date(date_range)
            start = time(9, 10)
            app = models.Appointment(description, date, start)
            app.patient = patient
            app.doctor = choice(doctors)
            app_arr.append(app)

    return app_arr


# Creates prescriptions for around 20% of patients
def create_prescription(patients, doctors):
    prep_arr = []
    date_range = [datetime.strptime('1/1/2000 1:30 PM', '%m/%d/%Y %I:%M %p'),
                  datetime.strptime('1/1/2010 4:50 AM', '%m/%d/%Y %I:%M %p')]
    drug_list = ["Drug1", "Drug2", "Drug3", "Drug4",
                 "Drug5", "Drug6", "Drug7", "Drug8"]

    def rand_date(d_range):
        time_between_dates = d_range[1] - d_range[0]
        days_between_dates = time_between_dates.days
        random_number_of_days = randrange(days_between_dates)
        random_date = d_range[0] + timedelta(days=random_number_of_days)
        return random_date

    for patient in patients:
        if randint(1, 10) > 7:
            drug = choice(drug_list)
            dosage = str(randint(1, 20)) + " mg per day"
            date = rand_date(date_range)
            prescription = models.Prescription(drug=drug, date=date, dosage=dosage)
            prescription.patient = patient
            prescription.doctor = choice(doctors)
            prep_arr.append(prescription)

    return prep_arr


def populate():
    e = create_engine('mysql://root:password@localhost/hospital')
    session = sessionmaker(bind=e)
    s = session()
    # Populate Specializations
    try:
        for spec in create_specialization():
            s.add(spec)
            s.commit()
    except exc.IntegrityError:
        s.rollback()
    # Populate Users
    usr_arr = create_users(300)
    spec = s.query(models.Specialization).all()
    for usr in usr_arr:
        usr.set_password("1")
        # For doctors, select a specialization from pre established table
        if usr.user_type == models.UserType.DOCTOR:
            usr.specialization = (choice(spec))
        try:
            s.add(usr)
            s.commit()
        except exc.IntegrityError:
            s.rollback()
    # Populate Appointments
    doc = s.query(models.User).filter(models.User.user_type == models.UserType.DOCTOR).all()
    pat = s.query(models.User).filter(models.User.user_type == models.UserType.PATIENT).all()
    for app in create_appointment(pat, doc):
        s.add(app)
    s.commit()
    # Populate Prescription
    for pres in create_prescription(pat, doc):
        s.add(pres)
    s.commit()


if __name__ == '__main__':
    populate()
