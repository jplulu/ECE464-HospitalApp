from flask_sqlalchemy import SQLAlchemy
from backend import app

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql:///hospital'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
