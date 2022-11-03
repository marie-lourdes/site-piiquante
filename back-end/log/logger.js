// import de la bibliotheque winston pour enregistrer les logs
const winston = require( 'winston' );

const logger = winston.createLogger( {
    level: 'info',
    format: winston.format.combine( winston.format.timestamp(), winston.format.json() ),
    defaultMeta: { service: 'api-hot-takes' },
    transports: [     
      new winston.transports.File( { filename: './log/info.log' } ),
      new winston.transports.File( { filename: './log/error.log', level: 'error' } ),   
    ],
} );

module.exports = logger;
