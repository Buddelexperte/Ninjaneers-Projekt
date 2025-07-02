from jose import jwt, JWTError
from datetime import datetime, timedelta
from jose import jwe
import json

from src.settings import WeatherLoginUserInfo

key = b"16_byte_secret!"  # Schlüssel muss richtige Länge haben

payload = '{"sub":"user1"}'

encrypted_token = jwe.encrypt(payload.encode(), key, algorithm='dir', encryption='A128GCM')
decrypted = jwe.decrypt(encrypted_token, key)
print(decrypted.decode())  # '{"sub":"user1"}'




SECRET_KEY = "paul_carl_ninjaneers"
ALGORITHM = "HS256" #encoding algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = 1

def createPayload(user : WeatherLoginUserInfo):
    payloadData = {"sub" : user.username, "role" : user.role}

    return json.dumps(payloadData)

#credits: chatgpt
def create_encrypted_token(user: WeatherLoginUserInfo) -> str:
    payload = createPayload(user)          # 1. Wir erzeugen einen JSON-String mit Userdaten
    encrypted_token = jwe.encrypt(          # 2. Wir verschlüsseln den JSON-String mit deinem Schlüssel
        payload.encode(),                   # 3. payload.encode() wandelt den String in Bytes um (wichtig für Verschlüsselung)
        SECRET_KEY,                        # 4. Der geheime Schlüssel (16 Bytes)
        algorithm="dir",                  # 5. Algorithmus für Schlüssel-Handling (hier 'direct', wir nehmen den Schlüssel direkt)
        encryption="A128GCM"              # 6. Verschlüsselungsmethode AES-GCM mit 128-Bit Schlüssel
    )
    return encrypted_token                 # 7. Wir geben den verschlüsselten Token (als String) zurück


    return encrypted_token


#credits chatgpt
def decrypt_token(token: str) -> dict:
    decrypted_bytes = jwe.decrypt(token, SECRET_KEY)  # 1. Entschlüsseln des Tokens, Ergebnis sind Bytes
    decrypted_str = decrypted_bytes.decode()          # 2. Bytes zurück in String umwandeln (JSON)
    return json.loads(decrypted_str)                   # 3. JSON-String in Python-Dict parsen und zurückgeben
