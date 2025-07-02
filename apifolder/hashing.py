from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

ph = PasswordHasher()

def verifyUnhashed(password: str, hashedPassword: str):
    try:
        ph.verify(hashedPassword, password)
        return True
    except VerifyMismatchError:
        return False
    except Exception as e:
        print(f"Ein Fehler ist aufgetreten: {e}")
        return False


ph = PasswordHasher()

def hashPassword(password: str):
    hashedPassword = ph.hash(password)
    return hashedPassword


def verifyUnhashed(hashedPassword: str, password: str):
    try:
        print("Versuche zu verifizieren...")
        ph.verify(hashedPassword, password)
        return {"success": True}
    except VerifyMismatchError:
        print("Passwort stimmt nicht.")
        return {"success": False, "message": "Kein User mit dem Namen: " + password}
    except Exception as e:
        print("Fehler:", str(e))
        return {"success": False, "message": str(e)}
