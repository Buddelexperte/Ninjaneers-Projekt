from sqlalchemy import create_engine
from sqlalchemy.orm import Session

url = "mysql+pymysql://root@localhost:3306/weather_data"

engine = create_engine(url, echo=True)

session = Session(engine)