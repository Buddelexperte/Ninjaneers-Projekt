from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText


from apifolder.api import WeatherLogin, WeatherLoginUserInfo
from apifolder.token import create_decrypted_verification_token

def verifyRegistrationToken(token : str):
    tokenInformations = create_decrypted_verification_token(token)

    userId = tokenInformations.id

    currentTime = int((datetime.now().timestamp()))
    expiration = tokenInformations.expTime

    notExpired = expiration is not None and expiration > currentTime

    return userId, notExpired





def send_verification_email(email: str, token: str):
    sender_email = "auto.mail.weatherData@gmail.com"
    app_password = "yhgo ccfb fpgr upgr"
    smtp_server = "smtp.gmail.com"
    smtp_port = 587

    verification_link = f"http://localhost:8000/weather/verifyRegistration?token={token}"

    message = MIMEText(f"""
    Hallo,<br><br>
    Bitte bestätige deine E-Mail, indem du auf den folgenden Link klickst:<br>
    <a href="{verification_link}">klicje</a><br><br>
    Der Link ist 30 Minuten gültig.
    """, "html")

    message["Subject"] = "E-Mail Verifizierung"
    message["From"] = sender_email
    message["To"] = email

    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(sender_email, app_password)
        server.sendmail(sender_email, email, message.as_string())



