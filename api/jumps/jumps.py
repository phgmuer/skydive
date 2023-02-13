# coding=utf-8
r"""
Verwalten der Fallschirmsprung Daten.
"""

def addJump(database, sessionId, sessionToken, jumpDate, jumpDescription):
    """Fügt neuen Sprung hinzu."""
    if not all([sessionId,  sessionToken, jumpDate, jumpDescription]):
        return {"success": False, "message": "Missing data."}
    if not database.isSessionValid(sessionId, sessionToken):
        return {"success": False, "message": "Invalid session."}

    userId = database.getUserIdFromSession(sessionId)
    if not userId:
        return {"success": False, "message": "User not found."}

    database.addJump(userId, jumpDate, jumpDescription)
    return {"success": True}


def getJumps(database, sessionId, sessionToken):
    """Listet alle Sprünge von einem Benutzer."""
    if not all([sessionId,  sessionToken]):
        return {"success": False, "message": "Missing data."}
    if not database.isSessionValid(sessionId, sessionToken):
        return {"success": False, "message": "Invalid session."}

    userId = database.getUserIdFromSession(sessionId)
    if not userId:
        return {"success": False}

    return {
        "success": True,
        "jumps": sorted(
            # Sortiere die Sprünge absteigend nach Tag (neusten Sprünge zuerst). Die Daten sind Strings der form
            # YYYY-MM-DD` weshalb der direkte String vergleich funktioniert.
            [{"date": jump[0], "description": jump[1]} for jump in database.getJumps(userId)],
                        key=lambda jump: jump["date"], reverse=True)
    }