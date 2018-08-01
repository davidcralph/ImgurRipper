// Modules
const fs = require("fs"),
      query = require('cli-interact').question,    
      query2 = require('cli-interact').getYesNo,
      fetch = require('node-superfetch');
 
// Wizard     
if (!fs.existsSync('./rips/')) {
    fs.mkdirSync('./rips/');
    console.log('[Ripper] Created /rips/ directory');
}

let answer = query('[Ripper] Imgur URL? ');

if (!answer) {
    console.log('[Ripper] Error: No URL provided');
    process.exit();
}

if (!answer.includes("imgur.com")) {
    console.log('[Ripper] Error: Not a valid Imgur URL');
    process.exit();
}

let answer2 = query('[Ripper] Folder Name? ');

if (!answer2) {
    console.log('[Ripper] Error: No folder name provided');
    process.exit();
}
    
if (fs.existsSync(`./rips/${answer2}`)) {
   console.log('[Ripper] Error: This folder already exists');
   let answer3 = query2('[Ripper] Do you want to write to this folder anyway?');
   if (answer3 == false) { 
       console.log('[Ripper] Error: No answer provided');
       process.exit(); 
 }
} else {
    console.log('[Ripper] Creating directory');
    fs.mkdirSync(`./rips/${answer2}`);
}

// Downloader
console.log('[Ripper] Downloading');

async function getImages() {
   await fetch.get(`https://api.imgur.com/3/album/${answer.split("/")[answer.split("/").length - 1]}/images`)
         .set('Authorization', 'Client-ID 6b64b0446da80dc')
         .then(async r => {
            let images = r.body.data;
            console.log(`[Ripper] Found ${images.length} images in album`);
            for(let i = 0; i < images.length; i++) {
                let image = images[i];
                let filename = `${image.id}.${image.type.replace(/(\w+\/)/, '')}`;
                console.log(`[Ripper] Fetching ${image.link}`);
                await fetch.get(image.link).set('Authorization', 'Client-ID 6b64b0446da80dc').then(res => fs.writeFileSync(`./rips/${answer2}/${filename}`))
            }
            console.log(`[Ripper] Success: Saved to ./rips/${answer2}`);
            console.log('[Ripper] Press any key to exit');
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.on('data', process.exit.bind(process, 0));
        });
}

getImages();
