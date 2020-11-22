from backend import app
from backend.routes.patient_routes import patient_routes
from backend.db import db

app.register_blueprint(patient_routes)


@app.before_first_request
def create_table():
    db.create_all()


if __name__ == '__main__':
    app.run(debug=True)
