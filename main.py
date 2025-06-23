# Importing Engine and Session
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

# Session creation
url = "mysql+pymysql://root:password@localhost:3306/weather_data"
engine = create_engine(url, echo=True)
session = Session(engine)

# Importing types
from sqlalchemy import Table, Column, Integer, String, Date, Float
from datetime import date
import csv

from sqlalchemy.orm import declarative_base
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

Base.metadata.create_all(engine)

# Delete all prev records
session.query(WeatherInfo).delete()
session.commit()

rows = []
with open("weather.csv", 'r') as file:
    csvreader = csv.reader(file)
    header = next(csvreader)
    for row in csvreader:
        rows.append(row)

for row in rows:
    date_str = row[0]
    precip_str = row[1]
    temp_max_str = row[2]
    temp_min_str = row[3]
    wind_str = row[4]
    weather_str = row[5]

    year = date_str[0:4]
    month = date_str[5:7]
    day = date_str[8:10]

    new_set = WeatherInfo(
        date=date(int(year), int(month), int(day)),
        precipitation=float(precip_str),
        temp_max=float(temp_max_str),
        temp_min=float(temp_min_str),
        wind=float(wind_str),
        weather=weather_str,
    )

    session.add(new_set)

# Commiting changes
session.commit()

exit()