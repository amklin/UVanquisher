# import statements
from flask import Flask, request, render_template
from datetime import datetime
import pyrebase
import re
import pandas as pd

# Configuration credentials (can be found in Firebase console)
config = {
  "apiKey": "AIzaSyA1cpex5ClSuRCFVd_aNrPHtP0SzGXx2TU",
  "authDomain": "uvanquisher.firebaseapp.com",
  "databaseURL": "https://uvanquisher-default-rtdb.firebaseio.com",
  "projectId": "uvanquisher",
  "storageBucket": "uvanquisher.appspot.com",
  "messagingSenderId": "462359954778",
  "appId": "1:462359954778:web:08675ae8be8a0be4989f63"
}

# Initialize firebase connection
firebase = pyrebase.initialize_app(config)

# Create database object ("db" represents the root node in the database)
db = firebase.database()

# Make variables accessible within function scope
global key, timeStamp, uid, collecting_data

# Each data set will be stored under its own child node identified by a timestamp
# The timestamp for the current data set is taken when app.py is executed
timeStamp = datetime.now().strftime("%d-%m-%Y %H:%M:%S")

# Keys for key:value pairs will be integers (converted to strings for FB) 
# For each data set, keys will start from 0.  "key" variable will be incremented 
# in arduino_request() function.
key = 0

# user id of logged in user
# used to save data in firebase for designated user
# if not logged in, uid is None
uid = None

#whether or not the data is currently being collected and stored in firebase
collecting_data = False

# Create server object
app = Flask(__name__)

# displays index.html page
@app.route("/index.html")
def index():
  return render_template('index.html')

# displays about.html page
@app.route("/about.html")
def about():
  return render_template('about.html')

# displays faq.html page
@app.route("/faq.html")
def faq():
  return render_template('faq.html')

# displays stats.html
@app.route("/stats.html")
def stats():
  return render_template('stats.html')

# displays signin.html
# currently unused in favor of modal
@app.route("/signin.html")
def signin(): 
  return render_template('signin.html')

@app.route("/user_info", methods=['GET','POST'])
def user_info():
  # Make variables accessible within function scope
  global uid
  uid = request.form['uid']
  #print(uid)

  return uid

@app.route("/data_collection", methods=['GET','POST'])
def data_collection():
  global collecting_data

  collecting_data = request.form['collecting_data']

  return collecting_data

@app.route("/")
def arduino_request():
  # Make variables accessible within function scope
  global key, timeStamp, uid, collecting_data

  # Take parameters from Arduino request & assign value to variable "value"
  args = request.args
  uv = str(args['uv'])
  vis = str(args['vis'])
  ir = str(args['ir'])
  
  #print("key, value: ", key, value)  # For debugging only

  # Update FB (don't use set() - will replace values instead of listing them)
  # The values for current data set are stored under the child node with the
  # current timestamp.
  # Keys should be strings for FB.  Values can be string or numerical datatype
  if collecting_data == "true":
    path = ""
    if uid != None:
      path = str(uid) + "/" + str(timeStamp)
      #db.child(uid).child(timeStamp).update({str(key):light})
    else:
      path = "anon/" + str(timeStamp)
      #db.child("anon").child(timeStamp).update({str(key):light})
    
    db.child(path).update({str(key):uv})
    # Increment key
    key += 1 

    # Give Arduino a success response
    return "success"
  
  return "you need to turn on data collection"

@app.route('/send_data')
def parse_data(filename='././data/uno_data_sunset.txt'):
  global key, uid
  prev = 0

  f = open(filename,'r')
  date = str(datetime.now().strftime("%d-%m-%Y"))
  time = f.read().splitlines()[0][0:8]
  timeStamp = date + " " + time
  #print(timeStamp)

  uv_vals = []
  f = open(filename,'r')
  for line in f:
    line = line.rstrip()
    x = re.findall('UV: (\d+.\d+)',line)
    if len(x) > 0:
      # sometimes the UV sensor gives values of 0.44 in error; this works around that
      if x[0] != "0.44":
        prev = x[0]
        uv_vals.append(x[0])
      else:
        uv_vals.append(prev)

  #print (uv_vals)

  for val in uv_vals:
    path = ""
    if uid != None:
      path = str(uid) + "/" + str(timeStamp)
    else:
      path = "anon/" + str(timeStamp)
      
    db.child(path).update({str(key):val})
    # Increment key
    key += 1 
    #print (key, val)
    #time.sleep(0.25)
  
  return "success"

@app.route('/send_data_csv')
def parse_data_csv(filename='././data/uno_data_outside_morning_afternoon_cloudy.csv'):
  global key, uid

  df = pd.read_csv(filename)
  date = str(datetime.now().strftime("%d-%m-%Y"))
  time = df['datetime'][0][0:8]
  timeStamp = date + " " + time
  #print(timeStamp)

  path = ""
  if uid != None:
    path = str(uid) + "/" + str(timeStamp)
  else:
    path = "anon/" + str(timeStamp)
  
  for val in df['uv']:
    db.child(path).update({str(key):val})
    # Increment key
    key += 1 

    #print (key, val)
    #time.sleep(0.25)
  
  return "success"

# Run server on local IP address on port 5000 
if __name__ == "__main__":
    app.run(debug=False, host='127.0.0.1', port=5000)
    #app.run(debug=False, host='10.0.0.27', port=5000)
    #app.run(debug=False,host='192.168.73.84',port=5000)