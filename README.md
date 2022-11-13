# HOT TAKES

The site "HOT TAKES is a hot sauces evaluation application that allows users:
<br>
-**to register as a user**
<br>
-**to log as a user**
 <br>
-**to download their sauces**
<br>
-**to modify or delete their sauces**
<br>
-**and to like or dislike the sauces of other users.**

## INSTALLATION
This is the front end and back end server for Project 6 of the Web Developer path.
<br>
**Back end and Front end Prerequisites:** You will need to have Node and npm installed locally on your machine.
Clone this repo.

### FRONT-END
Open the folder of the repo with the terminal and run "cd front-end"

From the "front-end" folder of the project, run "npm install".<br>
You can then run the server front end with npm run start From the "front-end" folder of the project <br>
The server should run on localhost with default port 4200.

### BACK-END
Open other terminal  and run "cd back-end"
From the "back-end" folder of the project, run "npm install".
<br>
Complete the file .env in the back-end folder with values according to example without simple quote or double quote:
PORT= the default port defined of server back end with required value :3000
URI_DB= URI connection  of your database ( database MongoDB Atlas is required) with your password provided by your dataBase service
TOKEN_REQUEST= string and number as possible  very long to crypt and decrypt TOKEN for authentification request 
CLIENT_REQUEST= address referer with required value: http://localhost:4200/
Register the file .env
<br>
You can then run the server back end  with "nodemon server" or "npm run server" from the "back-end" folder of the project 







You can then run the server back end with node server. The server should run on localhost with default port 3000.
