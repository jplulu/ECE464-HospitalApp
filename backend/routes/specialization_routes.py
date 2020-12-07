from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from backend.db import db
from backend.db.models import Specialization

specialization_routes = Blueprint('specialization_routes', __name__, url_prefix='/specialization')


@specialization_routes.route('', methods=['GET'])
def getAllSpecialization():
    specializations = Specialization.query.all()
    if specializations is None:
        return jsonify({"error": "No specialization found"}), 404

    payload = {'specializations': []}
    for specialization in specializations:
        payload['specializations'].append(specialization.serialize())

    return jsonify(payload), 200


@specialization_routes.route('', methods=['POST'])
def addSpecialization():
    spec = request.args.get('spec')
    new_specialization = Specialization(spec)
    try:
        db.session.add(new_specialization)
        db.session.commit()
    except IntegrityError:
        return jsonify({"error": "Specialization already exists"}), 409

    return jsonify(new_specialization.serialize()), 200
