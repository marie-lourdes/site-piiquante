// import du module multer pour configurer la gestion de telechargement des images
const multer = require( "multer" );

// création d'un objet "dictionnaire" de la propriété mimetypes de l 'objet file avec une mimetype associée à leur valeur en extensions de fichier possibles des images qui seront ajoutés par l 'utilisateur dans le formulaire "add sauce"

const mimeTypes = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png"
}
//..........................................CONFIGURATION DU TÉLÉCHARGEMENT DES IMAGES..................................................

// configuration du middleware multer avec son objet de configuration de stockage  "storage" et la methode diskStorage pour avoir plus de controle sur la destination du fichier image et le nom du fichier image
const storage = multer.diskStorage( {
    //option disponible de la méthodes diskstorage contenant une fonction pour indiquer où l'objet file de la requête entrante doit être stocké 
    destination: ( req, file, callback ) => {
        callback( null, "images"); // la callback constate qu il n'y a pas d 'erreur et telecharge l 'objet  file de la requête dans le dossier que nous lui avons indiqué
    },
    // multer creer de maniere aleatoire le nom du fichier et ne créer pas d'extension au fichier
    // Creation du nom du fichier avec la valeur de l'un des trois mimetypes du dictionnare mimeTypes
    filename: ( req, file, callback ) => {
        // Récupération du nom d'origine du fichier sans l extension du nom d'origine du fichier lors du telechargement pour ne garder que le "nom dy fichier" et le reintegrer avec les extension du dictionnaire mimeTypes qu on restreint à 3 qu on accepte pour les images
        
        /* On transforme le nom d'origine du fichier en tableau , extrayons les valeur du tableau qui nous interesse: le nom du fichier sans l extension 
        et on retransforme en les sous chaine en une seul chaine de caractere */
        // pour eviter des problemes sur le serveur lors de l 'enregistrement de l'image:supression des espaces, des  caractères speciaux dans le nom du fichier telechargé par l utilisateur et sauvagrdé par multer
         let name= file.originalname.split(".").slice(0,-1).join();
         name = name.split(" ").join("_");// de cette chaine de caractere nous la retranformons en tableau et la scindons au niveau des espaces et la relions en une seule chaine de caractere avec les underscores
         console.log( "name", name );
         name = name.replace( /[`~@#$&*()|+\-=?;'<>/]/gi, '' );
        // apres la modification du nom d origine du fichier sans l extension nous pouvons ajouté au nom d'origine stockée dans name ,les millisecondes, et  lui ajouté l extension
     
        // création de l'extension: on recupere la propriété mimetype de l objet file de la requête et la valeur associée  dans le dictionnaire mimeType
        const extension = mimeTypes[file.mimetype];
        // creation du nom du fichier téléchargé avec les configuration ce dessus: en appelant la fonction callback nous nommons le fichier en ajoutant lors de l 'ajout de l 'image les millisecondes pour rendre unique le fichier si l on se retrouve avec des portants le nom d'origine
        callback( null, name + Date.now() + "." + extension );
    }
} );

// export du middleware multer avec l'objet de configuration storage qui stocke la const storage pour le rendre accessible aux routes crées pour les sauces,
// et le nom du champs de type file enregistré dans le constructeur formData lors de la requête front-end dans la methode single() pour gérer qu un seul fichier image
module.exports = multer({ storage }).single( "image" ); 
// multer({storage: storage}) equivalent à stocker la const storage dans l objet de configuration storage de multer