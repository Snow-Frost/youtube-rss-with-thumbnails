const fetch = require('node-fetch');
const xml2js = require('xml2js');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// YouTube RSS feed URL
const YOUTUBE_RSS_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCskh11uxbzX3GQTzHMOJZSQ';

// Helper function to fetch RSS feed and parse it
async function fetchRSS() {
  const response = await fetch(YOUTUBE_RSS_URL);
  const data = await response.text();
  const result = await xml2js.parseStringPromise(data);
  return result.feed.entry.map(entry => {
    const videoId = entry['yt:videoId'][0];
    const title = entry.title[0];
    const link = entry.link[0].$.href;
    const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    return { title, link, thumbnail };
  });
}

// Route to serve modified RSS feed with thumbnails
app.get('/rss', async (req, res) => {
  const entries = await fetchRSS();
  let rssContent = '<?xml version="1.0" encoding="UTF-8"?>';
  rssContent += '<rss version="2.0"><channel>';
  rssContent += '<title>YouTube Channel</title>';
  rssContent += '<link>https://www.youtube.com/channel/UCskh11uxbzX3GQTzHMOJZSQ</link>';
  rssContent += '<description>Channel feed with thumbnails</description>';
  entries.forEach(entry => {
    rssContent += `<item>`;
    rssContent += `<title>${entry.title}</title>`;
    rssContent += `<link>${entry.link}</link>`;
    rssContent += `<description><img src="${entry.thumbnail}" /></description>`;
    rssContent += `</item>`;
  });
  rssContent += '</channel></rss>';
  res.set('Content-Type', 'application/xml');
  res.send(rssContent);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
