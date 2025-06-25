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

