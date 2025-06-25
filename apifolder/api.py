from datetime import date, datetime, timedelta

from fastapi import FastAPI, APIRouter

from src.settings import Engine, WeatherInfo, Session
from sqlalchemy import select, text
import matplotlib.pyplot as max_temp_diagram
from pydantic import BaseModel
import requests




router = APIRouter()
app = FastAPI()

class AskedTimeframe(BaseModel):
    startDate: str
    endDate: str



def output(ini_v : str):
    print(ini_v)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/weather")
async def get_info():
    text :str
    with Session(Engine) as session:
        statement = select(WeatherInfo)
        res = session.execute(statement).mappings().all()
    return res


@app.post("/askedTimeframe/")
async def timeframe(atf : AskedTimeframe):
    startYear = atf.startDate[0:4]
    startMonth = atf.startDate[5:7]
    startDay = atf.startDate[8:10]
    i_startDate = date(int(startYear), int(startMonth), int(startDay))

    endYear = atf.endDate[0:4]
    endMonth = atf.endDate[5:7]
    endDay = atf.endDate[8:10]
    i_endDate = date(int(endYear), int(endMonth), int(endDay))




    days = []
    temps = []


    current_date = i_startDate
    index = 0

    print(current_date)
    print(i_endDate)
    print(current_date <= i_endDate)

    while current_date <= i_endDate:
        days.append(current_date.strftime("%Y-%m-%d"))
        print("Test1")

        with Session(Engine) as session:
            stmt = select(WeatherInfo.temp_max).where(WeatherInfo.date == current_date)
            maximum_temp = session.execute(stmt).mappings().first()
            temps.append(maximum_temp['temp_max'])

            index += 1
            print(maximum_temp)
            current_date += timedelta(days=1)

    max_temp_diagram.bar(days, temps)
    max_temp_diagram.title("Maximale Temperatur vom " + atf.startDate + " bis zum " + atf.endDate)

    max_temp_diagram.xlabel('Tage')
    max_temp_diagram.ylabel('Temperatur in Grad')

    max_temp_diagram.savefig('foo.png')
    max_temp_diagram.savefig('foo.pdf')

    return {"Passt"}





