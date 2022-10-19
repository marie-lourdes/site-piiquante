// import de l application express pour acceder à la méthode router et crée l objet router
const express = require( "express" );
//import du middleware multer
const upload = require( "./middlewares/config-upload");
// import du modèle de sauces pour les opérations CRUD sur chaque route indivuelle
const Sauce = require("../models/Sauces");
// creation de l 'objet router qui recevra les routes individuelles
const router = express.Router();

//..............................CRÉATION DES ROUTES INDIVIDUELLES DE LA ROUTE DE BASE POUR LES SAUCES..............................

// création de la route individuelle post dans l objet router et ajout du middleware upload qui gère le téléchargement des images par l u'ilisateur via le formulaire "add sauce"
router.post("/", upload, ( req, res ) => {
    // on récupère l objet body ajouté dans la requête par multer et transformé en chaine de caractère et on le reconstruis en mémoire en objet javascript avec JSON.parse
    const objtSauce = JSON.parse( req.body.sauce );
    // on supprime l id generé par le front- end car la base de donnée génère déja un id pour la sauce crée et enregistré dans la base de données
    delete objtSauce._id;
    // Par sécurité on supprime le userId dans la requête utilisateur pour ne pas enregistrer un userId qui serait pas celui de l utilisateur requérant authentifié par le middleware auth
    //Nous utliserons l 'userId que nous avons fournit dans la verification du token et de la requete utilisateur pour l 'enregistrer dans la base de donnée
    delete objtSauce.userId;

    //création d une nouvelle instance du modele Sauce et enregistrement du modèle et de ses  données structurée dans la base de données
    const sauce = new Sauce( {
        /*. on recupère et insérons dans le modèle, les données de la requete POST utilisateur,
         les données parsées de l objet body appelé sauce  qui est stocké dans objtSauce en une seule fois avec l opérateur spread "..."*/
        ...objtSauce,

        /* on enregistre la sauce avec userId qui a été authentifié et ajouté à la propriété de cette requête précisement, 
        pour plus de sécurité au niveau des requêtes signées et securise l 'accés et sécurise les opérations CRUD sur les données de la base de données de l'API*/
        userId: req.auth.userId,

        // ecriture de l 'url de l image téléchargé par l utilisateur lors de l 'ajout de l image à l 'aide des propriétés de l objet file ajouté par multer et les propriété de l 'objet request
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,

        // on initialise à zero les propriétés likes dislikes, creons des tableaux vides pour les utilisateurs qui ont aimé ou non cette sauce crée par la requete Poste
        likes: 0, 
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []

    } )

    // Enregistrement dans la base de donnée de la nouvel instance de model sauce dans la base de données MongoAtlas grace à la méthode save() de Mongoose
    sauce.save()
    .then( () => res.status( 201 ).json( {message: "Votre sauce a été ajoutée"} ) )
    .catch(error => res.status( 400 ).json( {error} ));
    // dans le bloc then nous récupérons la résultat de la promesse reussite  envoyé et modifions le status de la réponse à la requête avec le code de reussitte  http 201 created que nous envoyons au front-end avec message en json
    // catch recupère et envoit l erreur coté client avec le code http 400  au front-end généré lors de l enregistrement des données crée par l'utilisateur
});

// on exporte le module router pour le rendre accessible à l 'application dans app.js et ajouter les routes individuelles du module à la route de base dans app.js
module.exports = router;