from fastapi import FastAPI
from fastapi import APIRouter
from src.settings import Engine, WeatherInfo, Session
from sqlalchemy import select

router = APIRouter()
app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/weather")
async def get_info():
    with Session(Engine) as session:
        statement = select(WeatherInfo).where(WeatherInfo.wind == 5.8)
        row = session.execute(statement).scalars().all()
        text = str(row.wind)
        return {text}


