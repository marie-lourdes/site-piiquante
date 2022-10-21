// import de l application express pour acceder à la méthode router et crée l objet router
const express = require( "express" );
//import du module auth pour authentifier et signer les requêtes  vers l API avec l id utilisateur
const auth = require("../middlewares/auth");
//import du middleware multer
const upload = require( "../middlewares/config-upload");
const { findOne } = require("../models/Sauces");
// import du modèle de sauces pour les opérations CRUD sur chaque route indivuelle
const Sauce = require("../models/Sauces");
//import du module native de node appelé fs
const fs = require( "fs" )
// creation de l 'objet router qui recevra les routes individuelles
const router = express.Router();

//..............................CRÉATION DES ROUTES INDIVIDUELLES DE LA ROUTE DE BASE POUR LES SAUCES..............................

// ***création de la route individuelle POST dans l objet router et ajout des middleware auth et upload qui gèrent l authentification des requêtes et le téléchargement des images par l u'ilisateur via le formulaire de la page "new-sauce"
router.post( "/", auth, upload, ( req, res ) => {
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
        imageUrl: `${req.protocol}://${req.get( "host" )}/images/${req.file.filename}`,

        // on initialise à zero les propriétés likes dislikes, creons des tableaux vides pour les utilisateurs qui ont aimé ou non cette sauce crée par la requete Poste
        likes: 0, 
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []

    } );

    // Enregistrement dans la base de donnée de la nouvel instance de model sauce dans la base de données MongoAtlas grace à la méthode save() de Mongoose
    sauce.save()
    .then( () => {
        res.status( 201 ).json( {message: "Votre sauce a bien été ajoutée"} );
    } )
    .catch( error => {
         res.status( 400 ).json( {error} ); 
    } );
    // dans le bloc then nous récupérons le résultat de la promesse  envoyé par save() et modifions le status de la réponse à la requête avec le code de reussite  http 201 created que nous envoyons au front-end avec message en json
    // catch recupère l erreur generé par la promesse envoyé par then et envoit l erreur coté client avec le code http 400  au front-end
} );

// ***création de la route individuelle POST (pour la page sauce : pour requeter avec la methode http POST et liker une sauce spécifique)dans l objet router et ajout du middleware auth et upload qui gèrent l authentification des requêtes 
router.post("/:id/like", auth, (req, res) => {
    res.status(201).send(" liké")

});

// ***création de la route individuelle PUT (pour la page modify-sauce : pour requeter avec la methode http PUT une sauce spécifique)dans l objet router et ajout du middleware auth et upload qui gèrent l authentification des requêtes et le téléchargement des images par l utilisateur via le formulaire de la page "modify-sauce"
router.put( "/:id", auth, upload, ( req, res ) => {
    /* vérification de l objet body envoyé 
    - si il est sous forme de clé valeur par le constructeur form data et modifié par le middleware upload(multer) en deux objet dans la requête: objet body et  objet file(pour le fichier)
    - si il est sous forme d'objet json sans fichier donc pas sous la forme form-data et donc non modifié par le middleware upload (multer)*/
    const sauceObjt = 
        req.file ? { ...JSON.parse( req.body.sauce ), imageUrl: `${req.protocol}://${req.get( "host" )}/images/${req.file.filename}`}
        : {...req.body};

    /* par securité nous supprimons l userId ajouté dans la requête par l utilisateur 
    et recupererons l userId que nous avons ajouté à la requête lors de l 'authentification de l utilisateur du middleware auth
    cela nous permettra de comparer l userId ajouté à la requête de modification ( dans le middleware auth) à l userId qui à été enregistré lors de la requête de la creation de la sauce */ 
    delete sauceObjt.userId; 
    
    // nous recherchons la sauce dans la collection de la base de données avec la query de comparaison _id dans la methode de mongoose findOne qui prend comme valeur le parametre de recherche de l url de la requete PUT front-end pour afficher la sauce modifié dans le DOM 
    //nous comparons l userId du requerant et l userId enregistré dans la ressource sauce de la collection sauces
    Sauce.findOne( {_id: req.params.id} )
    .then( sauce => {
        /*on verifie dans la resultat de promesse envoyé par findOne() et recupéré par le bloc then
         que la sauce avec l'id du parametre de recherche enregistré dans la base de donnée comporte le même userId (utlisateur) que le userId qui fait la requête de modification
         en recupérant le userId que nous avons ajouté à la requête lors de la verification du token dans le middleware auth*/
        if( sauce.userId != req.auth.userId ){
            /* dans le cas ou l utilisateur qui veut modifier la sauce ne correspond a celui qui est enregistré avec la sauce, 
            cela veut dire qu il ne l'a pas crée et qu il n en est pas propriétaire
            On envoie dans la reponse à la requête de modification un code http 403 avec le message de requête non autorisée
            Celui qui a crée la sauce uniquement a le droit de modifier la sauce qu'il a crée et ajouté à l'application d'avis gastromique hot takes*/
            res.status( 403 ).json( {message: "requête non autorisée, vous n'êtes pas  propriétaire de cette sauce"} )
        }else{
            // si l 'utilisateur est bien le propriétaire de la sauce il peut modifier la sauce et nous tenons compte de sa requête de modification en modifiant sa sauce depuis la collection sauces de la base de données avec la methode mongoose updateOne()
            function modifSauce(){
                  // on modifie la sauce en precisant l id de la sauce en premier argument ,et en second argument, le contenu du body modifié dans la variable sauceobjt(selon certaines conditions) de la requête de modification qui remplace celui d'avant et nous réindiquons l'_id de la sauce qui est celui du parametre pour s assurer de modifier celle de la page sauce où il se trouve
                Sauce.updateOne( {_id: req.params.id}, {...sauceObjt, _id: req.params.id} )
                .then( () => res.status( 200 ).json( {message: "la sauce a bien été modifiée"} ) )// envoie du code http 200 de la requête reussie
                .catch( error => res.status( 401 ).json( {error} ) );// envoie du code htpp 401 qui signale que l 'acces est non autorisé
               
            }
            // mais d abord: dans le cas ou le fichier est aussi modifié, avant la modification de la sauce, nous recuperons le nom du fichier  dans lurl de l image de la sauce enregistré dans la base de donné pour le supprimé du dossier back-end avec le module fs qui gere les fichiers dans un programme node
            // si le champs de type file , que la requete comporte un objet file ajouter par le gestionnaire de telechargemnt des images (le middleware upload avec le package multer), nous supprimons d abord l image dans le dossier statique avec le module Fs et la methode unlink()
            //puis nous modifions la sauce et l imageUrl qui va requeter sur le dossier staique images du back-end dans le src de l image dans le front end
            if( req.file ){
                const fileName = sauce.imageUrl.split( "/images/" )[1];
                // la methode fs.unlink() du module fs gere les fichiers dans un programme node ici il supprime le fichier que nous avons recuperons dans l imageUrl enregistré dans la sauce à modifié dans la base de donnée 
                fs.unlink( `images/${fileName}`, ( err ) => { //le call back recupere les erreurs et arrete la fonction unlink(),et le programme qui suit (dans le cas ou il n y a pas de catch)si il y a une erreur avec le mot clé throw
                    if ( err ){
                        throw err; 
                    } 
                    console.log( 'Image modifié !' );
                  
                    modifSauce();
                });
            }else if( !req.file ){
                            //si seuls les champs textuelles du formulaire ont été modifiés, nous remplaçons l'ancien contenu par le nouveau  sans modifier l image de cette sauce stocké dans le dossier statique du serveur back-end "images"
                modifSauce();
            }        
        }
    })
    .catch( error => res.status( 500 ).json( {error} ) ); 
    //catch va recuperer l erreur généré par la promesse envoyé du premier then et l 'envoyer dans la réponse modifié avec le status 500 erreur serveur
});

// ***création de la route individuelle DELETE (pour la page sauce : pour requeter avec la methode http DELETE une sauce spécifique)dans l objet router et ajout du middleware auth qui gère l authentification des requêtes  
router.delete( "/:id", auth, ( req, res ) => {
    Sauce.findOne( {_id: req.params.id} )
    .then( sauce => {
        /*on verifie dans la resultat de promesse envoyé par findOne() et recupéré par le bloc then
         que la sauce avec l'id du parametre de recherche enregistré dans la base de donnée comporte le même userId (utlisateur) que le userId qui fait la requête de modification
         en recupérant le userId que nous avons ajouté à la requête lors de la verification du token dans le middleware auth*/
        if( sauce.userId != req.auth.userId ){
            /* dans le cas ou l utilisateur qui veut supprimer la sauce ne correspond a celui qui est enregistré avec la sauce, 
            cela veut dire qu il ne l'a pas crée et qu il n en est pas propriétaire
            On envoie dans la reponse à la requête de suppression un code http 403 avec le message de requête non autorisée
            Celui qui a crée la sauce uniquement a le droit de supprimer la sauce qu'il a crée et ajouté à l'application d'avis gastromique hot takes*/
            res.status( 403 ).json( {message: "requête non autorisée, vous n'êtes pas  propriétaire de cette sauce"} )
        }else{
            const fileName = sauce.imageUrl.split( "/images/" )[1];
            // la methode fs.unlink() du module fs gere les fichiers dans un programme node ici il supprime le fichier que nous avons recuperons dans l imageUrl enregistré dans la sauce à modifié dans la base de donnée 
            fs.unlink( `images/${fileName}`, ( err ) => { //le call back recupere les erreurs et arrete la fonction unlink(),et le programme qui suit (dans le cas ou il n y a pas de catch)si il y a une erreur avec le mot clé throw
                if ( err ){
                    throw err; 
                } 
                console.log( 'sauce supprimée' );
                 // on supprime la sauce en precisant l id de la sauce en premier argument  de la requête de modification, l'_id de la sauce qui est celui du parametre pour s assurer de supprimer celle de la page sauce où il se trouve
                Sauce.deleteOne( {_id: req.params.id} )
                .then( () => res.status( 200 ).json( {message: "la sauce a bien été supprimée"} ) )// envoie du code http 200 de la requête reussie
                .catch( error => res.status( 401 ).json( {error} ) );// envoie du code htpp 401 qui signale que l 'acces est non autorisé         
            });            
        }     
    })
    .catch( error => res.status( 500 ).json( {error} ) );// on recupere les erreurs genéré par la promesse du premier then et on envoie un erreur coté serveur, si la suppression ne se fait du à un pb avec la base de donnée ou du serveur en lui même
});

// ***création de la route individuelle GET (pour la page sauce : pour requeter une sauce spécifique)dans l objet router et ajout du middleware auth qui gère l authentification des requêtes

//nous ajoutons un endpoint avec l element id rendu accessible de manière dynamique en tant que parametre de recherche dans la requête grace au ":"
router.get( "/:id", auth, ( req, res ) => {
    // nous recherchons la sauce dans la collection de la base de données avec la query de comparaison _id dans la methode de mongoose findOne qui prend comme valeur le parametre de recherche de l url de la requete GET front-end pour afficher dans le DOM la sauce
    Sauce.findOne( {_id: req.params.id})// nous associons l element id de l endpoint à la requête qui recupere la valeur du parametre de recherche de la requête du front end avec le même element id de l'endpoint
    .then(sauce => res.status( 200 ).json( sauce ) )//le bloc then recupere le resultat de la promesse de findOne et envoie  dans la reponse de la requête le code http 200 et le resultat de cette promesse qui comporte la sauce avec l _id indiqué dans la methode mongoose findOne() 
    .catch( error => res.status( 404 ).json( {error} ) );// catch recupere les erreur généré par la promesse envoyé par then et envoie le code http 404 si la ressource requêté n existe pas ou n'est pas trouvé
} );

// ***création de la route individuelle GET (pour la page all sauce)dans l objet router et ajout du middleware auth qui gère l authentification des requêtes
router.get( "/", auth, ( req, res ) => {
    Sauce.find()// va chercher tous les elements dans la collection de la base de données , nous luis avons pas donnée de query de comparaison en argument
    .then( sauces => res.status( 200 ).json( sauces ) )// avec le bloc then nous recuperons le resultat de la promesse envoyé par find() et l envoyons dans la reponse au front -end qui l affichera dans le DOM avec le code http de reussite 200 de la requête GET
    .catch( error => res.status( 400 ).json( {error} ) );// catch recupere l erreur generé sur la promesse envoyé par then  
} );



// on exporte le module router pour le rendre accessible à l 'application dans app.js et ajouter les routes individuelles du module à la route de base dans app.js
module.exports = router;