import io
from datetime import date, timedelta, datetime
import matplotlib.pyplot as universal_diagram
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from matplotlib.pyplot import subplot
from sqlalchemy.dialects.mysql import insert

from src.settings import Engine, WeatherInfo, Session, WeatherCreate
from sqlalchemy import select, extract, RowMapping, update, delete
import base64
import numpy as np
import io
from sklearn.linear_model import LinearRegression
import requests


router = APIRouter()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_headers=["*"],
)


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

def updateData(data : WeatherCreate):

    with Session(Engine) as session:


        stmt = (update(WeatherInfo).where(WeatherInfo.date == data.i_date).values(
            precipitation=data.i_precipitation,
            temp_max=data.i_temp_max,
            temp_min=data.i_temp_min,
            wind=data.i_wind,
            weather=data.i_weather)
        )





        session.execute(stmt)
        session.commit()

        return True
    return False


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



    if not switch_data(type):
        return {"message": "No data available for this type"}

    universal_diagram.figure(figsize = (6,4),dpi = 200)

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


@app.get("/weather/predict/{target_date}")
async def get_prediction(target_date: str,):
    year, month, day = map(int, target_date.split("-"))
    predict_date = date(year, month, day)
    start_date = predict_date - timedelta(days=10)

    independent_type = 'temp_max'
    dependent_type = 'temp_min'

    independent_values = [] # Maximale Temp
    dependent_values = [] # minimale Temp
    days = []
    current_date = start_date

    while current_date < predict_date:
        days.append(current_date.strftime("%Y-%m-%d"))
        with Session(Engine) as session:
            # Min
            stmt_ind = select(WeatherInfo.temp_max).where(WeatherInfo.date == current_date)
            row_ind = session.execute(stmt_ind).mappings().first()
            if row_ind is None:
                return {"error": f"Keine Daten für {current_date} (independent)"}
            independent_values.append(row_ind[WeatherInfo.temp_max])

            # Max
            stmt_dep = select(WeatherInfo.temp_min).where(WeatherInfo.date == current_date)
            row_dep = session.execute(stmt_dep).mappings().first()
            if row_dep is None:
                return {"error": f"Keine Daten für {current_date} (dependent)"}
            dependent_values.append(row_dep[WeatherInfo.temp_min])



        current_date += timedelta(days=1)

    if len(independent_values) < 10 or len(dependent_values) < 10:
        return {"error": "Nicht genügend Daten für Prediction"}

    input_prediction = []
    for i in range(10):
        input_prediction.append(independent_values[i])
        input_prediction.append(dependent_values[i])



    X_train = np.array([input_prediction])
    y_min = [np.mean(independent_values)]
    y_max = [np.mean(dependent_values)]

    #Train modell
    reg_min = LinearRegression().fit(X_train, y_min)
    reg_max = LinearRegression().fit(X_train, y_max)

    #prediction
    x_predict = np.array(input_prediction).reshape(1, -1)
    pred_min = float(reg_min.predict(x_predict)[0])
    pred_max = float(reg_max.predict(x_predict)[0])

    if pred_min > pred_max:
        pred_min, pred_max = pred_max, pred_min

    fig, forecast_diagram = universal_diagram.subplots()


    dependent_values.append(pred_min)
    independent_values.append(pred_max)
    days.append("Prediction for: " + str(current_date))


    length = len(days)
    colors_min = ['lightblue'] * (length - 1) + ['blue']
    colors_max = ['orange'] * (length - 1) + ['red']

    temp_range = [max_ - min_ for min_, max_ in zip(dependent_values, independent_values)]

    forecast_diagram.bar(days, temp_range, bottom=dependent_values, color=colors_max, label="Max-Min Spanne")
    forecast_diagram.axhline(0, color='black', linewidth=0.5)

    #fig.set_xlabel('Tage')
    #fig.set_ylabel('Temperator in °')
    forecast_diagram.tick_params(axis='x', rotation=90)
    fig.tight_layout()

    buffer = io.BytesIO()
    fig.savefig(buffer, format='png')
    buffer.seek(0)

    encoded_string = base64.b64encode(buffer.read()).decode('utf-8')

    return {"image_base64": encoded_string}

    #return { "Min:" : pred_min, "Max:" : pred_max }

@app.post("/weather/addEntry")
async def add_entry(entry : WeatherCreate):

    with Session(Engine) as session:
        stmt = select(WeatherInfo).where(WeatherInfo.date == entry.i_date)
        result = session.execute(stmt).first()

        if result:
            updateData(entry)
            return {"Werte wurden aktualisiert"}



        input_data = WeatherInfo(
            date = entry.i_date,
            precipitation = entry.i_precipitation,
            temp_max = entry.i_temp_max,
            temp_min = entry.i_temp_min,
            wind = entry.i_wind,
            weather = entry.i_weather)


        session.add(input_data)
        session.commit()


        return {"success": True}

@app.post("/weather/updateEntry")
async def update_entry(entry : WeatherCreate):
    result = updateData(entry)

    return {"success, updaten ist ": result}


@app.post("/weather/deleteEntry")
async def delete_entry(entry : WeatherCreate):

    with Session(Engine) as session:
        stmt = delete(WeatherInfo).where(WeatherInfo.date == entry.i_date)
        result = session.execute(stmt)
        session.commit()



    return {"Das Löschen war: ": result}




