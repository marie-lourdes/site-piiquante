//...................................CREATION DU SERVEUR NODE AVEC EXPRESS......................................

// création du serveur avec le module http et  le module app.js qui exécute l ' application express, il n'est pas possible d implémenter le protocol https car est incompatible avec le portocol de localhost.
const http = require( "http" );
const app = require( "./app" );

/*recupération du module dotenv pour charger la variable d'environnement PORT defini dans le fichier .env
pour eviter les changements d adresse ip et de port, le port ne prendra pas la valeur du port par defaut du systeme d exploitation qui est aleatoire et qui peut changer,
 on a redefini cette valeur par defaut de cette variable d environnemnt PORT du systeme d exploitation window en la specifiant et en chargeant cette variable d environnement avec dotenv */
 const dotenv = require( "dotenv" );
 dotenv.config();
// redefinition du port par defaut du systeme d exploitation recupéré dans la variable MY_PORT
const MY_PORT = process.env.PORT;
//..........................................LOGGING SERVEUR.....................................................

const logger = require("./log/logger");
// .................................GESTION DES ERREURS SERVEUR...............................................

//gestion des erreurs du serveur et des appels du systeme avec la fonction errorHandler

const errorHandler = error => {
    if ( error.syscall !== 'listen' ) {// les erreurs de sytems ont des nom, systemcall renvoit une chaine de caractere avec le nom de l erreur de l appel du system
      logger.info( "Error: erreur systeme")
      throw error; //stoppe le programme et fournit la valeur de l exception  stocker ds "error" 
    }
   
    /*  Lorsqu'une socket est créée avec socket(point de terminaison) , elle existe sous un nom
         espace (famille d'adresses) mais n'a pas d'adresse qui lui soit assignée.  bind ()
         attribue l'adresse spécifiée par addr à la socket référencée
         par le descripteur de fichier sockfd .  addrlen spécifie la taille, en
         octets, de la structure d'adresse pointée par addr .
         Traditionnellement, cette opération s'appelle « attribuer un nom à un
         prise"*/
    const bind = 'port: ' + MY_PORT; 
    switch ( error.code ) {
      // erreur.code:prorieté code renvoit une chaine avec le code de l erreur du systeme couramment rencontré lors de l ecriture d un programme Node
      //, switch verifie la valeur retourné de code avec diffrent code erreur ci dessous
      case 'EACCES':
   // une tentative d'accès à un fichier d'une manière interdite par ses autorisations d'accès au fichier a été effectuée.
        logger.info( 'Error:' + " " + bind + ' autorisation refusée.' );
        process.exit( 1 ); //le code 1 force l echec du process, le code 0 : code succes par defaut 
      //  mieux vaut definir en amont avec process.exitCode= "le code", le code de sortie du process a definir lorsque le process node se termine normalement, node peut au moins terminer sa boucle d evenement sans forcer l/ echec
        break;
  
      case 'EADDRINUSE':
      // Une tentative de liaison d'un serveur ( net, http, ou https) à une adresse locale a échoué car un autre serveur sur le système local occupait déjà cette adresse.
        logger.info( 'Error:' + " "+ bind + ' adresse déjà utilisée.');
        process.exit( 1 );
        break;
        
     /*  default definit le block de code par defaut qui sera execute 
     si l instruction switch ne trouve auucne correspondance de valeurs(dans les case) avec la valeur de error.code*/
      default: 
        logger.info( "Error: erreur systeme")
        throw error;
    }
  };

//creation du serveur avec le module http et en appelant les fonctions et methodes du module apps.js
const server = http.createServer( app );




// création des logging basiques pour les evenements erreur et les évenements d'écoute du serveur sur le port
server.on('error', errorHandler); // ici l ecouteur d evenment ecoute les evenement erreur qui se produit sur le server)
server.on('listening', () => { // ecoute les evenement nomme listening qui se produit sur server
  const bind = 'port ' + MY_PORT;
  logger.info('Listening on ' + bind);
});

//...................................ECOUTE DU SERVEUR SUR LA VARIABLE D ENVIRONNEMENT PORT.........................................
//le serveur attend les requete sur ce port et ecoute sur port, requete qui sera traité par l aplication express qui est appélé dans le module app.js
server.listen( MY_PORT );