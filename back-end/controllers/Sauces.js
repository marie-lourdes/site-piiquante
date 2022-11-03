// import du modèle de sauces mongoose pour les opérations CRUD avec les methodes de mongoDB sur chaque route indivuelle
const Sauce = require( "../models/Sauces" );

// import du module native de node appelé fs
const fs = require( "fs" );

// import du module  logger contenant la bibliotheque winston pour enregistrer les log
const logger = require( "../log/logger" );

//............................CREATION DES FONCTIONS SEMANTIQUES DU CONTROLLERS POUR LES OPÉRATIONS CRUD (logique metier de chaque routes individuelles dans l objet router pour les sauces) SUR LES ROUTES INDIVIDUELLES DANS ROUTES SAUCES.JS.............................

// *** fonction sémantique de la logique routing router.post("/"): ajouter une sauce 

exports.addSauce = ( req, res ) => {
    logger.info( "provenance des requêtes:" + " " + "ip" + req.ip + " " + req.auth.userId + " " + req.method +" " + req.originalUrl)
    let objtSauce = req.body.sauce;

    // on supprime les caractères spéciaux des entrées utilisateurs
     objtSauce = deleteChars( objtSauce );
    // on récupère l objet body ajouté dans la requête par multer et transformé en chaine de caractère et on le reconstruis en mémoire en objet javascript avec JSON.parse
    objtSauce = JSON.parse( objtSauce );
    // on supprime l id generé par le front- end car la base de donnée génère déja un id pour la sauce crée et enregistré dans la base de données
    delete objtSauce._id;
    // Par sécurité on supprime le userId dans la requête utilisateur pour ne pas enregistrer un userId qui serait pas celui de l utilisateur requérant authentifié par le middleware auth
    // Nous utliserons l 'userId que nous avons fournit dans la verification du token et de la requete utilisateur pour l 'enregistrer dans la base de donnée
    delete objtSauce.userId;
    
    // création d une nouvelle instance du modele Sauce et enregistrement du modèle et de ses  données structurée dans la base de données
    const sauce = new Sauce( {
        /* on recupère et insérons dans le modèle, les données de la requete POST utilisateur,
         les données parsées de l objet body appelé sauce  qui est stocké dans objtSauce en une seule fois avec l opérateur spread "..." */
        ...objtSauce,   
        /* on enregistre la sauce avec userId qui a été authentifié et ajouté à la propriété de cette requête précisement, 
        pour plus de sécurité au niveau des requêtes signées et securise l 'accés et sécurise les opérations CRUD sur les données de la base de données de l'API */
        userId: req.auth.userId,

        // ecriture de l 'url de l image téléchargé par l utilisateur lors de l 'ajout de l image à l 'aide des propriétés de l objet file ajouté par multer et les propriété de l 'objet request
        imageUrl: `${req.protocol}://${req.get( "host" )}/images/${req.file.filename}`,

        // on initialise à zero les propriétés likes dislikes, creons des tableaux vides pour les utilisateurs qui ont aimé ou non cette sauce crée par la requete Post
        usersLiked: [],
        usersDisliked: []   
    } );
 
    // Enregistrement dans la base de donnée de la nouvel instance de model sauce dans la base de données MongoAtlas grace à la méthode save() de MongoDB
    sauce.save()
    .then( () => {
        res.status( 201 ).json( { message: "Votre sauce a bien été ajoutée" } );
        console.log( "sauce ajouté", sauce );
    } )
    .catch( error => {
   
    // dans le bloc then nous récupérons le résultat de la promesse  envoyé par save() et modifions le status de la réponse à la requête avec le code de reussite  http 201 created que nous envoyons au front-end avec message en json
    // catch recupère l erreur generé par la promesse envoyé par then et envoit l erreur coté client avec le code http 400  au front-end
     // on ne montre pas tout le contenu de l erreur ni l application qui gere l erreur mais le message envoyé sans le modifier ( selon les consignes) bien qu il soit conseillé de le personnaliser selon l'OWASP
    res.status( 400 ).json( {error: error.message} )

    // logging erreurs detaillés pour chaque champs 
       logError();  
       function logError(){      
            if( error.errors.name ) console.log( "erreur title", error.errors.name.message );
            if( error.errors.manufacturer ) console.log( "erreur manufact", error.errors.manufacturer.message );
            if( error.errors.description) console.log( "erreur description", error.errors.description.message );
            if( error.errors.mainPepper ) console.log( "erreur pepper", error.errors.mainPepper.message );
            if( error.errors.heat ) console.log( "erreur heat", error.errors.heat.message );
            if( error.errors.userId ) console.log( "erreur usr", error.errors.userId.message );
            if( error.errors.imageUrl ) console.log( "erreur image ", error.errors.imageUrl.message );
            if( error.errors.likes ) console.log( "erreur like", error.errors.likes.message );
            if( error.errors.dislikes ) console.log( "erreur dislike", error.errors.dislikes.message );
            if( error.errors.usersLiked ) console.log( "erreur  user like", error.errors.usersLiked.message );
            if( error.errors.usersDisliked ) console.log( "erreur user no like", error.errors.usersDisliked.message );
            if( ! error.errors.name 
                && ! error.errors.manufacturer 
                && ! error.errors.description 
                && ! error.errors.mainPepper
                && ! error.errors.userId 
                && ! error.errors.imageUrl 
                && ! error.errors.likes
                && ! error.errors.dislikes
                && ! error.errors.usersLiked
                && ! error.errors.usersDisliked
            ){
                console.log( "une erreur inconnue s est produite" );
            }           
        }
    } );  
}

// fonction pour supprimer les caractères spéciaux des entrées utilisateurs du formulaire add-sauce et modify-sauce et éviter les injections ou XSS
function deleteChars( chars ){
    chars = chars.replace( /[`~@#$&*_|+\-=?;'<>/]/gi, '' );
    return chars;
}

// *** fonction sémantique de la logique routing router.post("/:id/like"): liker, disliker une sauce specifique ou annuler un like ou dislike 

exports.add_Remove_NoticeLike = ( req, res ) => {
    logger.info( "provenance des requêtes:" + " " + "ip" + req.ip + " " + req.auth.userId + " " + req.method + " " + req.originalUrl )

    // par sécurité on supprime l userId ajouté par le requérant qui like et on ajoute dans le tableau usersLiked le userId ajouté à la requête signé (propriété auth de la requête req.auth) dans le middleware auth.js
        delete  req.body.userId;
        Sauce.findOne( { _id: req.params.id } )
        .then( sauce => {
     
            /* -liker et disliker: Avant d'ajouter un utilisateur (userId) au tableau userLiked et usersDisliked et d' incrémenter la valeur de likes et dislikes de la sauce, 
            nous verifions que l utilisateurs requerant n est pas deja dans le tableau usersLiked ou usersDisliked de cette sauce avant de l y inscrire et enregistrer son vote
            cela permettra à l utilisateur de liker ou disliker que si il n est pas  dans le tableau correspondant et qu il n a pas encore liker ou disliker avec dans le corps de la requete like:1 pour liker ou like: -1 pour disliker */
            
            /* -annuler un like ou un dislike: Avant de retirer un utilisateur du tableau usersLiked ou usersDisliked et de desincrementer la valeur de likes ou dislikes de la sauce,
            nous verifions que l 'utilisateur requerant est bien inscrit dans le tableau correspondant avec dans le corps de la requête un like:0 pour l annulation d un like et l annulation d un dislike */
            const like = req.body.like;
            // verification de la valeur du champs like de la requête utilisateur avec switch
            switch( like ){
            // si like = 1 et que l utilisateur requérant n est pas dans le tableau usersLiked on apelle la fonction liker()
                case 1 :
                    if( ! sauce.usersLiked.includes( req.auth.userId ) ){ 
                        liker();
                    }
                break;
            // si like = -1 et que l utilisateur requérant n est pas dans le tableau usersLiked on apelle la fonction disliker()
                case -1 :
                    if( ! sauce.usersDisliked.includes( req.auth.userId ) ){
                        disliker(); 
                    }
                break;
            // si like = 0 et que l utilisateur requérant est dans le tableau usersLiked on apelle la fonction cancelLike()
            // Si l utilisateur requérant est dans le tableau usersDisliked on apelle la fonction cancelDislike()
                case 0 :
                    if( sauce.usersLiked.includes( req.auth.userId ) ){
                        cancelLike();
                    }else if( sauce.usersDisliked.includes( req.auth.userId ) ) {
                        cancelDislike();
                    }
                break;
            }
        //...........................fonctions liker, disliker, cancelLike, cancelDislike..........................................
           
            function liker(){
                // modification de la sauce trouvé par la query de comparaison passé en premier argument dans  la methode updateOne et les operateurs de mise a jour de MongoDB
                Sauce.updateOne( { _id: req.params.id }, {
                    // avec l opérateur de mise à jour $inc:on incremente de 1 le champ likes de la sauce enregistré dans la base de données lors de la requete POST de l utilisateur
                    $inc: { likes: 1 },
                    // avec l operateur de mise jour $push: on ajoute au champ usersLiked qui est un tableau la valeur de l userId du requérant
                    $push: { usersLiked: req.auth.userId }  
                } )
                .then( sauce => {
                    res.status( 201 ).json( { message: "sauce liké" } );
                    console.log( "sauce liké", sauce );
                } )
                .catch( error => res.status( 400 ).json( { error } ) );     
            }
    
            function disliker(){
               Sauce.updateOne( { _id: req.params.id }, {
                    // avec l opérateur de mise à jour $inc:on incremente de 1 le champ dislikes de la sauce enregistré dans la base de données lors de la requete POST de l utilisateur
                    $inc: { dislikes: 1 },
                    // avec l operateur de mise jour $push: on ajoute au champs usersdisLiked qui est un tableau la valeur de l userId du requérant
                    $push: { usersDisliked: req.auth.userId } 
                } )
                .then( sauce => {
                    res.status( 201 ).json( { message: "sauce disliké" } );
                    console.log( "sauce disliké", sauce ); // resultat de la promesse de la methode updateOne: true avec la query de comparaison
                } )
                .catch( error => res.status( 400 ).json( { error } ) );           
            }
    
            function cancelLike(){
                // modification de la sauce trouvé par la query de comparaison passé en premier argument dans  la methode updateOne et les operateurs de mise a jour de MongoDB
                Sauce.updateOne( { _id: req.params.id }, {
                    // avec l opérateur de mise à jour $inc:on desincremente de 1 le champ likes de la sauce enregistré dans la base de données lors de la requete POST de l utilisateur
                    $inc: { likes: -1 },
                    // avec l operateur de mise jour $pull: on retire au champ usersLiked qui est un tableau la valeur de l userId du requérant
                    $pull: { usersLiked: req.auth.userId }  
                } )
                .then( sauce => {
                    res.status( 201 ).json( { message: "la sauce n'est plus liké" } );
                    console.log( "sauce plus liké", sauce );
                } )
                .catch( error => res.status( 400 ).json( { error } ) );
            }
    
            function cancelDislike(){
                // modification de la sauce trouvé par la query de comparaison passé en premier argument dans  la methode updateOne et les operateurs de mise a jour de MongoDB
                Sauce.updateOne( { _id: req.params.id }, {
                    // avec l opérateur de mise à jour $inc:on desincremente de 1 le champ dislikes de la sauce enregistré dans la base de données lors de la requete POST de l utilisateur
                    $inc: { dislikes: -1 },
                    // avec l operateur de mise jour $push: on retire au champ usersLiked qui est un tableau la valeur de l userId du requérant
                    $pull: { usersDisliked: req.auth.userId }  
                } )
                .then( sauce => {
                    res.status( 201 ).json( { message: "la sauce n est plus disliké" } );
                    console.log( "sauce plus disliké", sauce );
                } )
                .catch( error => res.status( 400 ).json( { error } ) );
            }      
        } )
        .catch( error => res.status( 500 ).json( {error} ) );
    }
    
  // *** fonction semantique de la logique routing router.put("/:id"): modifier une sauce spécifique

  exports.modifySauce = ( req, res ) => {
    logger.info( "provenance des requêtes:" + " " + "ip" + req.ip + " " + req.auth.userId + " " + req.method + " " + req.originalUrl )
    let saucePutObjt =
     req.file ? req.body.sauce : JSON.stringify( req.body );
 
    // suppression des caractères speciaux des champs textuelles qui sont dans le body de la requete si le body n est pas envoyé avec leformat multipart/form-data soit dans l objet sauce ajouté par multer dans le body de la requête
     saucePutObjt = deleteChars( saucePutObjt ); 
    /* vérification de l objet body envoyé 
    - si il est sous forme de clé valeur par le constructeur form data et modifié par le middleware upload(multer) en deux objet dans la requête: objet body et objet file(pour le fichier)
    - si il est sous forme d'objet json sans fichier donc pas sous la forme form-data et donc non modifié par le middleware upload (multer)*/
    const sauceObjt = 
        req.file ? { ...JSON.parse( saucePutObjt ), imageUrl: `${req.protocol}://${req.get( "host" )}/images/${req.file.filename}` }
        : { ...JSON.parse( saucePutObjt ) };

    /* par securité nous supprimons l userId ajouté dans la requête par l utilisateur 
    et recupererons l userId que nous avons ajouté à la requête lors de l 'authentification de l utilisateur du middleware auth
    cela nous permettra de comparer l userId ajouté à la requête de modification ( dans le middleware auth) à l userId qui à été enregistré lors de la requête de la creation de la sauce */ 
    delete sauceObjt.userId; 
    
    // nous recherchons la sauce dans la collection de la base de données avec la query de comparaison _id dans la methode de mongoose findOne qui prend comme valeur le parametre de recherche de l url de la requete PUT front-end pour afficher la sauce modifié dans le DOM 
    // nous comparons l userId du requerant et l userId enregistré dans la ressource sauce de la collection sauces
    Sauce.findOne( { _id: req.params.id } )
    .then( sauce => {
        /* on verifie dans la resultat de promesse envoyé par findOne() et recupéré par le bloc then
         que la sauce avec l'id du parametre de recherche enregistré dans la base de donnée comporte le même userId (utlisateur) que le userId qui fait la requête de modification
         en recupérant le userId que nous avons ajouté à la requête lors de la verification du token dans le middleware auth */
        if( sauce.userId != req.auth.userId ){
            /* dans le cas ou l utilisateur qui veut modifier la sauce ne correspond a celui qui est enregistré avec la sauce, 
            cela veut dire qu il ne l'a pas crée et qu il n en est pas propriétaire
            On envoie dans la reponse à la requête de modification un code http 403 avec le message de requête non autorisée
            Celui qui a crée la sauce uniquement a le droit de modifier la sauce qu'il a crée et ajouté à l'application d'avis gastromique hot takes */
            res.status( 403 ).json( { message: "requête non autorisée, vous n'êtes pas propriétaire de cette sauce" } )
        }else{
            // si l 'utilisateur est bien le propriétaire de la sauce il peut modifier la sauce et nous tenons compte de sa requête de modification en modifiant sa sauce depuis la collection sauces de la base de données avec la methode mongoose updateOne()
            // mais d abord: dans le cas ou le fichier est aussi modifié, avant la modification de la sauce, nous recuperons le nom du fichier  dans lurl de l image de la sauce enregistré dans la base de donné pour le supprimé du dossier back-end avec le module fs qui gere les fichiers dans un programme node
            
            // si le champs de type file , que la requete comporte un objet file ajouté par le gestionnaire de telechargemnt des images (le middleware upload avec le package multer), nous supprimons d abord l image dans le dossier statique avec le module Fs et la methode unlink()
            // puis nous modifions la sauce et l imageUrl qui va requeter sur le dossier statique images du back-end dans le src de l image dans le front end
            if( req.file ){
                const fileName = sauce.imageUrl.split( "/images/" )[1];
                // la methode fs.unlink() du module fs gere les fichiers dans un programme node ici il supprime le fichier que nous avons recuperons dans l imageUrl enregistré dans la sauce à modifié dans la base de donnée 
                fs.unlink( `images/${fileName}`, ( err ) => { // le callback recupere les erreurs et arrete la fonction unlink(),et le programme qui suit (dans le cas ou il n y a pas de catch)si il y a une erreur avec le mot clé throw
                    if( err ){
                        throw err; 
                    } 
                    modifSauce();
                    console.log( 'Image et sauce modifiées !' );
                } );
            }else if( !req.file ){
            // si seuls les champs textuelles du formulaire ont été modifiés, nous remplaçons l'ancien contenu par le nouveau  sans modifier l image de cette sauce stocké dans le dossier statique du serveur back-end "images"
                modifSauce();
                console.log( 'sauce modifiée!' );
            }        
        }
        function modifSauce(){
          // on modifie la sauce en precisant l id de la sauce en premier argument ,et en second argument, le contenu du body modifié dans la variable sauceobjt(selon certaines conditions) de la requête de modification qui remplace celui d'avant et nous réindiquons l'_id de la sauce qui est celui du parametre pour s assurer de modifier celle de la page sauce où il se trouve
          Sauce.updateOne( { _id: req.params.id }, { ...sauceObjt, _id: req.params.id } )
          .then( () => res.status( 200 ).json( { message: "la sauce a bien été modifiée" } ) ) // envoie du code http 200 de la requête reussie
          .catch( error => {
            res.status( 400 ).json( { error } );
            logger.error( " erreur requete modification" );
           } ); // envoie du code htpp 400 qui signale une erreur coté client
        }
    } )
    .catch( error => res.status( 500 ).json( { error } ) ); 
    // catch va recuperer l erreur généré par la promesse envoyé du premier then et l 'envoyer dans la réponse modifié avec le status 500 erreur serveur
}

 // *** fonction semantique de la logique routing router.delete("/:id"): supprimer une sauce spécifique

 exports.deleteSauce = ( req, res ) => {
    logger.info( "provenance des requêtes:" + " " + "ip" + req.ip + " " + req.auth.userId + " " + req.method + " " + req.originalUrl )
    Sauce.findOne( { _id: req.params.id } )
    .then( sauce => {
        /* on verifie dans la resultat de promesse envoyé par findOne() et recupéré par le bloc then
         que la sauce avec l'id du parametre de recherche enregistré dans la base de donnée comporte le même userId (utlisateur) que le userId qui fait la requête de modification
         en recupérant le userId que nous avons ajouté à la requête lors de la verification du token dans le middleware auth */
        if( sauce.userId != req.auth.userId ){
            /* dans le cas ou l utilisateur qui veut supprimer la sauce ne correspond a celui qui est enregistré avec la sauce, 
            cela veut dire qu il ne l'a pas crée et qu il n en est pas propriétaire
            On envoie dans la reponse à la requête de suppression un code http 403 avec le message de requête non autorisée
            Celui qui a crée la sauce uniquement a le droit de supprimer la sauce qu'il a crée et ajouté à l'application d'avis gastromique hot takes */
            res.status( 403 ).json( { message: "requête non autorisée, vous n'êtes pas  propriétaire de cette sauce" } )
        }else{
            const fileName = sauce.imageUrl.split( "/images/" )[1];
            // la methode fs.unlink() du module fs gere les fichiers dans un programme node ici il supprime le fichier que nous avons recuperons dans l imageUrl enregistré dans la sauce à modifié dans la base de donnée 
            fs.unlink( `images/${fileName}`, ( err ) => { //le call back recupere les erreurs et arrete la fonction unlink(),et le programme qui suit (dans le cas ou il n y a pas de catch)si il y a une erreur avec le mot clé throw
                if ( err ){
                    throw err; 
                } 
                console.log( 'sauce supprimée' );
                 // on supprime la sauce en precisant l id de la sauce en premier argument  de la requête de modification, l'_id de la sauce qui est celui du parametre pour s assurer de supprimer celle de la page sauce où il se trouve
                Sauce.deleteOne( { _id: req.params.id } )
                .then( () => res.status( 200 ).json( { message: "la sauce a bien été supprimée" } ) ) // envoie du code http 200 de la requête reussie
                .catch( error => res.status( 400 ).json( { error } ) );// envoie du code htpp 400 qui signale une erreur coté client       
            } );            
        }     
    } )
    .catch( error => res.status( 500 ).json( { error } ) );// on recupere les erreurs genéré par la promesse du premier then et on envoie un erreur coté serveur, si la suppression ne se fait du à un pb avec la base de donnée ou du serveur en lui même
} 

 // *** fonction semantique de la logique routing router.get("/:id"): recuperer une sauce specifique pour que le front-end l affiche dans la page sauce

 exports.get_DisplayOneSauce = ( req, res ) => {
     // nous recherchons la sauce dans la collection de la base de données avec la query de comparaison _id dans la methode de mongoose findOne qui prend comme valeur le parametre de recherche de l url de la requete GET front-end pour afficher dans le DOM la sauce
    Sauce.findOne( { _id: req.params.id }) // nous associons l element id de l endpoint à la requête qui recupere la valeur du parametre de recherche de la requête du front end avec le même element id de l'endpoint
    .then( sauce => res.status( 200 ).json( sauce ) ) // le bloc then recupere le resultat de la promesse de findOne et envoie  dans la reponse de la requête le code http 200 et le resultat de cette promesse qui comporte la sauce avec l _id indiqué dans la methode mongoDB findOne() 
    .catch( error => res.status( 404 ).json( { error } ) );// catch recupere les erreur généré par la promesse envoyé par then et envoie le code http 404 si la ressource requêté n existe pas ou n'est pas trouvé
}

 // *** fonction semantique de la logique routing router.get("/"): recuperer  toutes les sauces pour que le front-end les affiche dans  la page all-sauces
 
  exports.get_DisplayAllSauces = ( req, res ) => {
    Sauce.find() // va chercher tous les elements dans la collection de la base de données , nous luis avons pas donnée de query de comparaison en argument
    .then( sauces => res.status( 200 ).json( sauces ) ) // avec le bloc then nous recuperons le resultat de la promesse envoyé par find() et l envoyons dans la reponse au front -end qui l affichera dans le DOM avec le code http de reussite 200 de la requête GET
    .catch( error => res.status( 404 ).json( { error } ) ); // catch recupere l erreur generé sur la promesse envoyé par then  
}


   



