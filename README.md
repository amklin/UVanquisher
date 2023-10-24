# UVanquisher

## Overview 

This is a project created as part of a joint project between the Computer Science and Software Engineering course and Biomedical Engineering course at High Technology High School (Junior Year). This a copy of a project from https://github.com/CSE-HighTechHighSchool/2122_Sensor1 (private repository). Screenshots of the website and documentation of the project can be found in [screenshots.pdf](https://github.com/amklin/UVanquisher/blob/589b9a3e8e527eb1dbb60a12e465a0a65be5271b/screenshots.pdf). 

## Project Description

During this interdisciplinary project, groups were tasked with designing, building, and testing a wearable sensor that will monitor a biological factor and warn about any possible associated health condition. Our group built a UV sensor using Arduino components and an associated website that displays the data (both past and real-time data) and alerts the user if they experience more than a certain threshold of sunlight. The data was stored on Google Firebase, and a Python Flask server was used to interface between the database and the website, as well as receive API requests from the Arduino and send the data from the Arduino to the database. 

## Languages / Technologies

* HTML / CSS
* JavaScript
* Python (Flask server)
* Arduino
* Google Firebase

## How to Run 

After downloading the project and installing the required Python libraries, which are listed in [requirements.txt], the website can be viewed by running the [flask/app.py](https://github.com/amklin/UVanquisher/blob/589b9a3e8e527eb1dbb60a12e465a0a65be5271b/flask/app.py) file and starting the Flask server. The data recording feature would require an Arduino, UV sensor, and their associated components; the code for these components is in the [arduinoCode](https://github.com/amklin/UVanquisher/tree/589b9a3e8e527eb1dbb60a12e465a0a65be5271b/arduinoCode) folder. These functionalities can still be observed by viewing the screenshots on [screenshots.pdf](https://github.com/amklin/UVanquisher/blob/589b9a3e8e527eb1dbb60a12e465a0a65be5271b/screenshots.pdf).

## Contributors 

This was a collaboration of a group of four high school students: Jerry Chen, Jue Gong, Amanda Lin, and Gregory Lin. We worked together to brainstorm and build the prototype, with Jue and Amanda focusing on the technical aspects, including designing and creating the website content and coding the Arduino.