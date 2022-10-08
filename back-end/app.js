// module app.js qui recupere le module express et execute l application ainsi que ces fonctions middleware qui traite les requête du serveur crée dans server.js
const express = require( "express" );

//on execute l application express via sa methode express() accessible grace au module express importé
const app = express();

app.use( ( req, res )=>{
    console.log("requete bien recue")
    res.send( "requête reçue" );
});

// exporte la valeur actuelle de l objet exports du module app.js pour le rendre accessible hors de ce module, notamment au fichier server.js, pour que le serveur node s execute avec express et les fonctionnalités de l application express
module.exports = app;
