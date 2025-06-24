from fastapi import FastAPI, APIRouter
from src.settings import Engine, WeatherInfo, Session
from sqlalchemy import select

router = APIRouter()
app = FastAPI()


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


