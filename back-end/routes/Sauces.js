// import de l application express pour acceder à la méthode router et crée l objet router
const express = require( "express" );

// import du module rateLimit pour limiter les requêtes
const rateLimit = require( "../middlewares/rateLimit" );

// import du module auth pour authentifier et signer les requêtes  vers l API avec l id utilisateur
const auth = require( "../middlewares/auth" );

// import du middleware multer
const upload = require( "../middlewares/config-upload" );

// import du controller pour accéder aux methodes du controller de sauce.js
const saucesCtrler = require( "../controllers/Sauces" );

// creation de l 'objet router qui recevra les routes individuelles
const router = express.Router();

//..............................CRÉATION DES ROUTES INDIVIDUELLES DE LA ROUTE DE BASE POUR LES SAUCES..............................

// ***création de la route individuelle POST et sa fonction sémantique "addSauce" (pour la page new-sauce) dans l objet router et ajout des middleware auth et upload qui gèrent l authentification des requêtes et le téléchargement des images par l u'ilisateur via le formulaire de la page "new-sauce"
router.post( "/",rateLimit.rateLimiter, auth, upload, saucesCtrler.addSauce );

// ***création de la route individuelle POST liker sauce et sa fonction sémantique "add_Remove_NoticeLike"  (pour la page sauce : requeter avec la methode http POST et liker une sauce spécifique)dans l objet router et ajout du middleware auth et upload qui gèrent l authentification des requêtes 
router.post( "/:id/like", rateLimit.rateLimiter, auth, saucesCtrler.add_Remove_NoticeLike );

// ***création de la route individuelle PUT et sa fonction sémantique "modifySauce" (pour la page modify-sauce :  requeter avec la methode http PUT une sauce spécifique)dans l objet router et ajout du middleware auth et upload qui gèrent l authentification des requêtes et le téléchargement des images par l utilisateur via le formulaire de la page "modify-sauce"
router.put( "/:id", rateLimit.rateLimiter,auth, upload, saucesCtrler.modifySauce );

// ***création de la route individuelle DELETE et sa fonction sémantique "deleteSauce" (pour la page sauce :  requeter avec la methode http DELETE une sauce spécifique)dans l objet router et ajout du middleware auth qui gère l authentification des requêtes  
router.delete( "/:id", rateLimit.rateLimiter, auth, saucesCtrler.deleteSauce );

// ***création de la route individuelle GET et sa fonction "get_DisplayOneSauce" (pour la page sauce :  requeter une sauce spécifique et  envoyer les données au front-end)dans l objet router et ajout du middleware auth qui gère l authentification des requêtes
// nous ajoutons un endpoint avec l element id rendu accessible de manière dynamique en tant que parametre de recherche dans la requête grace au ":"
router.get( "/:id", rateLimit.rateLimiter, auth, saucesCtrler.get_DisplayOneSauce );

// ***création de la route individuelle GET et sa fonction "get_DisplayAllSauces" (pour la page all sauce: requêter toutes les sauces  et  envoyer les données de toutes les sauces au front-end)dans l objet router et ajout du middleware auth qui gère l authentification des requêtes
router.get( "/", rateLimit.rateLimiter, auth, saucesCtrler.get_DisplayAllSauces );

// on exporte le module router pour le rendre accessible à l 'application dans app.js et ajouter les routes individuelles du module à la route de base dans app.js
module.exports = router;