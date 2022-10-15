// import du module modèle Users pour accéder aux methodes de l 'objet model de mongoose
const User = require("../models/Users" )
// import du package bcrypt pour crypter le mot de passe crée de l utilisateur lors de son inscription dans la fonction controllers signup
const bcrypt = require( "bcrypt" );

//............................CREATION DES FONCTIONS SEMANTIQUES DU CONTROLLERS POUR L INSCRIPTION ET LA CONNEXION DE L UTILISATEUR.............................

// fonction controller pour l'inscription d un utilisateur
 exports.signUp = ( req, res ) => {
    // recuperation du mot de passe de la requête utilisateur lors de son inscription via le formulaire qu 'on encode avec le package bcrypt avant d'enregister le mot de passe dans le modèle User et la collection renommée "users" de MongoDB Atlas
    bcrypt.hash( req.body.password, 10 )
    .then( hash => {
    // on recupère le resultat de la promesse de la méthode hash() qui est le mot de passe crypté pour l enregistrer dans l instance du modèle User
    // creation de l instance du modèle User et on apelle avec "new" le constructeur model() du module Users.js contenu dans la variable User ci dessus
        const user = new User({
        //le modèle copie la structure de donnée de userShema avec les données insérés ci dessous à l intérieur du modèle
            email: req.body.email, // recupération de l 'email crée et saisi dans le formulaire
            password: hash
        });
    // enregistrement de la nouvelle instance de modèle "user" dans la base de données intégrant les données structurées avec les valeurs
        user.save()
        .then( () => res.status( 201 ).json( { message: "compte utilisateur crée"}))//save() envoit une promesse si elle est resolu , sur  ce resultat  then envoie au front-end la reponse à la requête Post sur l 'endpoint de l 'API("/signup") avec un statut 201 pour la création du compte reussi avec un message en ojjet
        .catch( error => res.status( 400 ).json( {error} ) );// catch() récupère les erreurs généres par la méthode save(): l'enregistrement du model et indique une erreur de requête avec le code http 400  
    })
    .catch( error => res.status( 500 ) ).json( { error } )// nous indiquons une erreur serveur avec le code http 500 car c'est une erreur qui peut être généré par le cryptage de l 'api du mot de passe
};
