
const rateLimit = require("express-rate-limit")

exports.rateLimiterUsingThirdParty = rateLimit ({ windowMs : 24 * 60 * 60 * 1000 , // 24 h en millisecondes 
max : 100 , message : 'Vous avez dépassé la limite de 100 requêtes en 24 h !' , standardHeaders : true , legacyHeaders : false , }); 