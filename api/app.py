# coding=utf-8
r"""
Die Haupt Flask App.

Enthält zwei Arten vond Endpoints:
  * /auth: Userverwaltung,
  * /jumps: Logik für die Fallschirmsprünge
"""

from flask import Flask, jsonify, make_response, request
from flask_cors import CORS

from login.login import processLogin, processRegister, getUsernameForSession
from jumps.jumps import getJumps, addJump

from database.postgres import Database

app = Flask(__name__)
cors = CORS(app)
database = Database()

@app.route('/auth/login', methods=['GET'])
def login():
    """Endpoint fürs Login. Gibt Sessiondaten zurück."""
    return make_response(jsonify(processLogin(database, request.args.get('username', None), request.args.get('password', None))))

@app.route('/auth/username', methods=['GET'])
def username():
    """Gibt den Usernamen einer Session zurück (sofern gültig)."""
    return make_response(jsonify(getUsernameForSession(database, request.args.get('sessionId', None), request.args.get('sessionToken', None))))

@app.route('/auth/register', methods=['PUT'])
def register():
    """Erstellt einen neuen Benutzer."""
    try:
        data = request.get_json(force=True)
    except:
        data = {}
    response = make_response(jsonify(processRegister(database, data.get('username', None), data.get('password', None), data.get('email', None))))
    return response


@app.route('/jumps/list', methods=['GET'])
def list():
    """Gibt alle Fallschirmsprünge für den User einer Session zurück."""
    return make_response(jsonify(getJumps(database,
                                             request.args.get('sessionId', None), request.args.get('sessionToken', None))))


@app.route('/jumps/add', methods=['PUT'])
def add():
    """Fügt einen neuen Sprung für den Benutzer einer Session hinzu."""

    # Ich verwende `GET` parameter für die session Daten (sessionId und sessionToken) und `Data` Objekte
    # für die Sprungdaten (jumpDate und jumpDescription).
    sessionId, sessionToken = request.args.get('sessionId', None), request.args.get('sessionToken', None)

    try:
        data = request.get_json(force=True)
    except:
        data = {}
    jumpDate, jumpDescription = data.get('jumpDate', None), data.get('jumpDescription', None)

    return make_response(jsonify(addJump(database,  sessionId, sessionToken, jumpDate, jumpDescription)))
