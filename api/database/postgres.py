# coding=utf-8
import os
import psycopg2
import hashlib
import random
import string
import datetime
import logging

PG_HOST = os.getenv('PG_HOST')
PG_PASSWORD = os.getenv('PG_PASSWORD')
PG_USER = "postgres"
PG_HOST = "host.docker.internal"
PG_DATABASE = "logbook"
PG_PASSWORD = ""
PG_PORT = 5432

def _hashPassword(password):
    return hashlib.sha256(bytes(password, 'utf-8')).hexdigest()

def _sessionToken():
    """Generiert ein zufälliges Session Token."""
    SessionTokenLength = 20
    return ''.join(random.choice(string.ascii_lowercase) for _ in range(SessionTokenLength))


class Database():
    """Enthält alle interaktionen mit der Postgres Datenbank."""

    def __init__(self):
        self.connection = psycopg2.connect(database=PG_DATABASE, host=PG_HOST, user=PG_USER, password=PG_PASSWORD, port=PG_PORT)
        self.connection.autocommit = True

    def createUser(self, username, password, email):
        """Erstellt einen neuen User."""
        if self.doesUserOrEmailExist(username, email):
            return False

        cursor = self.connection.cursor()
        cursor.execute('INSERT INTO accounts (username, email, password) VALUES (%s, %s, %s)', (username, email, _hashPassword(password)))
        # cursor.rowcount ist die Anzahl affected Zeilen des `execute` befehls. Sollte immer 1 sein hier bei erfolgreichem einfügen.
        if cursor.rowcount != 1:
            logging.warning(f"createUser(): cursor.rowcount={cursor.rowcount} ist nicht 1")
        return cursor.rowcount == 1


    def tryLogin(self, username, password):
        """Login und erstellt (sessionToken, sessionId)."""
        cursor = self.connection.cursor()
        try:
            cursor.execute('SELECT user_id FROM accounts WHERE username like %s and password like %s', (username, _hashPassword(password)))
            fetch =  cursor.fetchone()
            if not fetch:
                return None, None
            userId = fetch[0]
            return self.createSession(userId)
        except:
            return None, None


    def doesUserOrEmailExist(self, username, email):
        cursor = self.connection.cursor()
        cursor.execute('SELECT COUNT(*) FROM accounts WHERE username like %s or email like %s', (username, email))
        return int(cursor.fetchone()[0]) > 0


    def createSession(self, userId):
        """Erstellt eine neue Session und gibt sessionToken und sessionId zurück.
          * sessionId identifiziert die session ist aber leicht zu raten.
          * sessionToken ist zufällig erstellt wird vom client geschickt um die session zu authentifizieren.
        """
        cursor = self.connection.cursor()
        sessionToken = _sessionToken()
        cursor.execute('INSERT INTO sessions (session_token, user_id, created_on) VALUES (%s, %s, %s)', (sessionToken, userId, datetime.datetime.now()))
        return (sessionToken, self.getSessionIdFromToken(sessionToken))


    def getSessionIdFromToken(self, sessionToken):
        cursor = self.connection.cursor()
        cursor.execute('SELECT session_id FROM sessions WHERE session_token like %s', (sessionToken,))
        return cursor.fetchone()[0]


    def getUserIdFromSession(self, sessionId):
        cursor = self.connection.cursor()
        cursor.execute('SELECT user_id FROM sessions WHERE session_id = %s', (sessionId,))
        return cursor.fetchone()[0]


    def getUserNameFromSession(self, sessionId):
        cursor = self.connection.cursor()
        cursor.execute('SELECT username FROM sessions INNER JOIN accounts ON sessions.user_id=accounts.user_id WHERE session_id = %s', (sessionId,))
        try:
            return cursor.fetchone()[0]
        except:
            return None


    def isSessionValid(self, sessionId, sessionToken):
        cursor = self.connection.cursor()
        cursor.execute('SELECT COUNT(*) FROM sessions WHERE session_id = %s and session_token like %s', (sessionId, sessionToken))
        return int(cursor.fetchone()[0]) > 0


    def getJumps(self, userId):
        """Listet alle Fallschirmsprünge von `userId`."""
        cursor = self.connection.cursor()
        cursor.execute('SELECT date_string, description FROM jumps WHERE user_id = %s', (userId,))
        return cursor.fetchall()


    def addJump(self, userId, dateString, description):
        """Fügt einen neuen Sprung hinzu."""
        cursor = self.connection.cursor()
        cursor.execute('INSERT INTO jumps (user_id, date_string, description) VALUES (%s, %s, %s)', (userId, dateString, description))