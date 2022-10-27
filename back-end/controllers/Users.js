// import du module modèle Users pour accéder aux methodes de l 'objet model de mongoose
const User = require("../models/Users" )
// import du package bcrypt pour crypter le mot de passe crée de l utilisateur lors de son inscription dans la fonction controllers signup
const bcrypt = require( "bcrypt" );
//import du package jsonwebtoken pour crypter le token dans la reponse envoyé sur la route "/login"
const jwt = require( "jsonwebtoken" );
// import du package dotenv pour charger les variables d 'environnement crée dans le fichier .env
const dotenv = require( "dotenv" );
dotenv.config();
// Sécurisation de l algorithme de cryptage du token separé du code de l application
const TOKEN = process.env.TOKEN_REQUEST;

//............................CREATION DES FONCTIONS SEMANTIQUES DU CONTROLLERS POUR L INSCRIPTION ET LA CONNEXION DE L UTILISATEUR.............................

// fonction controller pour l'inscription d un utilisateur
 exports.signUp = ( req, res ) => {
    // recuperation du mot de passe de la requête utilisateur lors de son inscription via le formulaire qu 'on encode avec le package bcrypt avant d'enregister le mot de passe dans le modèle User et la collection renommée "users" de MongoDB Atlas
    bcrypt.hash( req.body.password, 10 )
    .then( hash => {
    // on recupère le resultat de la promesse de la méthode hash() qui est le mot de passe crypté pour l enregistrer dans l instance du modèle User
    // creation de l instance du modèle User et on apelle avec "new" le constructeur model() du module Users.js contenu dans la variable User ci dessus
        const user = new User({
        //le modèle copie la structure de donnée de userShema avec les données insérées ci dessous à l intérieur du modèle
            email: req.body.email, // recupération de l 'email crée et saisi dans le formulaire
            password: hash
        });
       
        // enregistrement de la nouvelle instance de modèle "user" dans la base de données intégrant les données structurées avec les valeurs
        user.save()
        .then( () => res.status( 201 ).json( { message: "compte utilisateur crée"} ) )//save() envoit une promesse si elle est resolu , sur  ce resultat  then envoie au front-end la reponse à la requête Post sur l 'endpoint de l 'API("/signup") avec un statut 201 pour la création du compte reussi avec un message en ojjet
        .catch( error => res.status( 400 ).json( {error} ) );// catch() récupère les erreurs généres par la méthode save(): l'enregistrement du model et indique une erreur de requête avec le code http 400  
        console.log("test prévalidation de l email unique enregistré dans la base de donnée uniquement si l'email est unique:",user)
      
      } )
    .catch( error => res.status( 500 ).json( {error} ) );// nous indiquons une erreur serveur avec le code http 500 car c'est une erreur qui peut être généré par le cryptage de l 'api du mot de passe
};

// fonction controller pour la connexion et la verification des identifiant de connexion

let userRequestMail = 0;
                  
console.log("userrequest",userRequestMail)

let userRequestPassword= 0;
console.log("userrequestPassword",userRequestPassword)



exports.login = ( req, res ) => {
 
    /*function limitConnexion(userRequestError){
        
      switch(userRequestError < 3){
        case  true :
      res.status( 401 ).json( {message: "adresse e-mail/mot de passe incorrecte"} ); 
      break;
        
        case false:
        console.log( "force brute ou oublie de l utilisateur" )
        const erreur = "une erreur s'est produite:essayez ulterieurement";
        throw erreur

      }

    }*/
 
    // recherche de l utilisateur enregistré dans la collection users de la base de donnée avec l 'email qui contient l email entré dans le formulaire de connexion par l 'utilisateur qui se connecte
    User.findOne( {email: req.body.email} )
    .then( user => { //recuperation de l utilisateur ayant l email avec la valeur entré par l utilisateur lors de la requête

        if( !user ){ // verification du resultat  envoyé  dans la promesse de findOne() si la valeur vaut false , c'est qu il n y a aucune correspondance avec un utilisateur enregistré dans la base de donné ayant l email entré lors de la requete POST du front-end lors de la validation du formulaire de connexion
         
          userRequestMail++;
          console.log("userrequest compteur", userRequestMail )
          /* limitConnexion(userRequestMail);*/
       
          
          
          if( userRequestMail < 3 ){  
            return res.status( 401 ).json( {message: "adresse e-mail/mot de passe incorrecte"} ) 
            // nous indiquons ci-dessus, dans la reponse à la requête, le code http 401 qui correspond à un accès non-autorisé
            // nous précisons pas que l 'erreur vient de l 'email qui n est attribué à aucun utilisateur dans la base de données pour éviter qu'une personne cherche si un utilisateur est inscrit
          
            }else if( userRequestMail >= 3){
            console.log( "force brute ou oublie de l utilisateur" )
            // process.exit()
            const erreur = "une erreur s'est produite:essayez ulterieurement"
            // code erreur 500(pas 400 en cas de fbrute car ce n est pas une vrai erreur de requete client ) affiché quand le dernier catch recupere l erreur dans la levé d execption throw et le nom de l exception  pour les attaquants
            
            throw erreur;
            
            }
        
        }
      
       // après verification ci dessus de l'utilisateur avec son email et si l utilisateur existe avec l email indique dans le corps de la requête POST du formulaire de connexion
       // on verifie le mot de passe saisi par l utilisateur dans le formulaire avec la methode de vérification et de comparaison du package bcrypt
       // si le mot de passe saisi par l utilisateur  haché par bcrypt a un hash qui resulte de la meme chaine de caractere qui à crée le hash du mot de  passe de l utilisateur enregistré dans la base de donnée,la methode compare renvoit true dans le cas contraire false
        bcrypt.compare( req.body.password, user.password )
        .then( valid => {
          // on recupere le resultat de la methode compare(), si c'est false , le bloc then execute le code suivant dans la structure conditionnelle
          if( !valid ){
            userRequestPassword++;
            console.log("userrequestpassword compteur", userRequestPassword )
           // limitConnexion(userRequestPassword);

           if( userRequestPassword < 3 ){  
            return res.status( 401 ).json( {message: "adresse e-mail/mot de passe incorrecte"} ) 
            // nous indiquons ci-dessus, dans la reponse à la requête, le code http 401 qui correspond à un accès non-autorisé
            // nous précisons pas que l 'erreur vient de l 'email qui n est attribué à aucun utilisateur dans la base de données pour éviter qu'une personne cherche si un utilisateur est inscrit
           
            }else if( userRequestPassword >= 3){
             console.log( "force brute ou oublie de l utilisateur" )
            // process.exit()
             const erreur = "une erreur s'est produite:essayez ulterieurement bis"
             // code erreur 500(pas 400 en cas de fbrute car ce n est pas une vrai erreur de requete client ) affiché quand le dernier catch recupere l erreur dans la levé d execption throw et le nom de l exception  pour les attaquants
            
             throw erreur;
             
            }


            /*return res.status( 401 ).json( {message: "adresse e-mail/mot de passe incorrecte"} )*/
            // envoie de la reponse avec le code http 401 erreur coté client, l 'accès n est pas autorisé
            // nous précisons pas que l 'erreur vient du mot de passe , qui ne correspond pas à l'utilisateur avec l'email indiqué dans la requête de l utilisateur et trouvé  dans la base de données pour éviter qu'une personne cherche si un utilisateur est inscrit
          }
          // si le mot de passe est valid nous envoyons dans la reponse de la requête l'id de l utilisateur et un token crypté pour les opération CRUD qu'il souhaite faire sur les ressources de l'api
          res.status( 200 ).json( {
            userId: user._id,
            token:jwt.sign( 
              // on s 'assure de crypter avec sign() le token de l utilisateur avec l'id  de l utilisateur qui a été recherché et verifié avec l email et le mot entré par l'utilisateur via la requête Post du formaulaire de connexion
              {userId: user._id },
              TOKEN,// algorithme de cryptage du "token" ("chaine secrète de développement temporaire" ) securisé dans un fichier isole du code de l application
              {expiresIn: "1h"}
            )          
          } ); 
        
        } )
        .catch( error =>{
          res.status( 500 ).json( {error} ) ;
          throw error

        });
        // catch recupère l erreur generé par la verification du package bcrypt et envoit le code 500 erreur cote serveur lors de la verification du mot de passe
    })
    .catch( error => {
      res.status( 500 ).json( {error} ) 
      throw error;
    
    });
  
 
    //catch recupere l erreur genéré par la methode findOne() de mongoose quand le serveur(plus précisement l'api qui gere les requetes serveur) ne trouvera pas l'utilisateur dans la base de données 
};

//...............................TEST REDEMERRAGE PROCESS.............................
/*function exitHandler(options, exitCode) {
    if (options.cleanup) console.log('clean');
    if (exitCode || exitCode === 0) console.log(exitCode);
   // if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
/*


//................................................................................
const { spawn } = require('child_process');

function main() {
  if (process.env.process_restarting) {
    delete process.env.process_restarting;
    // Give old process one second to shut down before continuing ...
    setTimeout(main, 1000);
    return;
  }

  // ...

  // Restart process ...
  spawn(process.argv[0], process.argv.slice(1), {
    env: { process_restarting: 1 },
    stdio: 'ignore',
  }).unref();
}
main();*/
