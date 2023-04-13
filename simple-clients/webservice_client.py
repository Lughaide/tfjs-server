import json
import base64
import requests
from PIL import Image
import os

def cls():
    os.system('cls' if os.name=='nt' else 'clear')

def doRequest(URL, request_msg):
    try:
        r = requests.post(url = URL, json= request_msg)
        result = r.json()
        return result['reply']
    except:
        print("Cannot make request")
        return

def postFiglet(query):
    URL = "http://localhost:8080/figlet"

    request_msg = {
        'text': query
    }
    res = doRequest(URL, request_msg)
    print(res)
    
def postDL(file_path):
    URL = "http://localhost:8080/predict"
    try:
        with open(file_path, "rb") as image_file:
            data = base64.b64encode(image_file.read())
            data = data.decode('utf-8')
    except:
        print("File is missing or invalid.")
        return
    
    request_msg = {
        'image': data
    }
    res = doRequest(URL, request_msg)
    print(res[0])

def postDB():
    URL = "http://localhost:8080/database"
    request_msg = {}
    res = doRequest(URL, request_msg)
    for entry in res:
        print(entry)


if __name__ == "__main__":
    try:
        postFiglet("Simple Web Client")
    except:
        print("Webservice not started. Exiting.")
        exit(0)
    
    while (True):
        print("Enter desired function: ")
        print("#1: Figlet")
        print("#2: MobileNet Classification")
        print("#3: Query service usage")
        print("#?: Exit client")
        user_choice = input("Choice: ")
        if (user_choice == '1'):
            postFiglet(input("Enter text to convert: "))        
        elif (user_choice == '2'):
            postDL(input("Enter filepath: "))
        elif (user_choice == '3'):
            postDB()
        else:
            print("Exiting client.")
            exit(0)
        input("Press Enter to continue...")
        cls()

        