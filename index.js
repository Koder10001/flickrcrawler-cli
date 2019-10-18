#!/usr/bin/env node

"use strict";
const Flickr = require("flickr-sdk");
const fs = require("fs");
const inquirer = require("inquirer");
const path = require("path");
const https = require("https");
const readline = require("readline");
const flickrKeys = {
    api_key: "af1146a2df5582ec7a4b02c644eb2c1f",
    secret: "0ebfc840048d60b1",
    access_token: '72157700484389675-24d7a90f926a3398',
    access_token_secret: '0096f537b1c3cfcf'
};
console.clear();

var flickr = new Flickr(Flickr.OAuth.createPlugin(flickrKeys.api_key,flickrKeys.secret,flickrKeys.access_token,flickrKeys.access_token_secret));

(async function(){
    if(process.argv.length <= 2 || process.argv[2].trim() == ""){
        console.log("flickr <link>");
        process.exit();
    }
    var __DIR__ = process.cwd();
    var url = process.argv[2];
    var mode = (await inquirer.prompt([{
        type: "list",
        name: "reply",
        message: "Download",
        choices: ["photostream","album","favorite","gallery","group","all album"]
    }])).reply;

    switch(mode){
        case "photostream":
            let ID = await flickr.urls.lookupUser({url: url});
            ID = ID.body.user.id;
            console.log(ID);
            let curPage = 1;
            let res = "";
            do {
                res = await flickr.people.getPhotos({
                    user_id: ID,
                    per_page: 500,
                    page: curPage,
                    extras: "url_sq,url_q,url_s,url_n,url_w,url_m,url_z,url_c,url_l,url_h,url_k,url_o"
                })
                if(!fs.existsSync(mode+"-"+ID)){
                    fs.mkdirSync(mode+"-"+ID);
                }
                await Download(res.body.photos.photo,mode+"-"+ID,curPage,res.body.photos.total);
                curPage++;
            }while(curPage <= res.body.photos.pages);
        break;
    }

    process.exit();
})();

async function Download(arr,folder,page,total){
    arr = arr.map(x=>{
        return x.url_o || x.url_k || x.url_h || x.url_l || x.url_c || x.url_z || x.url_m || x.url_w || x.url_n || x.url_s || x.url_q || x.url_sq;
    })
    for(let i = 0;i<arr.length;i++){
        let filesize = await download(arr[i],folder);
        // console.log();
        readline.cursorTo(process.stdout,0,1);
        process.stdout.write(i+1+500*(page-1)+ "/" + total + " " + lastIndex(arr[i].split("/")) + " " + (filesize/1024000).toFixed(2)+" MB");
    }
}

function download(url,folder){
    return new Promise(resolve=>{
        let file = fs.createWriteStream(path.join(folder,lastIndex(url.split("/"))));
        let curChunk = 0;
        https.get(url,res=>{
            res.pipe(file);
            file.on("finish",()=>{file.close();});
            res.on("data",(chunk)=>{
                curChunk += chunk.length;
            }).on("end",()=>{
                resolve(curChunk);
            })
        })
    });
}

function lastIndex(arr){
    return arr[arr.length-1];
}