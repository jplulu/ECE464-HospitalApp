import names
import secrets
from random import randrange, choice, randint
from datetime import timedelta, datetime


dob_range = [datetime.strptime('1/1/1950 1:30 PM', '%m/%d/%Y %I:%M %p'),
             datetime.strptime('1/1/2000 4:50 AM', '%m/%d/%Y %I:%M %p')
]
createdat_range = [datetime.strptime('1/1/1980 1:30 PM', '%m/%d/%Y %I:%M %p'),
                   datetime.strptime('1/1/2010 4:50 AM', '%m/%d/%Y %I:%M %p')
]
def random_date(start, end):
    # https://stackoverflow.com/questions/553303/generate-a-random-date-between-two-other-dates
    delta = end - start
    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    random_second = randrange(int_delta)
    return start + timedelta(seconds=random_second)

def create_User_array(num_entries, static_id = True):
    user_arr, id_arr, email_arr, pw_arr, fname_arr, \
    lname_arr, dob_arr, pnum_arr, createdat_arr, usertype_arr = ([] for i in range(10))
    usertype_weighting = [0] * 20 + [1] * 7 + [2] * 2


    for i in range(num_entries):
        if static_id:
            id_arr.append(i + 1)
        first_name = names.get_first_name()
        last_name = names.get_last_name()
        dob = random_date(dob_range[0],dob_range[1])
        createdat = random_date(dob_range[0], dob_range[1])
        while createdat < dob:
            createdat = random_date(dob_range[0], dob_range[1])
        phone_number = ''.join(str(randint(0, 9)) for _ in range(10))

        dob_arr.append(dob)
        email_arr.append(first_name + last_name +"@example.com")
        fname_arr.append(first_name)
        lname_arr.append(last_name)
        createdat_arr.append(createdat)
        usertype_arr.append(choice(usertype_weighting))
        pw_arr.append(secrets.token_hex())
        pnum_arr.append(phone_number)


    print(id_arr)
    print(email_arr)
    print(dob_arr)
    print(fname_arr)
    print(lname_arr)
    print(createdat_arr)
    print(usertype_arr)
    print(pw_arr)
    print(pnum_arr)

if __name__ == '__main__':
    create_User_array(20)