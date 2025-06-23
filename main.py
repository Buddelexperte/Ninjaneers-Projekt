from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from sqlalchemy import MetaData
metadata_obj = MetaData()

from sqlalchemy import Table, Column, Integer, String, Date, Float
weather_table = Table(
    "weather_info",
    metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("date", Date),
    Column("precipitation", Float),
    Column("temp_max", Float),
    Column("temp_min", Float),
    Column("wind", Float),
    Column("weather", String(10)),
)

url = "mysql+pymysql://root:@localhost:3306/weather_data"

engine = create_engine(url, echo=True)

session = Session(engine)

from sqlalchemy import insert
stmt = insert(weather_table).values(date="2015-01-01", precipitation=3.0, temp_max=1.0, temp_min=0.0, wind=0.0, weather="sun")

print(stmt)