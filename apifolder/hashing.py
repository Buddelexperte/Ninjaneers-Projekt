from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError


ph = PasswordHasher()

def hashPassword(password: str):
    hashedPassword = ph.hash(password)
    return hashedPassword


def verifyUnhashed(hashedPassword: str, password: str):
    try:
        ph.verify(hashedPassword, password)
        #return {"success": True}
        return True
    except VerifyMismatchError:
        #return {"success": False, "message": "Falsches Passwort"}
        return False
    except Exception as e:
        #return {"success": False, "message": str(e)}
        return False