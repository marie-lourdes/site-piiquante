//..........................CREATION DE L APPLICATION EXPRESS......................

// module app.js qui recupere le module express et execute l application ainsi que ces fonctions middleware qui traite les requête du serveur crée dans server.js
const express = require( "express" );

//on execute l application express via sa methode express() accessible grace au module express importé
const app = express();
//........................CONFIGURATION GENERALE DES REQUETES ENTRANTES ET DE L'OBJET REQUEST DONT LE BODY EST INDIQUÉ  AU FORMAT JSON DANS LE HEADER DE LA REQUETE...................

// ajout d un middleware integrée a express qui va recuperer toutes les requêtes entrante (objet request) dont le body est en content-type: application json
// ce middleware ne doit etre placer dans le tunnel gestionnaire des middleware avec le chainage de next(), 
// ce middleware traite et analyse  l'objet request des requete entrante en json avec la methode express.json()
app.use(express.json());

// .........................CONFIGURATION GENERALE DES HEADERS RESPONSE ET DE L'ACCES AUX RESSOURCES DE L API POUR TOUS  DE REQUETES DU FRONT END VERS L API..........................

// configuration generale CORS de la reponse retourné (objet response) suite à une requete du front end avec la modification de la securite d acces au ressource de CORS
// en ajoutant des headers à l objet response pour tout type de requete et sur toutes les routes
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use( ( req, res )=>{
    console.log("requete bien recue")
    res.send( "requête reçue" );
});

// exporte la valeur actuelle de l objet exports du module app.js pour le rendre accessible hors de ce module, notamment au fichier server.js, pour que le serveur node s execute avec express et les fonctionnalités de l application express
module.exports = app;
