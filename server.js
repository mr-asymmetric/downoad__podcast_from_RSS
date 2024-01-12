const Parser = require('rss-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const parser = new Parser();

const downloadFile = async (url, filename) => {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filename);

        response.data.pipe(writer);

        let error = null;
        writer.on('error', err => {
            error = err;
            writer.close();
            reject(err);
        });

        writer.on('close', () => {
            if (!error) {
                resolve(true);
            }
        });
    });
};

const downloadPodcasts = async (rssUrl) => {
    const feed = await parser.parseURL(rssUrl);
    for (let item of feed.items) {
        if (item.enclosure && item.enclosure.url) {
            const url = item.enclosure.url;
            const filename = path.join(__dirname, 'podcasts', path.basename(url));
            console.log(`Downloading: ${filename}`);
            try {
                await downloadFile(url, filename);
                console.log(`Downloaded: ${filename}`);
            } catch (error) {
                console.error(`Error downloading ${filename}: ${error}`);
            }
        }
    }
};

const rssUrl = 'YOUR_PODCAST_RSS_FEED_URL';
downloadPodcasts(rssUrl);
