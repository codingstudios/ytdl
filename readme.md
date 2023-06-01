## Setup

1. Obtain `client_id` & `client_secret` from [console.developers.google.com](https://console.developers.google.com)
2. Goto [developers.google.com/oauthplayground](https://developers.google.com/oauthplayground) 
    1. choose the **Drive v3** scope
    2. click settings, select **Use your own OAuth credentials**
    3. Enter `client_id` & `client_secret`
    4. Click **authorize apis** and complete the process
    5. Obtain the `refresh_token`
3. Update system then install **ffmpeg** & all the dependencies
```
sudo apt update
sudo apt install ffmpeg
npm install @discordjs/collection ytdl-core youtube-sr googleapis fluent-ffmpeg
```
4. Fill in everything in `playlist-download.js`
