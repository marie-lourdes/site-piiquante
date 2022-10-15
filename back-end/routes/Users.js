// import du package express pour acceder à la methode router()
const express = require( "express" );
//import des methodes du fichier Users.js de controllers
const userCtrler = require("../controllers/Users")
// On crée un objet router pour y ajouter les routes individuelles  qui seront rajouté à un route de base, une route principale
const router = express.Router()

//..................CRÉATION DES ROUTES POUR L INSCRIPTION D'UN UTILISATEUR ET LA CONNEXION D'UN UTILISATEUR DEJA INSCRIT.................

//création de la route individuelle "/signup" avec la methode du controller signup
router.post( "/signup", userCtrler.signup );

router.post( "/login", ( req, res ) => {

});

// on exporte l 'objet router pour le rendre accessible à l application dans le fichier app.js et ajouter les routes individuelles à la route de base de l application
module.exports = router;