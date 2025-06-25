import io
from datetime import date, timedelta, datetime
import matplotlib.pyplot as max_temp_diagram
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from src.settings import Engine, WeatherInfo, Session
from sqlalchemy import select, extract
import base64


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


@app.get("/weather/timeframe/{i_startDate}/{i_endDate}")
async def get_info(i_startDate : str, i_endDate : str):
    startYear = i_startDate[0:4]
    startMonth = i_startDate[5:7]
    startDay = i_startDate[8:10]
    startDate = date(int(startYear), int(startMonth), int(startDay))

    endYear = i_endDate[0:4]
    endMonth = i_endDate[5:7]
    endDay = i_endDate[8:10]
    endDate = date(int(endYear), int(endMonth), int(endDay))

    # Clear old plot
    max_temp_diagram.clf()

    days = []
    temps = []

    current_date = startDate
    index = 0


    while current_date <= endDate:
        days.append(current_date.strftime("%Y-%m-%d"))
        #print("Test1")

        with Session(Engine) as session:
            stmt = select(WeatherInfo.temp_max).where(WeatherInfo.date == current_date)
            maximum_temp = session.execute(stmt).mappings().first()
            temps.append(maximum_temp['temp_max'])

            index += 1
            #print(maximum_temp)
            current_date += timedelta(days=1)

    max_temp_diagram.bar(days, temps)
    max_temp_diagram.title("Maximale Temperatur vom " + str(startDate) + " bis zum " + str(endDate))

    max_temp_diagram.xlabel('Tage')
    max_temp_diagram.ylabel('Temperatur in Grad')

    max_temp_diagram.xticks(rotation=90)

    max_temp_diagram.tight_layout()

    buffer = io.BytesIO()
    max_temp_diagram.savefig(buffer, format='png')
    buffer.seek(0)

    encoded_string = base64.b64encode(buffer.read()).decode('utf-8')

    return {"image_base64": encoded_string}

