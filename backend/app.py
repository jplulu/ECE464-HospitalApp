from backend import app
from backend.routes.user_routes import user_routes
from backend.db import db
from backend import populate
app.register_blueprint(user_routes)

# Need to make post request on postman first before this runs
@app.before_first_request
def create_table():
    print("test")
    db.create_all()
    populate.populate()



if __name__ == '__main__':
    app.run(debug=True)
