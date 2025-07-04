import webbrowser
import time
import subprocess
import sys
import os
import platform

# Config - change these to your values
MYSQL_USER = "root"
MYSQL_PASSWORD = "password"
MYSQL_HOST = "localhost"
MYSQL_PORT = 3306
DATABASE_SETUP_SQL = "reset-dtb.py"
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
WEATHER_WEB_DIR = os.path.join(PROJECT_DIR, "weatherWeb/")
FASTAPI_MODULE = "apifolder.api:app"  # e.g., main.py with app inside
UVICORN_HOST = "127.0.0.1"
UVICORN_PORT = "8000"


def run_in_new_terminal(command, cwd=None):
    system = platform.system()
    cwd = cwd or os.getcwd()

    if system == "Linux":
        # Source nvm and then run command inside cwd, keep terminal open
        terminal_cmd = f'''
        cd "{cwd}" && \
        export NVM_DIR="$HOME/.nvm" && \
        [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh" && \
        {command}; exec bash
        '''
        # join all lines to one command string for bash -c
        terminal_cmd = " ".join(line.strip() for line in terminal_cmd.strip().splitlines())
        subprocess.Popen(["gnome-terminal", "--", "bash", "-c", terminal_cmd])
    elif system == "Darwin":  # macOS
        terminal_cmd = f'cd "{cwd}"; {command}'
        subprocess.Popen(["osascript", "-e",
            f'tell app "Terminal" to do script "{terminal_cmd}"'])
    elif system == "Windows":
        terminal_cmd = f'start cmd /k "cd /d {cwd} && {command}"'
        subprocess.Popen(terminal_cmd, shell=True)
    else:
        print("Unsupported OS for opening a new terminal.")
        sys.exit(1)

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

def try_reset_dtb():
    flag_path = os.path.join(PROJECT_DIR, "init-dtb-complete")
    if not os.path.exists(flag_path):
        print("First run detected. Running reset-dtb.py ...")
        run_command(f"python {DATABASE_SETUP_SQL}", cwd=PROJECT_DIR)
        with open(flag_path, "w") as f:
            f.write("done")
    else:
        print("Not first run, skipping reset-dtb.py")

def start_npm():
    print("Starting npm...")
    run_in_new_terminal("npm run dev", cwd=WEATHER_WEB_DIR)

def start_uvicorn():
    print("Starting uvicorn...")
    run_in_new_terminal(f"uvicorn {FASTAPI_MODULE} --reload")

def open_browser():
    url = "http://localhost:5173/"
    print("Opening browser...")
    time.sleep(2)
    webbrowser.open(url)

def main():
    install_requirements()
    try_reset_dtb() # Checks for "first run" flag, then resets database if not found
    # Maybe needs MySQL to run as well
    start_npm()
    start_uvicorn()
    open_browser()   # open web app URL in default browser, after some delay


if __name__ == "__main__":
    main()
