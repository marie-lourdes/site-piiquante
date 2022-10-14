//import du package mongoose pour accéder aux methodes shema et model de mongoose
const mongoose = require( "mongoose" );
//import du plugin de mongoose pour vérifier avant enregistrement dans la base de données que l'email est une donnée unique dans la base de donnée
const uniqueValidator = require( "mongoose-unique-validator" );

//.......................................CRÉATION DE LA COLLECTION USERS............................................

//création du userShema 
const userShema = mongoose.Schema( {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
} );

//prévalidation de l'email  crée en tant qu'adresse email unique avec le mot clé unique et plugin unique-validator: pour ne pas  l enregistrer plusieurs fois pour des utilisateurs différents 
userShema.plugin( uniqueValidator );

//création du modèle User qui copie la structure de donnée de userShema qu'on exporte pour y accéder lors des opérations CRUD dans les fichiers de fonctions semantique des controllers 
module.exports = mongoose.model( User, userShema ); 