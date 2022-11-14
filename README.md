# HOT TAKES

The site "HOT TAKES" (of Piiquante enterprise) is a hot sauces evaluation application that allows users:
<br>
- **to register as a user**<br>
- **to log as a user**<br>
- **to download their sauces**<br>
- **to modify or delete their sauces**<br>
- **and to like or dislike the sauces of other users.**

## INSTALLATION

This is the front end and back end server for Project 6 of the Web Developer path.
<br>
**Back end and Front end Prerequisites:** You will need to have Node and npm installed locally on your machine.
Clone this repo.

### FRONT-END

-Open the folder of the repo, add a terminal and run "cd front-end"
<br>
-From the "front-end" folder of the project, run "npm install".
<br>
-You can then run the server front end with "npm run start" from the "front-end" folder of the project
<br>
The server should run on localhost with default port 4200.

### BACK-END

-Open other terminal in the same folder repo and run "cd back-end", now you should have two terminals opened in the folder project
<br>
-From the "back-end" folder of the project, run "npm install".
<br>
-Complete the environment variables of the file .env.example  with values, according to example, without simple quote or double quote:
<br><br>

*PORT= the default port defined of server back end with required value :3000*
<br>
*URI_DB= URI connection  of your database ( database MongoDB Atlas is required ) with username and your password provided by your dataBase service*
<br>
*TOKEN_REQUEST= value with specials characters, string and number, very long as possible  for encryption/decryption token authentification request* 
<br>
*CLIENT_REQUEST= address referrer with required value: http://localhost:4200/*
<br><br>

-Create a file .env
<br>
-Copy and paste the content of the example completed in the file .env 
<br>
-Register the file and delete the file .env.example
<br>
-You can then run the server back end  with "nodemon server" or "npm run server" from the "back-end" folder of the project 
<br>
The server should run on localhost with default port 3000.

Readme.md on the site https://marie-lourdes.github.io/site-piiquante/



