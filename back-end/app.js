// import du package dotenv pour charger les variables d 'environnement crée dans le fichier .env
const dotenv = require( "dotenv" );
dotenv.config();

// récupération de la variable d environnement pour la connexion à la base de donnée
const DB = process.env.URI_DB;
//..........................CREATION DE L APPLICATION EXPRESS AVEC LES  MODULES ET PACKAGES NÉCESSAIRES A L'APPLICATION......................

// module app.js qui recupere le module express et execute l application ainsi que ces fonctions middleware qui traite les requête du serveur crée dans server.js
const express = require( "express" );

const rateLimit = require( "./middlewares/rateLimit" );

// import du module helmet
const helmet = require( "helmet" );



// import du package path pour normaliser le chemin d'acces au dossier images du serveur back end
const path = require( "path" );

// import du module router users  pour acceder aux routes individuelles  du parcours utlisateur
const routerUsers = require( "./routes/Users" );

// import du module router sauces  pour acceder aux routes individuelles  du parcours des sauces
const routerSauces = require( "./routes/Sauces" );

//on execute l application express via sa methode express() accessible grace au module express importé
const app = express();


//...........................CREATION DE LA CONNEXION DE L'APPLICATION EXPRESS AVEC LA BASE DE DONNEES MONGOBD ATLAS AVEC LE MODULE MONGOOSE..........................

// import du module mongoose
const mongoose = require( "mongoose" );
const logger = require("./log/logger");

// creation de la connexion avec authentification de l'application  express avec la base de données MongoDB Atlas
// base de données securisé par les données de connexion caché dans un fichier, données utilisateur sécurisé et base de données sécurisé
mongoose.connect( DB, {useNewUrlParser: true, useUnifiedTopology: true} )
.then( () => logger.info( 'Connexion à MongoDB réussie !' ) )
.catch( () => logger.error( 'Error: Connexion à MongoDB échouée !' ) );



//..........................CONFIGURATION GÉNÉRALE POUR LES RESSOURCES IMAGES TELECHARGÉES PAR L UTILISATEUR ET SAUVEGARDÉ PAR MULTER:création de la route pour les images téléchargés par les utilisateurs dont les ressources images seront traitées de manière statique.................
//cette route est placé avant les middlewares helmet, ces derniers contiennent  des restrictions x-frame-options et empechant les requêtes imagesUrl, 
app.use( "/images", express.static( path.join( __dirname, "images" ) ) );

// ............................SECURISATION GENERALE DES REQUETES HTTP CONTRE LES ATTAQUES CSRF - CONNEXION SECURISÉE AU SERVEUR - SECURISATION CONTRE LES INJECTIONS ET XSS.............................

app.use( helmet() );

//........................CONFIGURATION GENERALE DES REQUETES ENTRANTES ET DE L'OBJET REQUEST DONT LE BODY EST INDIQUÉ  AU FORMAT JSON DANS LE HEADER DE LA REQUETE...................

// ajout d un middleware integrée a express qui va recuperer toutes les requêtes entrante (objet request) dont le body est en content-type: application json
// ce middleware ne doit etre placer dans le tunnel gestionnaire des middleware avec le chainage de next(), 
// ce middleware traite et analyse  l'objet request des requete entrante en json avec la methode express.json() et le transformer en objet javascript pour le rendre exploitable
app.use( express.json() );

// .........................CONFIGURATION GENERALE DES HEADERS RESPONSE ET DE L'ACCES AUX RESSOURCES DE L API POUR TOUS  DE REQUETES DU FRONT END VERS L API..........................

// configuration generale CORS de la reponse retourné (objet response) suite à une requete du front end avec la modification de la securite d acces au ressource de CORS
// en ajoutant des headers à l objet response pour tout type de requete et sur toutes les routes

corsConfiguration();

function corsConfiguration (){
  app.use( ( req, res, next ) => {
    res.setHeader( 'Access-Control-Allow-Origin', '*' );
    res.setHeader( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization' );
    res.setHeader( 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS' );
    next();// passe l execution du serveur au middleware suivant  qui traite l'envoie de l'objet reponse des requêtes sur tout type de verbe http
  });

}


// ............................................CREATION DES ROUTES DE BASE POUR TOUS LES VERBES HTPP AU NIVEAU DE L APPLICATION............................


// création de la route principale pour l authentification des utilisateurS au niveau de l'application et ajout des routes individuelles signup et login (dans l'objet "routerUsers") a la route principale "/api/auth"
app.use( "/api/auth", routerUsers );

//création de la route de base pour les sauces
app.use( "/api/sauces", routerSauces );



// exporte la valeur actuelle de l objet exports du module app.js pour le rendre accessible hors de ce module, notamment au fichier server.js, pour que le serveur node s execute avec express et les fonctionnalités de l application express
module.exports = app;
