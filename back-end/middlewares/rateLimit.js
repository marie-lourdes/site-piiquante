// import du middleware express rate limit pour eviter les attaques de deny de services et les techniques de force brute pour les tentative de connexions qui sollicite trop le serveurs par les requêtes et peut représenter un danger pour les utlisateurs et l application
const rateLimit = require( "express-rate-limit" );

// creation d un limitateur de requête pour la route /login, au bout de 3 requete de connexion, le middleware reconnait l ip et stoppe la requête post sur la route /login et attendre moins de 10 min pour retenter une connexion
// c'est une methode pour limiter les attaques de deny de service qui peut saturer le serveur s il recoit trop de requête dans un interval de temps trop court
exports.rateLimiterConnexion = rateLimit( { windowMs : 10 * 60 * 1000 , // 10 min en millisecondes 
max : 3, message : "Nombreuses tentatives de connexion, veuillez essayer ulterieurement", standardHeaders : true, legacyHeaders : false } );
// creation d un limitateur de requête pour les routes des sauces
exports.rateLimiter = rateLimit( { windowMs : 15 * 60 * 1000 , // 15 min en millisecondes
max : 50, message : "Désolé pour la gêne occasionnée, patientez quelques minutes...le service technique s\'en occupe !", standardHeaders : true, legacyHeaders : false } );