const rateLimit = require("express-rate-limit")

exports.rateLimiterConnexion = rateLimit ({ windowMs : 15 * 60 * 1000 , // 24 h en millisecondes 
max : 3, message : 'tentative de connexion depassé, veuillez essayer ulterieurement' , standardHeaders : true , legacyHeaders : false  });
exports.rateLimiter = rateLimit ({ windowMs : 15 * 60 * 1000 , // 24 h en millisecondes 
max : 50, message : 'Désolé pour la gêne occasionnée, patientez quelques minutes...le service technique s\'en occupe !' , standardHeaders : true , legacyHeaders : false  });