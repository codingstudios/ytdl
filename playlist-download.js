const ffmpeg = require('fluent-ffmpeg');
const ytdl = require('ytdl-core');
const search = require("youtube-sr").default;
const fs = require('fs');
const { Collection } = require('@discordjs/collection')
const collection = new Set();
const collection2 = new Collection();
const { google } = require('googleapis');
const path = require('path');
const downloaded = [];
const cannot = [ ]

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);
  
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
  });

const all = [];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      
const getAudio = (video) => new Promise((resolve, reject) => {
    var stream = ytdl(video?.url, { filter: 'audioonly' });
    var file = fs.createWriteStream(`./tmp/${video?.title.split("/").join(" ").split(".").join(" ")}.mp3`);
    ffmpeg(stream)
    .format('mp3') 
    .save(file) 
    .on('end', () => {
        collection.add(`${video?.title}`); 
        resolve(`Done ${video?.title}`);
    })  
});        

async function uploadFile(filePath, name) {
    try {
      const response = await drive.files.create({
        requestBody: {
          name: `${name}`, 
        },
        media: {
          body: fs.createReadStream(`${path.join(__dirname, filePath)}`),
        },
      });
  
      return response.data;
    } catch (error) {
      console.log(error.message);
    }
  }

async function run() {
    const dir = fs.readdirSync('./tmp').filter(file => file.endsWith('.mp3'));
    for (i in dir) {
        collection.add(dir[i].slice(0, -4));
        downloaded.push(dir[i].slice(0, -4));
    //    await uploadFile(`./tmp/${dir[i]}`, `${dir[i].slice(0, -4)}.mp3`);
    }      
    await wait(5000);  
    const data = (await search.getPlaylist("PLAYLIST_ID").then(playlist => playlist.fetch()));
    if(!Array.isArray(data?.videos)) throw new Error("No videos found"); 
     var videos = data.videos;  
     for(i in videos) { 
        all.push(videos[i].title);   
        collection2.set(videos[i].title, videos[i].url);
       if(!collection.has(videos[i]?.title.split("/").join(" ").split(".").join(" "))) { 
         console.log(await getAudio(videos[i]));  
         downloaded.push(videos[i]?.title);
         console.log(downloaded.length, videos.length, i)
       }   
    }
    console.log(all.length, downloaded.length);
};

run();
  
process.on('uncaughtException', async function (err) {
   console.log(err)
});  
