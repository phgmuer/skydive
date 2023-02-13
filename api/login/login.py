# coding=utf-8
r"""
Verwalten das Authentifizieren und Erstellen von Benutzern.
"""
import re


def processLogin(database, username, password):
    """Verifiziert die `username`/`password` Kombination und gibt die neue Session zurück."""
    if not username or not password:
        return {"success": False, "message": "Missing Data."}

    sessionToken, sessionId = database.tryLogin(username, password)
    if sessionToken:
        return {"success": True, "sessionToken": sessionToken, "sessionId": sessionId, "loginUsername": username}
    else:
        return {"success": False, "message": "Verification failed."}


def getUsernameForSession(database, sessionId, sessionToken):
    if not all([sessionId,  sessionToken]):
        return {"success": False, "message": "Missing data."}
    if not database.isSessionValid(sessionId, sessionToken):
        return {"success": False, "message": "Invalid session."}

    userName = database.getUserNameFromSession(sessionId)
    if not userName:
        return {"success": False, "message": "Invalid session."}
    return {"success": True, "username": userName}


def processRegister(database, username, password, email):
    """Erstellt einen neuen Benutzer."""
    if not all([username, password, email]):
        return {"success": False, "message": "Missing Data."}

    if not _isEmailValid(email):
        return {"success": False, "message": "Invalid email address."}

    if len(username) < 1 or len(password) < 1 or  len(username) > 100 or len(password) > 100:
        return {"success": False, "message": "Username or password length invalid."}


    if database.createUser(username, password, email):
        return {"success": True}
    else:
        return {"success": False, "message": "User or Email might already exist."}


# Verifiziert das Format einer Email Adresse mittels Regexp.\
# Aktuell wird die Email Adresse beim registrieren eines neuen Benutzers aufgenommen und gespeichert aber danach nicht benutzt.
emailRegex = re.compile(r'([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+')
def _isEmailValid(email):
    return bool(re.fullmatch(emailRegex, email))
