const { MessageAttachment, Intents, Client } = require('discord.js');
const ytdl = require('ytdl-core');
const fs = require('fs');
const yts = require('yt-search');
const ffmpeg = require('fluent-ffmpeg');

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    partials: ['MESSAGE', 'CHANNEL']
});
const cooldown = new Set();
client.once('ready', () => console.log(client.user.username))
client.on('messageCreate', async message => {
    try {
      
        if(message.content.startsWith("!get")) {
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
          .audioBitrate(128)
                .format('mp3')
              .save(fs.createWriteStream(`./tmp/${video?.all[0].videoId}.mp3`, { flags: 'a' }))
             .on('end', async () => {
               try {
                const attachment = new MessageAttachment(`./tmp/${video?.all[0].videoId}.mp3`, `${video?.all[0]?.title}.mp3`);
            msg.edit({ files: [attachment] }).then(() => unlink());
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
