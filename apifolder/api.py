from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from src.settings import Engine, WeatherInfo, Session
from sqlalchemy import select


router = APIRouter()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React adress
    allow_headers=["*"],
)


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


