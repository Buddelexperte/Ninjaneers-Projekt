from datetime import datetime, timedelta

from apifolder.api import WeatherLogin, WeatherLoginUserInfo
from apifolder.token import create_decrypted_verification_token

def verifyRegistrationToken(token : str):
    tokenInformations = create_decrypted_verification_token(token)

    userId = tokenInformations.id

    currentTime = int((datetime.now().timestamp()))
    expiration = tokenInformations.expTime

    notExpired = expiration is not None and expiration > currentTime

    return userId, notExpired


