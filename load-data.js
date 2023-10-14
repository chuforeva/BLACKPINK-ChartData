const fs = require('fs');
const path = require('path');
const https = require('https');

const access_token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0MSIsInJvbGUiOiJST0xFX1VTRVIiLCJpc3MiOiJjaGFydGluLm1lIiwiaWF0IjoxNjk3MjA3MDY0LCJleHAiOjE2OTcyMjE0NjR9.0IVEXiY674xmxVbiJ1X2Z9iqtBCOjnUvpChLSBrpHLA";
const api = "https://chartin.me";

fs.readFile(path.resolve(__dirname, './data.json'), (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    var json = JSON.parse(data);

    for (var d of json.data) {
        for (var song of d.songs) {
            loadData("melon", "realtime", song);
            loadData("melon", "top100", song);
            loadData("melon", "daily", song);
            // loadData("melon", "weekly", song);
            // loadData("melon", "monthly", song);
        }
    }
});

function loadData(platform, type, song) {
    var url = `${api}/api/v3/chart/${platform}/${type}/trend/${song.song_id.melon}?page=1&size=10000&access_token=${access_token}`;

    try {
        https.get(url, (response) => {
            let data = '';
    
            response.on('data', (chunk) => {
                data += chunk;
            });
    
            response.on('end', () => {
                // console.log(`Data loaded: ${song.json_id}_melon_${type}`);
                writeFile(type, song, data);
            })
        });
    } catch (error) {
        console.log(url)
        console.log(error.message);
    }
    
}

function writeFile(type, song, data) {
    var file = `${song.json_id}_melon_${type}.json`;
    fs.writeFile(path.resolve(__dirname, `./backup/${file}`), data, err => {
        if (err) {
            console.error(err);
        } 
        console.log(`Success: ${file}`);
    });
}