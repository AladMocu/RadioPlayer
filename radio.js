var streamConfig = {
    url: "http://localhost:8000/stream",
    sourceuser: "source",
    format: "MP3",
    sourcepassword: "hackme",
};
var liveStream = require('icy-streamer')(streamConfig);
liveStream.addSong("./songs/keepalive.mp3",function(){
    liveStream.startStream();
});


/*
liveStream.addSong("./songs/zWaymcVmJ-A.mp3",function(){
console.log("Added new song yaya!");
 // Ok let's start the stream!
setTimeout(function(){
  if(liveStream.Stream.running){ // You can check using this property.
    liveStream.addSong("./songs/zWaymcVmJ-A.mp3");
     // Added another song you can stop if you want using liveStream.killStream() or it will end itself anyway.
  }
},10000); // After 2 second let us add another song. Of course you will call this somewhere else. Just be sure stream did not end.

});*/


const express = require('express');
const app=express();
const port = 8080;

app.listen(port,()=>{
console.log("Servidor Abierto")
});

app.get('/',(req,res)=>{
    let id= req.query.id;
    getVideo(id);
    res.send("received: "+id);
});



const ytdl = require('ytdl-core');
const fs = require('fs');
const https = require('https');
const ffmpeg = require ('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;


const cred = "AIzaSyDpfXopNsWrgWsRKWNF8c-MxKQZ2itj7Cg"



function searchVideo(name){

    let req = `https://www.googleapis.com/youtube/v3/search?part=id&part=snippet&q=${name}&key=${cred}&maxResults=1`;

    https.get(req, (resp) => {
        let data = "";
        resp.on("data", (chunk) => {
            data += chunk;
        });
        resp.on("end", async () => {

            let dData = JSON.parse(data);
            let title = dData.items[0].snippet.title;
            let vId = dData.items[0].id.videoId;
            await getVideo(vId, title);

        })

    }).on("error", (err)=> {
        console.log(err.message);
    });

}



async function getVideo(id) {
    let url = `https://www.youtube.com/watch?v=${id}`;
    let stream =  ytdl(url/*{filter:'audioonly'}*/);
    console.log("iniciando descarga")
    var proc = new ffmpeg({source: stream});
    proc.setFfmpegPath(ffmpegPath);
    proc.withAudioCodec('libmp3lame')
        .toFormat('mp3')
        .output(fs.createWriteStream(`./songs/${id}.mp3`))
        .run();
    proc.on('end', function() {
        console.log("descarga completada");
        liveStream.addSong(`./songs/${id}.mp3`);
  
    });
}
async function getVideoNoFmpeg(id) {
    let url = `https://www.youtube.com/watch?v=${id}`;
    console.log("iniciando descarga")
    let stream =  ytdl(url,{filter:'audioonly'}).pipe(fs.createWriteStream(`./songs/${id}.mp3`));
    stream.on('finish',()=>{
        console.log("descarga completada");
        liveStream.addSong(`./songs/${id}.mp3`);
    });
}


