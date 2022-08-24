const ffmpeg = require('fluent-ffmpeg');
const ytdl = require('ytdl-core');
const search = require("youtube-sr").default;
const fs = require('fs');
const { google } = require('googleapis');
const collection = new Set();
require('dotenv').config();
const path = require('path');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CLIENT_ID = process.env.clientID;
const CLIENT_SECRET = process.env.clientSecret;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const REFRESH_TOKEN = process.env.refreshCode;

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

const getAudio = (video) => new Promise((resolve, reject) => {
    var stream = ytdl(video?.url, { filter: 'audioonly' });
    var file = fs.createWriteStream(`./tmp/${video?.title}.mp3`);
    ffmpeg(stream)
    .format('mp3') 
    .save(file)
    .on('progress', p => {
        process.stdout.write(`${video?.title}`, `${p.targetSize}kb downloaded`);
      })
    .on('end', () => {
        console.log(`Finished downloading ${video?.title}`)    
        resolve(`Done ${video?.title}`);
    })
});


async function doDownload(playlist) {
    const dir = fs.readdirSync('./tmp').filter(file => file.endsWith('.mp3'));
if(!playlist) throw new Error('Please provide a playlist Id');
    for (i in dir) {
        collection.add(dir[i].slice(0, -4));
    }   
    await wait(5000);
    const data = (await search.getPlaylist(`${playlist}`).then(playlist => playlist.fetch()));
    if(!Array.isArray(data?.videos)) throw new Error("No videos found");
     var videos = data.videos; 
     for(i in videos) {
       if(collection.has(videos[i]?.title)) return;
          console.log(await getAudio(videos[i]));
    };
};

async function doUpload() {
  const dir = fs.readdirSync('./tmp').filter(file => file.endsWith('.mp3'));
  for (i in dir) {
    await uploadFile(`/tmp/${dir[i]}`, `${dir[i]}`)
    console.log(`Done upload ${dir[i]}`)
  }
}
async function uploadFile(filePath, name) {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: `${name}`, 
      //  mimeType: 'audio/mp3',
      },
      media: {
     //   mimeType: 'audio/mp3',
        body: fs.createReadStream(`${path.join(__dirname, filePath)}`),
      },
    });

    return response.data;
  } catch (error) {
    console.log(error.message);
  }
}

//doDownload('')
//doUpload();

process.on('uncaughtException', function (err) {
   console.log(err)
});
