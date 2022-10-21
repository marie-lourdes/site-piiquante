// import du package Mongoose pour accéder aux méthodes Shema et model
const mongoose = require( "mongoose" );

//................................... CRÉATION DU MODELE DE DONNÉES  DES SAUCES.....................................

// création de la structure de données de la sauce
const sauceShema = mongoose.Schema( {
    name: {type: String},
    manufacturer: {type: String},
    description: {type: String},
    mainPepper: {type: String },
    heat: {type: Number, min: 1, max: 10,},// ajout d une contrainte pour la validation par mongoose de la valeur entre 1 et 10 du champs "heat"
    userId: {type: String },
    imageUrl: {type: String },
    likes: {type: Number},
    dislikes: {type: Number},
    usersLiked: [String],
    usersDisliked: [String]
} );

module.exports = mongoose.model( "Sauce", sauceShema);


