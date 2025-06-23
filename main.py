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




# New Sets
new_set = WeatherInfo(date = date(2025, 7, 26), precipitation= 2.2, temp_max = 24.3, temp_min= 0.2, wind= 0.1, weather= "sun" )


# Adding sets as changes to session
session.add(new_set)

# Commiting changes
session.commit()

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
