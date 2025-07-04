import subprocess
import sys
import os

# Config - change these to your values
MYSQL_USER = "root"
MYSQL_PASSWORD = "password"
MYSQL_HOST = "localhost"
MYSQL_PORT = 3306
DATABASE_SETUP_SQL = "update-dtb.py"
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
WEATHER_WEB_DIR = os.path.join(PROJECT_DIR, "weatherWeb/")
FASTAPI_MODULE = "apifolder.api:app"  # e.g., main.py with app inside
UVICORN_HOST = "127.0.0.1"
UVICORN_PORT = "8000"

import subprocess

def run_in_new_terminal(command, cwd=None):
    cwd_part = f"cd {cwd} && " if cwd else ""
    full_command = f'{cwd_part}{command}; exec bash -l'
    subprocess.Popen(['gnome-terminal', '--', 'bash', '-c', full_command])

def run_command(command, cwd=None):
    print(f"Running: {command}")
    process = subprocess.Popen(command, shell=True, cwd=cwd)
    process.communicate()
    if process.returncode != 0:
        print(f"Command failed: {command}")
        sys.exit(1)

def install_requirements():
    print("Installing requirements.txt packages...")
    run_command("pip install -r requirements.txt", cwd=PROJECT_DIR)

def start_npm():
    print("Starting npm...")
    # Runs npm start in your project directory
    run_in_new_terminal("npm run dev", cwd=WEATHER_WEB_DIR)

def start_uvicorn():
    print("Starting uvicorn...")
    # Adjust for your app entrypoint
    run_in_new_terminal(f"uvicorn {FASTAPI_MODULE} --reload")

def main():
    install_requirements()
    start_npm()
    start_uvicorn()

if __name__ == "__main__":
    main()
