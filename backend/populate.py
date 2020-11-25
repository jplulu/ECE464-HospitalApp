import names
from random import randrange, choice, randint
from datetime import timedelta, datetime, time

from sqlalchemy import engine, create_engine
from sqlalchemy.orm import sessionmaker

from backend.db import db
from backend.db import models


dob_range = [datetime.strptime('1/1/1950 1:30 PM', '%m/%d/%Y %I:%M %p'),
             datetime.strptime('1/1/2000 4:50 AM', '%m/%d/%Y %I:%M %p')]




def create_Users(num_entries):
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

    ret = []
    ret.append(email_arr)
    ret.append(uname_arr)
    ret.append(fname_arr)
    ret.append(lname_arr)
    ret.append(dob_arr)
    ret.append(pnum_arr)
    ret.append(usertype_arr)

    for i in range(num_entries):
        user_arr.append(models.User(ret[0][i], ret[1][i],ret[2][i],ret[3][i],ret[4][i],ret[5][i],ret[6][i]))
    return user_arr

def create_Specialization():
    spec_arr = []
    specializations = ["This", "That", "Those", "Whose", "What"]
    for spec in specializations:
        spec_arr.append(models.Specialization(spec))

    return spec_arr

def create_Appointment(patients, doctors):
    app_arr = []
    date_range = [datetime.strptime('1/1/2000 1:30 PM', '%m/%d/%Y %I:%M %p'),
                  datetime.strptime('1/1/2010 4:50 AM', '%m/%d/%Y %I:%M %p')]
    def rand_date(date_range):
        time_between_dates = date_range[1] - date_range[0]
        days_between_dates = time_between_dates.days
        random_number_of_days = randrange(days_between_dates)
        random_date = date_range[0] + timedelta(days=random_number_of_days)
        return(random_date)
    for patient in patients:
        description = "Placeholder"
        date = rand_date(date_range)
        start = time(9,10)
        end = time(10,10)
        app = models.Appointment(description,date,start,end)
        app.patient = patient
        app.doctor = choice(doctors)
        app_arr.append(app)

    return app_arr


def populate():
    usr_arr = create_Users(20)
    for usr in usr_arr:
        db.session.add(usr)
        db.session.commit()

    engine = create_engine("sqlite:///db/test.db")
    conn = engine.connect()
    session = sessionmaker(bind=engine)
    s = session()

    spec_arr = create_Specialization()
    for spec in spec_arr:
        s.add(spec)
    s.commit()

    doc = s.query(models.User).filter(models.User.user_type == models.UserType.DOCTOR).all()
    pat = s.query(models.User).filter(models.User.user_type == models.UserType.PATIENT).all()
    app_arr = create_Appointment(pat, doc)
    for app in app_arr:
        s.add(app)
    s.commit()

    print("________________________________________")
    test = s.query(models.Appointment)
    for them in test.all():
        print("++++++++++++++++++++++++++")
        print(them.patient.username)
        print(them.doctor.username)
        print(them.description)
        print(them.date)
        print(them.start)
        print(them.end)

    # print(engine.table_names())
    #
    # print("________________________________________")
    # test = s.query(models.User).filter(models.User.user_type == models.UserType.ADMIN)
    # for them in test.all():
    #     print(them.username)
    # print("________________________________________")
    # test = s.query(models.User).filter(models.User.user_type == models.UserType.PATIENT)
    # for them in test.all():
    #     print(them.username)
    # print("________________________________________")
    # test = s.query(models.User).filter(models.User.user_type == models.UserType.DOCTOR)
    # for them in test.all():
    #     print(them.username)
    # print("________________________________________")
    # test = s.query(models.Specialization.name)
    # for them in test.all():
    #     print(them)