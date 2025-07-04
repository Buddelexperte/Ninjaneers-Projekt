from sqlalchemy import Table, Column, Integer, String, Date, Float, create_engine, Boolean
from sqlalchemy.orm import Session, declarative_base
from pydantic import BaseModel
from datetime import date

url = "mysql+pymysql://root:password@localhost:3306/weather_data"
engine = create_engine(url, echo=True)
session = Session(engine)

Base = declarative_base()

class WeatherInfo (Base) :
    __tablename__ = 'weather_info'

    id = Column(Integer, primary_key=True)
    date = Column(Date)
    precipitation = Column(Float)
    temp_max = Column(Float)
    temp_min = Column(Float)
    wind = Column(Float)
    weather= Column(String(10))


class WeatherLogin(Base):
    __tablename__ = 'weather_login'

    id = Column(Integer, primary_key=True)
    username = Column(String(50))
    password = Column(String(256))
    role = Column(String(50))

class WeatherUserRole(Base):
    __tablename__ = 'weather_user_role'
    id = Column(Integer, primary_key=True)
    roleTitle = Column(String(50))

#Schema wie die json aussehen muss
class WeatherCreate(BaseModel):
    i_id : int
    i_date: date
    i_precipitation : float
    i_temp_max: float
    i_temp_min: float
    i_wind: float
    i_weather: str

class WeatherDeleteWithId(BaseModel):
    id : int

class WeatherLoginUserInfo(BaseModel):
    username: str
    password : str
    role : str

class WeatherUserRoleInfo(BaseModel):
    roleTitle: str

class UserVerificationObject(BaseModel):
    id : int
    expTime : int


class UserVerification(Base):
    __tablename__ = 'user_verification'
    id = Column(Integer, primary_key=True)
    userId = Column(Integer)
    token = Column(String(256))


class WeatherLoginEmail(Base):
    __tablename__ = 'weather_login_email'

    id = Column(Integer, primary_key=True)
    username = Column(String(50))
    password = Column(String(256))
    role = Column(String(50))
    email = Column(String(50))
    isVerified = Column(Boolean)


class WeatherLoginUserInfoEmail(BaseModel):
    username: str
    password : str
    role : str
    email : str
    isVerified : bool