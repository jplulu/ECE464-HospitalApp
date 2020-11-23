from flask_sqlalchemy import SQLAlchemy
from backend import app

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db/tmp/test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)