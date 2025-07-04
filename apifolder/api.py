from datetime import date, timedelta, datetime
import matplotlib.pyplot as universal_diagram
from fastapi import FastAPI, APIRouter, Depends, Body
from fastapi.middleware.cors import CORSMiddleware

from src.settings import Engine, WeatherInfo, Session, WeatherCreate, WeatherDeleteWithId, WeatherLogin, WeatherLoginUserInfo, WeatherUserRole, WeatherUserRoleInfo
from sqlalchemy import select, extract, update, delete
import base64
import numpy as np
import io
from sklearn.linear_model import LinearRegression
from argon2 import PasswordHasher
from apifolder.hashing import hashPassword, verifyUnhashed
from apifolder.token import createPayload, create_encrypted_token, decrypt_token, get_current_user_by_token

from typing import List

router = APIRouter()
app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # test
    allow_credentials=True,
    allow_methods=["*"],
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


        stmt = (update(WeatherInfo).where(WeatherInfo.id == data.i_id).values(
            precipitation=data.i_precipitation,
            temp_max=data.i_temp_max,
            temp_min=data.i_temp_min,
            wind=data.i_wind,
            weather=data.i_weather)
        )





        session.execute(stmt)
        session.commit()

        return True

# USer darf nicht erstelle werden, wenn es die rolle nicht gibt
def createUser(i_username : str, i_password : str, i_role : str):
    with Session(Engine) as session:

        stmt = select(WeatherLogin.username).where(WeatherLogin.username == i_username)

        result = session.execute(stmt).first()

        if not result:
            hashedPassword = hashPassword(i_password)

            new_login_set = WeatherLogin(
                username = i_username,
                password = hashedPassword,
                role = i_role
            )

            session.add(new_login_set)
            session.commit()
            return True
        return False

def checkExistingRole(i_roleTitle : str):
    with Session(Engine) as session:
        stmt = select(WeatherUserRole).where(WeatherUserRole.roleTitle == i_roleTitle)
        checkExistingRole = session.execute(stmt).first()

        if not checkExistingRole:
            return True

        else:
            return False

def getUserRoleF(user : WeatherLoginUserInfo):
    with Session(Engine) as session:
        stmt = select(WeatherLogin.role).where(WeatherLogin.username == user.username)
        result = session.execute(stmt).first()

        role = result[0]
        return role

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

    #universal_diagram.figure(figsize = (6,4),dpi = 200)

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

    forecast_diagram.set_xlabel('Tage')
    forecast_diagram.set_ylabel('Temperatur in °C')
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
        stmt = select(WeatherInfo).where(WeatherInfo.id == entry.i_id)
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
async def delete_entry(entry : WeatherDeleteWithId):

    with Session(Engine) as session:
        stmt = delete(WeatherInfo).where(WeatherInfo.id == entry.id)
        result = session.execute(stmt)
        session.commit()



    return {"Das Löschen war: ": result}



@app.post("/weather/login")
async def get_login(entry : WeatherLoginUserInfo):

    with Session(Engine) as session:
        stmt = select(WeatherLogin.password).where(WeatherLogin.username == entry.username)
        stmtID = select(WeatherLogin.id).where(WeatherLogin.username == entry.username)
        tmp = session.execute(stmt).first()
        tmpID = session.execute(stmtID).first()

        if not tmp:
            return {
                "success": False,
                "message": "Kein User mit dem Namen: " + entry.username
            }

        result = tmp[0]

        resultID = tmpID[0]
        print(resultID)


        verification = verifyUnhashed(result, entry.password)
        if verification is True:
            role = getUserRoleF(entry)
            entry.role = role

            print(entry)


            encrypted_token = create_encrypted_token(entry) #encrypted_token = string
            #print(decrypt_token(encrypted_token))
            return {"success": True,
                    "message" : "Encrypted Token: ",
                    "body": {"access_token": encrypted_token,
                             "token_type": "bearer"
                    }
            }
        else:
            return {"success": False,
                    "message" : "Fehler bei der Anmeldung"
                    }





@app.post("/weather/signup")
async def createNewUser(newUserInfo : WeatherLoginUserInfo):
    if not createUser(newUserInfo.username, newUserInfo.password, 'user'):
        return {
            "success": False,
            "message" : "Name existiert bereits"
        }

    return {
        "success": True,
        "message" : "Sign Up erfolgreich"
    }

@app.post("/weather/deleteUser")
async def deleteUser(currentUser : WeatherLoginUserInfo = Depends(get_current_user_by_token), userToDelete : WeatherLoginUserInfo = Body() ):
    with Session(Engine) as session:
        currentUserStmt = select(WeatherLogin).where(WeatherLogin.username == currentUser.username)
        currentUserResult = session.execute(currentUserStmt).first()

        if not currentUserResult:
            return {
                "success": False,
                "message": f"User '{currentUser.username}' wurde nicht gefunden."
            }

        tmp = currentUserResult[0]
        currentUserRole = tmp.role

        userToDeleteStmt = select(WeatherLogin).where(WeatherLogin.username == userToDelete.username)
        userToDeleteResult = session.execute(userToDeleteStmt).first()

        if not userToDeleteResult:
            return {
                "success": False,
                "message": f"User '{userToDelete.username}' existiert nicht und kann nicht gelöscht werden."
            }



        tmp = userToDeleteResult[0]
        userToDeleteRole = tmp.role

        # Admin is able to delete an user (works)
        if currentUserRole == 'admin' and userToDeleteRole != 'admin':
            stmt = delete(WeatherLogin).where(WeatherLogin.username == userToDelete.username)
            session.execute(stmt)
            session.commit()
            return {"success": True,
                    "message": "User wurde von Admin gelöscht"
                    }

        #An admin is not able to delete himself, because of his role (works)
        elif currentUserRole == 'admin' and currentUser.username == userToDelete.username:
            return {"success": False,
                    "message": "Admin darf nicht gelöscht werden"
                    }

        #An user is able to delete his own account (works)
        else:
            stmt = delete(WeatherLogin).where(WeatherLogin.username == currentUser.username)
            session.execute(stmt)
            session.commit()

            return {
                "success": True,
                "message": "User wurde gelöscht"
            }

@app.put("/weather/updateUser")
async def updateUser(currentUser : WeatherLoginUserInfo = Depends(get_current_user_by_token), newUserData : WeatherLoginUserInfo = Body()):
    with Session(Engine) as session:



        ## Updates the role of an user if the current user is an admin (works)
        if currentUser.role == 'admin' and currentUser.username != newUserData.username:
            stmt = update(WeatherLogin).where(WeatherLogin.username == newUserData.username).values(role = newUserData.role)
            session.execute(stmt)
            session.commit()

            return{"success": True,
                   "message": "User wurde von Admin aktualisiert"
            }

        # Updates the login informations of an user, if the requested new Username is available
        # If request username or password is empty it remains as before
        # (works)
        else:
            CheckExistingstmt = select(WeatherLogin.username).where(WeatherLogin.username == newUserData.username)

            result = session.execute(CheckExistingstmt).first()



            if not result:
                if newUserData.password:
                    stmt = update(WeatherLogin).where(WeatherLogin.username == currentUser.username).values(password = newUserData.password)
                    session.execute(stmt)
                    session.commit()

                if newUserData.username:
                    stmt = update(WeatherLogin).where(WeatherLogin.username == currentUser.username).values(username = newUserData.username)
                    session.execute(stmt)
                    session.commit()


            return {
                "success" : True,
                "message" : "User hat seine Informationen geändert"
            }


@app.get("/weather/getRoles")
async def getRoles(currentUser : WeatherLoginUserInfo = Depends(get_current_user_by_token)):
    if currentUser.role == 'admin':
        with Session(Engine) as session:
            stmt = select(WeatherUserRole)
            result = session.execute(stmt).scalars().all()

        return result
    else:
        return {"success": False,
                "message": "Kein Admin"
                }

@app.post("/weather/createNewRole")
async def createNewRole(currentUser : WeatherLoginUserInfo = Depends(get_current_user_by_token), newRole : WeatherUserRoleInfo = Body()):
    if currentUser.role == 'admin':

        with Session(Engine) as session:

            result = checkExistingRole(newRole.roleTitle)

            if result == True:
                new_role_set = WeatherUserRole(
                    roleTitle = newRole.roleTitle,

                )
                session.add(new_role_set)
                session.commit()

                return {"success": True,
                        "message": f"Neue Rolle: {newRole.roleTitle} wurde hinzugefügt"
                }

            else:
                return {"success": False,
                        "message": f"Rolle: {newRole.roleTitle} ist bereits vorhanden"
                }

    else:
        return {"success": False,
                "message" : "Kein Admin"
                }


@app.post("/weather/getUserRole")
async def getUserRole(user : WeatherLoginUserInfo):
        role = getUserRole(user.username)

        return {"success": True,
                "message": f"Rolle des Users:",
                "body" : role
        }


@app.get("/weather/getAllUsers")
async def getAllUsers(currentUser : WeatherLoginUserInfo = Depends(get_current_user_by_token)):
    if currentUser.role == 'admin':
        with Session(Engine) as session:
            stmt = select(WeatherLogin)
            result = session.execute(stmt).scalars().all()

            users = []
            for user in result:
                users.append({
                    "username" : user.username,
                    "role" : user.role
                })
            return {"success": True,
                    "message": "Liste aller User mit Rolle",
                    "body": users
                    }

    else:
        return {"success": False,
                "message": "Kein Admin"
                }

@app.put("/weather/updateUserRoles")
async def updateUserRoles(currentUser : WeatherLoginUserInfo = Depends(get_current_user_by_token), users: List[WeatherLoginUserInfo] = Body()):
    if currentUser == "admin":
        with Session(Engine) as session:
            for user in users:
                stmt = update(WeatherLogin).where(WeatherLogin.username == user.username).values(role = user.role)
                session.execute(stmt)

            session.commit()
            return {"success": True,
                    "message": "Rolle der User wurde verändert"
                    }
    else:
        return {"success": False,
                "message" : "Kein Admin"
                }


@app.get("/weather/getPersonalInfo")
async def getPersonalInfo(currentUser : WeatherLoginUserInfo = Depends(get_current_user_by_token)):


    return {"success": True,
            "message ": "Userinfos",
            "Body": {"username" : currentUser.username, "role" : currentUser.role}
            }






