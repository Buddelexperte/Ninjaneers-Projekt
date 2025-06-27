from sqlalchemy import Table, Column, Integer, String, Date, Float, create_engine
from sqlalchemy.orm import Session, declarative_base
from pydantic import BaseModel
from datetime import date

url = "mysql+pymysql://root:password@localhost:3306/weather_data"
Engine = create_engine(url, echo=True)
session = Session(Engine)

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

Base.metadata.create_all(Engine)

