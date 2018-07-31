const request = require('request'),
      fs = require('fs'); 

let args = process.argv.splice(2, 4),
    urlImages = "https://api.imgur.com/3/album/" + getAlbumHash(args[0]),
    optionsImages = {
    url: urlImages,
    headers: {
        'authorization': 'Client-ID 6b64b0446da80dc'
    }
 }

function getAlbumHash(url) {
    return url.split("/")[url.split("/").length - 1]
}

function parseImages(err, resp, body) {
    if (err != null) {
        process.exit();
    }

    let imgLinks = [];

    JSON.parse(body, (key, val) => {
        if (key == "link") {
            imgLinks.push(val);
        }
    });

    imgLinks = imgLinks.slice(1, imgLinks.length); 

    for (image = 0; image < imgLinks.length; image++) {
        download(imgLinks[image], imgLinks[image].split("/")[3], args[1]); 
    }
}

function download(link, filename, dir) {
    request(link).pipe(fs.createWriteStream(dir + "/" + filename));
}

request(optionsImages, parseImages);
