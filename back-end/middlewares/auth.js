// import du package jsonwebtoken pour la verification du token de l utilisation lorsqu'il fait une requête CRUD vers l'API
const jwt = require( "jsonwebtoken" );
// import du package dotenv pour charger les variables d 'environnement 
const dotenv = require( "dotenv" );
const logger = require("../log/logger");
dotenv.config();
const TOKEN_ALGORITHM = process.env.TOKEN_REQUEST;

// On exporte le module d'authentification de la requête pour verifier le token lors d une opérations CRUD sur les endpoint des ressources sauces
module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorization.split( " " )[1];
        console.log( "token", token);
        const tokenDecoded = jwt.verify( token, TOKEN_ALGORITHM );
        const userId = tokenDecoded.userId;

        req.auth = {
            userId: userId
        }

     next();
    }catch( error ){
        res.status( 401 ).json( {error} );
        logger.error( "erreur athentification" );

    }

};
