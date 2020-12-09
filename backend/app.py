from backend import app
from backend.routes.user_routes import user_routes
from backend.routes.appointment_routes import appointment_routes
from backend.routes.prescription_routes import prescription_routes
from backend.routes.specialization_routes import specialization_routes
from backend.db import db

app.register_blueprint(user_routes)
app.register_blueprint(appointment_routes)
app.register_blueprint(prescription_routes)
app.register_blueprint(specialization_routes)


@app.before_first_request
def create_table():
    db.create_all()


if __name__ == '__main__':
    app.run(debug=False)
