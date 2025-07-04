import datetime

from apifolder.api import WeatherLogin, WeatherLoginUserInfo
from apifolder.token import create_decrypted_verification_token

def verifyRegistrationToken(token : str):
    tokenInformations = create_decrypted_verification_token(token)

    userId = tokenInformations.userId

    currentTime = int(datetime.now().timestamp())
    expTime = tokenInformations.expTime()

    result = expTime is not None and expTime > currentTime

    return userId, result


