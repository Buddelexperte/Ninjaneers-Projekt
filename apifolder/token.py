from jose import jwt, JWTError
from datetime import datetime, timedelta
from jose import jwe
import json
import os
from fastapi import Depends, HTTPException, Header, status
from src.settings import WeatherLoginUserInfo,WeatherLogin
from fastapi import Security, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials



SECRET_KEY = os.urandom(16)
ALGORITHM = "HS256" #encoding algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = 15

bearer_scheme = HTTPBearer()

def createPayload(user : WeatherLoginUserInfo):
    payloadData = {"sub" : user.username, "role" : user.role}

    return json.dumps(payloadData)

#credits: chatgpt
def create_encrypted_token(user: WeatherLoginUserInfo) -> str:
    payload = createPayload(user)          # 1. Wir erzeugen einen JSON-String mit Userdaten
    encrypted_token = jwe.encrypt(          # 2. Wir verschlüsseln den JSON-String mit deinem Schlüssel
        payload.encode(),                   # 3. payload.encode() wandelt den String in Bytes um (wichtig für Verschlüsselung)
        SECRET_KEY,                        # 4. Der geheime Schlüssel (16 Bytes)
        algorithm= "dir",                  # 5. Algorithmus für Schlüssel-Handling (hier 'direct', wir nehmen den Schlüssel direkt)
        encryption="A128GCM"              # 6. Verschlüsselungsmethode AES-GCM mit 128-Bit Schlüssel
    )
    return encrypted_token                 # 7. Wir geben den verschlüsselten Token (als String) zurück


#credits chatgpt
def decrypt_token(token: str) -> dict:
    decrypted_bytes = jwe.decrypt(token, SECRET_KEY)  # 1. Entschlüsseln des Tokens, Ergebnis sind Bytes
    decrypted_str = decrypted_bytes.decode()# 2. Bytes zurück in String umwandeln (JSON)
    data = json.loads(decrypted_str)                   # 3. JSON-String in Python-Dict parsen und zurückgeben
    userInfo = WeatherLoginUserInfo(username=data.get("sub"), password="", role=data.get("role"))

    return userInfo




async def get_current_user_by_token(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)
) -> WeatherLoginUserInfo:
    token = credentials.credentials  # hier ist nur der reine Token, ohne "Bearer "

    try:
        user = decrypt_token(token)
        if not user.username or not user.role:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )
        return user

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
