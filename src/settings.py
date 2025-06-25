from sqlalchemy import Table, Column, Integer, String, Date, Float, create_engine
from sqlalchemy.orm import Session, declarative_base

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

Base.metadata.create_all(Engine)