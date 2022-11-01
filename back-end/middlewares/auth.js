// import du package jsonwebtoken pour la verification du token de l utilisation lorsqu'il fait une requête CRUD vers l'API
const jwt = require( "jsonwebtoken" );


// import du package dotenv pour charger les variables d 'environnement 
const dotenv = require( "dotenv" );
const logger = require("../log/logger");
dotenv.config();
const TOKEN_ALGORITHM = process.env.TOKEN_REQUEST;
const CLIENT = process.env.CLIENT_REQUEST;

// On exporte le module d'authentification de la requête pour verifier le token lors d une opérations CRUD sur les endpoint des ressources sauces
module.exports = (req, res, next) => {  
    // verification de la page  du client provenant du site avant de decoder le token
    if( req.referer !== CLIENT ){
        logger.error( "requête inconnu" + " " + "ip" + req.ip + " " + " " + req.method +" " + req.originalUrl );
        throw "requête interdite"

    } 
    try{
        const token = req.headers.authorization.split( " " )[1];
        const tokenDecoded = jwt.verify( token, TOKEN_ALGORITHM );
        const userId = tokenDecoded.userId;

        req.auth = {
            userId: userId
        }
     next();
    }catch( error ){
        res.status( 401 ).json( {error} );
        //log erreur d authentification
        logger.error( "Erreur authentification:" + " " + "ip" + req.ip + " " + " " + req.method +" " + req.originalUrl );
    }
};
