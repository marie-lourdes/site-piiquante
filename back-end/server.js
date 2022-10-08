// création du serveur avec le module http et  le module app.js qui exécute l ' application express
const http = require( "http" );
const app = require( "./app" );
/*recupération du module dotenv pour charger la variable d'environnement PORT defini dans le fichier .env
pour eviter les changements d adresse ip et de port, le port ne prendra pas la valeur du port par defaut du systeme d exploitation qui est aleatoire et qui peut changer,
 on a redefini cette valeur par defaut de cette variable d environnemnt PORT du systeme d exploitation window en la specifiant et en chargeant cette variable d environnement avec dotenv */
const dotenv = require("dotenv");
dotenv.config();
// redefinition du port par defaut du systeme d exploitation
const MY_PORT = process.env.PORT;


//creation du serveur avec le module http et en appelant les fonctions et methodes du module apps.js
const server = http.createServer(app);
//le serveur attend les requete sur ce port et ecoute sur port, requete qui sera traité par l aplication express qui est appélé dans le module app.js
server.listen(MY_PORT);