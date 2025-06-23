from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.orm import declarative_base
from sqlalchemy import MetaData
metadata_obj = MetaData()
from datetime import date
import csv

from sqlalchemy import Table, Column, Integer, String, Date, Float

# weather_table = Table(
  #  "weather_info",
   # metadata_obj,
    #Column("id", Integer, primary_key=True),
    #Column("date", Date),
    #Column("precipitation", Float),
    #Column("temp_max", Float),
    #Column("temp_min", Float),
    #Column("wind", Float),
    #Column("weather", String(10)),
#)

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

url = "mysql+pymysql://root:@localhost:3306/weather_data"

engine = create_engine(url, echo=True)


session = Session(engine)

from sqlalchemy import insert
#stmt = insert(weather_table).values(date="2015-01-01", precipitation=3.0, temp_max=1.0, temp_min=0.0, wind=0.0, weather="sun")

new_set = WeatherInfo(date = date(2025, 7, 26), precipitation= 2.2, temp_max = 24.3, temp_min= 0.2, wind= 0.1, weather= "sun" )


weatherFile = open('weather.csv')
type(weatherFile)
csvreader = csv.reader(weatherFile)

#Empty list
header = []
header = next(csvreader)
header

rows = []
for row in csvreader:
rows.append(row)
rows

weatherFile.close()

session.add(new_set)



session.commit()