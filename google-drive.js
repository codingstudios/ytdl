const { Intents, Client } = require('discord.js');
const ytdl = require('ytdl-core');
const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');
const yts = require('yt-search');
const ffmpeg = require('fluent-ffmpeg');
const CLIENT_ID = clientID;
const CLIENT_SECRET = clientSecret;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const REFRESH_TOKEN = refreshCode;

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
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    partials: ['MESSAGE', 'CHANNEL']
});
const cooldown = new Set();
client.once('ready', () => console.log(client.user.username))
client.on('messageCreate', async message => {
    try {
      
        if(message.content.startsWith("?get")) {
            const name = message.content.slice(5);
            const video = await yts(name);
            const stream = ytdl(video?.all[0].url, { filter: 'audioonly' });
      const msg = await message.channel.send({ content: 'Please Wait...' });
          if(cooldown.has('yes'))return msg.edit({
            content: 'Please wait until the first download is finished'
          });
          if(fs.existsSync(`./tmp/${video?.all[0]?.videoId}.mp3`)) {unlink();}
            cooldown.add('yes');
            ffmpeg(stream)
                .format('mp3')
              .save(fs.createWriteStream(`./tmp/${video?.all[0].videoId}.mp3`, { flags: 'a' }))
             .on('end', async () => {
               try {
               const final = await uploadFile(`./tmp/${video?.all[0].videoId}.mp3`, `${video?.all[0]?.title}.mp3`);
              const public = await generatePublicUrl(final?.id);
             msg.edit({ content: `\`\`\`${JSON.stringify(public)}\`\`\`` }).then(() => unlink());
               }catch(e) {
                 console.log(e)
               }
          })
    function unlink() {
             fs.unlinkSync(`./tmp/${video?.all[0]?.videoId}.mp3`);
      cooldown.delete('yes');
    }
        }
    }catch(e) {
        console.log(e);
    }
})
client.login(TOKEN)


async function generatePublicUrl(fileId) {
  try {
    if(!fileId)return;
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
    const result = await drive.files.get({
      fileId: fileId,
      fields: 'webViewLink, webContentLink',
    });
    return result.data;
  } catch (error) {
    console.log(error.message);
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


