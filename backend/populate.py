import names
from random import randrange, choice, randint
from datetime import timedelta, datetime, time
from sqlalchemy import exc
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db import models


dob_range = [datetime.strptime('1/1/1950 1:30 PM', '%m/%d/%Y %I:%M %p'),
             datetime.strptime('1/1/2000 4:50 AM', '%m/%d/%Y %I:%M %p')]




def create_users(num_entries):
    user_arr, email_arr, pw_arr, fname_arr, \
    lname_arr, dob_arr, pnum_arr, usertype_arr, uname_arr = ([] for i in range(9))
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
        dob = random_date(dob_range[0],dob_range[1])
        phone_number = ''.join(str(randint(0, 9)) for _ in range(10))

        dob_arr.append(dob)
        email_arr.append(first_name + last_name +"@example.com")
        uname_arr.append(first_name + last_name)
        fname_arr.append(first_name)
        lname_arr.append(last_name)
        usertype_arr.append(choice(usertype_weighting))
        pnum_arr.append(phone_number)

    ret = [email_arr, uname_arr, fname_arr, lname_arr, dob_arr, pnum_arr, usertype_arr]

    for i in range(num_entries):
        user_arr.append(models.User(ret[0][i], ret[1][i],ret[2][i],ret[3][i],ret[4][i],ret[5][i],ret[6][i]))
    return user_arr

def create_specialization():
    spec_arr = []
    specializations = ["This", "That", "Those", "Whose", "What"]
    for spec in specializations:
        spec_arr.append(models.Specialization(spec))

    return spec_arr

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
            start = time(9,10)
            end = time(10,10)
            app = models.Appointment(description,date,start,end)
            app.patient = patient
            app.doctor = choice(doctors)
            app_arr.append(app)

    return app_arr

def create_prescription(patients, doctors):
    prep_arr = []
    date_range = [datetime.strptime('1/1/2000 1:30 PM', '%m/%d/%Y %I:%M %p'),
                  datetime.strptime('1/1/2010 4:50 AM', '%m/%d/%Y %I:%M %p')]
    drug_list = [["Drug1","1 mg"], ["Drug2","2 mg"], ["Drug3","3 mg"], ["Drug4","4 mg"],
                 ["Drug5","5 mg"], ["Drug6","6 mg"], ["Drug7","7 mg"], ["Drug8","8 mg"]]
    def rand_date(d_range):
        time_between_dates = d_range[1] - d_range[0]
        days_between_dates = time_between_dates.days
        random_number_of_days = randrange(days_between_dates)
        random_date = d_range[0] + timedelta(days=random_number_of_days)
        return random_date

    for patient in patients:
        if randint(1,10) > 7:
            drug_choose = choice(drug_list)
            drug = drug_choose[0]
            dosage = drug_choose[1]
            date = rand_date(date_range)
            prescription = models.Prescription(drug=drug, date=date, dosage=dosage)
            prescription.patient = patient
            prescription.doctor = choice(doctors)
            prep_arr.append(prescription)

    return prep_arr


def populate():
    e = create_engine("sqlite:///db/test.db")
    conn = e.connect()
    session = sessionmaker(bind=e)
    s = session()
    # Populate Users
    usr_arr = create_users(100)
    for usr in usr_arr:
        s.add(usr)
    s.commit()
    # Populate Specializations
    for spec in create_specialization():
        s.add(spec)
    try:
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

