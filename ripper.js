const request = require('request'),
      fs = require('fs'); 

let clientID = "6b64b0446da80dc";

let unallowChar = "><:\"\\/|?*\0"; 

let args = process.argv.splice(2, 4); 

let customPath = args.length > 1;
let pathArg

if (customPath) {
    pathArg = args[1];
}

let urlImages = "https://api.imgur.com/3/album/" + getAlbumHash(args[0]); 

let optionsImages = {
    url: urlImages,
    headers: {
        'authorization': 'Client-ID ' + clientID
    }
}

function getAlbumHash(url) {
    return url.split("/")[url.split("/").length - 1]
}

function parseImages(err, resp, body) {
    if (err != null) {
        process.exit();
    }

    let imgTitles = [];
    let imgLinks = [];

    JSON.parse(body, (key, val) => {
        if (key == "title") {
            imgTitles.push(val);
        }

        if (key == "link") {
            imgLinks.push(val);
        }
    });

    let dirTitle = pathArg; 

    imgLinks = imgLinks.slice(1, imgLinks.length); 

    for (image = 0; image < imgLinks.length; image++) {
        let filename = imgLinks[image].split("/")[3];
        download(imgLinks[image], filename, dirTitle); 
    }
}

function download(link, filename, dir) {
    request(link).pipe(fs.createWriteStream(dir + "/" + filename));
}

request(optionsImages, parseImages);
