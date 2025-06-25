import io
from datetime import date, timedelta, datetime
import matplotlib.pyplot as universal_diagram
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from src.settings import Engine, WeatherInfo, Session
from sqlalchemy import select, extract, RowMapping
import base64
import numpy as np
import io


router = APIRouter()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/weather/all")
async def get_info():
    with Session(Engine) as session:
        statement = select(WeatherInfo)
        res = session.execute(statement).mappings().all()
    return res

@app.get("/weather/years/all")
async def get_years():
    with (Session(Engine) as session):
        statement = (
            select(extract('year', WeatherInfo.date))
            .distinct()
            .order_by(extract('year', WeatherInfo.date))
        )
        res = session.execute(statement).scalars().all()
    return res

@app.get("/weather/year/{year}")
async def get_info(year: int):
    with Session(Engine) as session:
        statement = select(WeatherInfo).where(extract('year', WeatherInfo.date) == year)
        res = session.execute(statement).mappings().all()
    return res


@app.get("/weather/timeframe/{i_startDate}/{i_endDate}/{type}")
async def get_info(i_startDate : str, i_endDate : str, type : str):
    startYear = i_startDate[0:4]
    startMonth = i_startDate[5:7]
    startDay = i_startDate[8:10]
    startDate = date(int(startYear), int(startMonth), int(startDay))

    endYear = i_endDate[0:4]
    endMonth = i_endDate[5:7]
    endDay = i_endDate[8:10]
    endDate = date(int(endYear), int(endMonth), int(endDay))

    def switch_data(type):
        if type == "precipitation":
            return WeatherInfo.precipitation
        elif type == "temp_max":
            return WeatherInfo.temp_max
        elif type == "temp_min":
            return WeatherInfo.temp_min
        elif type == "wind":
            return WeatherInfo.wind
        else:
            return None

    def switch_label(type: str):
        if type == "precipitation":
            return "Niederschlag in mm"
        elif type == "temp_max":
            return "Temperatur in Grad"
        elif type == "temp_min":
            return "Temperatur in Grad"
        elif type == "wind":
            return "Wind in km/h"
        else:
            return None

    if not switch_data(type):
        return {"message": "No data available for this type"}

    universal_diagram.figure(figsize = (16,9),dpi = 200)

    days = []
    values = []

    universal_diagram.clf()
    universal_diagram.title(type + " vom " + str(startDate) + " bis " + str(endDate))

    highest_value = float('-inf')
    highest_index = -1
    lowest_value = float('inf')
    lowest_index = -1
    index = 0

    current_date = startDate
    dataType = switch_data(type)


    while current_date <= endDate:
        days.append(current_date.strftime("%Y-%m-%d"))
        #print("Test1")

        with Session(Engine) as session:

            stmt = select(dataType).where(WeatherInfo.date == current_date)
            value = session.execute(stmt).mappings().first()
            actual_value = value[type]

            values.append(actual_value)

            if actual_value >= highest_value:
                highest_value = actual_value
                highest_index = index
            if actual_value <= lowest_value:
                lowest_value = actual_value
                lowest_index = index

            index += 1
            current_date += timedelta(days=1)

    colors = ['blue'] * index
    colors[highest_index] = "red"
    colors[lowest_index] = "red"

    universal_diagram.bar(days, values, color=colors)
    universal_diagram.axhline(np.mean(values), color='black')
    universal_diagram.xticks(rotation=90)


    universal_diagram.xlabel('Tage')
    universal_diagram.ylabel(switch_label(type))

    universal_diagram.tight_layout()

    buffer = io.BytesIO()
    universal_diagram.savefig(buffer, format='png')
    buffer.seek(0)

    encoded_string = base64.b64encode(buffer.read()).decode('utf-8')

    return {"image_base64": encoded_string}

