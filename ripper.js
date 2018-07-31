/* Node dependencies */
var request = require('request'); //For calling the url.
var fs = require('fs'); //For saving images and creating directories.

/* Imgur API client id, plz no steal */
var clientID = "3752a956b4926c9";

/* For checking directory name */
var unallowChar = "><:\"\\/|?*\0"; //List of unnallowed characters.

//Get the argument count.
var args = process.argv.splice(2, 4); //Get rid of the first two elements as those aren't needed.

var customPath = args.length > 1;
var pathArg

if (customPath) {
    pathArg = args[1];
}

//Testing for usage.
if (args.length < 1 || args.length > 2) {
    failExit("Incorrect usage! See README for usage information.")
}

var urlImages = "https://api.imgur.com/3/album/" + getAlbumHash(args[0]); //Get the url argument for the images themselves.

var optionsImages = {
    url: urlImages,
    headers: {
        'authorization': 'Client-ID ' + clientID
    }
}

/**
 * @desc Get the hash from an album by splitting the url.
 * @param {string} url the url to get the album has from. 
 * @return {string} the album hash.
 */
function getAlbumHash(url) {
    return url.split("/")[url.split("/").length - 1]
}

/**
 * @desc Parse the images for important information to get the title and links from them.
 * @param {error} err passing an error if the images are invalid. 
 * @param {string} resp the response from the HTTP get req.
 * @param {string} body the original body from the req.
 */
function parseImages(err, resp, body) {
    if (err != null) {
        failExit(err);
    }

    var imgTitles = [];
    var imgLinks = [];

    JSON.parse(body, (key, val) => {
        if (key == "title") {
            imgTitles.push(val); //Push titles to array.
        }

        if (key == "link") {
            imgLinks.push(val); //Push links to array.
        }
    });

    if (!customPath) {
        //The title to the album will always be the first element.
        var dirTitle = removeSpecialCharacters(imgTitles[0]); //Remove unsuable directory characters.
        fs.mkdir(dirTitle); //Create the directory for the folders.
    } else {
        var dirTitle = pathArg; //Just set that to the directory.
    }

    imgLinks = imgLinks.slice(1, imgLinks.length); //Get rid of the album elements.

    //Loop through all
    for (image = 0; image < imgLinks.length; image++) {
        var filename = imgLinks[image].split("/")[3];
        download(imgLinks[image], filename, dirTitle); //Send a request to download them.
    }

    console.log("Album is located at --> '" + dirTitle + "'");
}

/**
 * @desc Remove special characters from the directory name to prevent invalid naming.
 * @param {string} dir the directory name.
 * @return {string} the directory name without invalid characters. 
 */
function removeSpecialCharacters(dir) {
    var newDir = ""; //The newDir with removed invalid characters.

    for (letter = 0; letter < dir.length; letter++) {
        if (unallowChar.indexOf(dir.charAt(letter)) === -1) { //If the char is valid.
            newDir += dir.charAt(letter); //If the character is valid add it to the newDir.
        }
    }

    return newDir;
}

/**
 * @desc Sends an HTTP get request and pipes it to a write stream.
 * @param {string} link the link we're sending the req to.
 * @param {string} filename the filename we're writing to.
 * @param {string} dir the drectory name we're writing to.
 */
function download(link, filename, dir) {
    request(link).pipe(fs.createWriteStream(dir + "/" + filename));
}

/**
 * @desc Fail the program and display why.
 * @param {err/string} why the reason the program failed if a reason is given. 
 */
function failExit(why) {
    console.log(why);
    process.exit(1);
}

/* Send the requests to Imgur API */
request(optionsImages, parseImages);
