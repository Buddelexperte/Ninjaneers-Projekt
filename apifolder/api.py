from datetime import date

from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from src.settings import Engine, WeatherInfo, Session
from sqlalchemy import select, extract


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
    text :str
    with Session(Engine) as session:
        statement = select(WeatherInfo)
        res = session.execute(statement).mappings().all()
    return res

@app.get("/weather/{year}")
async def get_info(year: int):
    text :str
    with Session(Engine) as session:
        statement = select(WeatherInfo).where(extract('year', WeatherInfo.date) == year)
        res = session.execute(statement).mappings().all()
    return res

@app.get("/weather/{date1}-{date2}")
async def get_info(date1 : date, date2 : date):
    text :str
    with Session(Engine) as session:
        #statement = select(WeatherInfo).where(extract('year', WeatherInfo.date) == year)
        res = session.execute(statement).mappings().all()
    return res
