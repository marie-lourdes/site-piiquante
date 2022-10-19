// import du package Mongoose pour accéder aux méthodes Shema et model
const mongoose = require( "mongoose" );

//................................... CRÉATION DU MODELE DE DONNÉES  DES SAUCES.....................................

// création de la structure de données de la sauce
const saucesShema = mongoose.Schema( {
    name: {type: String, required: true},
    manufacturer: {type: String, required: true},
    description: {type: String, required: true},
    mainPepper: {type: String, required: true},
    heat: {type: Number, min: 1, max: 10, required: true},
    userId: {type: String, required: true},
    imageUrl: {type: String, required: true},
    likes: {type: Number},
    dislikes: {type: Number},
    usersLiked: [String],
    usersDisliked: [String]
} );
