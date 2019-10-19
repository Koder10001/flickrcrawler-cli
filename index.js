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
    let ID = "";
    let curPage = 1;
    let res = "";
    switch(mode){
        case "photostream":
            ID = await flickr.urls.lookupUser({url: url});
            ID = ID.body.user.id;
            console.log(ID);
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
        case "album":
            ID = await flickr.urls.lookupUser({url: url});
            ID = ID.body.user.id;
            console.log(url.split("/")[6]);
            do {
                res = await flickr.photosets.getPhotos({
                    user_id: ID,
                    photoset_id: url.split("/")[6],
                    per_page: 500,
                    page: curPage,
                    extras: "url_sq,url_q,url_s,url_n,url_w,url_m,url_z,url_c,url_l,url_h,url_k,url_o"
                })
                if(!fs.existsSync(mode+"-"+url.split("/")[6])){
                    fs.mkdirSync(mode+"-"+url.split("/")[6]);
                }
                await Download(res.body.photoset.photo,mode+"-"+url.split("/")[6],curPage,res.body.photoset.total);
                curPage++;
            }while(curPage <= res.body.photoset.pages);
        break;
        case "favorite":
            ID = await flickr.urls.lookupUser({url: url});
            ID = ID.body.user.id;
            console.log(ID);
            do {
                res = await flickr.favorites.getList({
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
        case "gallery":
            ID = await flickr.urls.lookupGallery({url: url});
            ID = ID.body.gallery.gallery_id;
            console.log(ID);
            do {
                res = await flickr.galleries.getPhotos({
                    gallery_id: ID,
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
        case "group":
            ID = await flickr.urls.lookupGroup({url: url});
            ID = ID.body.group.id;
            console.log(ID);
            do {
                res = await flickr.groups.pools.getPhotos({
                    group_id: ID,
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
        case "all album":
            ID = await flickr.urls.lookupUser({url: url});
            ID = ID.body.user.id;
            console.log(ID);
            let photosets = "";
            let curAlPage = 1;

            do{
                photosets = await flickr.photosets.getList({user_id: ID,page: curAlPage,per_page: 500});
                let ids = photosets.body.photosets.photoset.map(x=>{
                    return x.id;
                })
                for(let i = 0;i < ids.length; i++) {
                    readline.cursorTo(process.stdout,0,process.stdout.rows-1);
                    console.print(i+1+"/"+ids.length + " " + ids[i]);
                    curPage = 1;
                    do {
                        res = await flickr.photosets.getPhotos({
                            user_id: ID,
                            photoset_id: ids[i],
                            per_page: 500,
                            page: curPage,
                            extras: "url_sq,url_q,url_s,url_n,url_w,url_m,url_z,url_c,url_l,url_h,url_k,url_o"
                        }).catch(err=>{});
                        if(!fs.existsSync("album-"+ids[i])){
                            fs.mkdirSync("album-"+ids[i]);
                        }
                        await Download(res.body.photoset.photo,"album-"+ids[i],curPage,res.body.photoset.total);
                        curPage++;
                    }while(curPage <= res.body.photoset.pages);
                    curAlPage++;
                }
            }while(curAlPage <= photosets.body.photosets.pages);
        break;
    }

    process.exit();
})();

async function Download(arr,folder,page,total){
    arr = arr.map(x=>{
        return x.url_o || x.url_k || x.url_h || x.url_l || x.url_c || x.url_z || x.url_m || x.url_w || x.url_n || x.url_s || x.url_q || x.url_sq;
    })
    readline.cursorTo(process.stdout,0,2);
    for(let i = 0;i<arr.length;i++){
        let filesize = await download(arr[i],folder);
        // console.log();
        // process.stdout.write("\r"+(i+1+500*(page-1))+ "/" + total + " " + lastIndex(arr[i].split("/")) + " " + (filesize/1024000).toFixed(2)+" MB");
        console.print((i+1+500*(page-1))+ "/" + total + " " + lastIndex(arr[i].split("/")) + " " + (filesize/1024000).toFixed(2)+" MB");
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
console.clear = ()=>{
    for(let i = 0;i<process.stdout.rows;i++){
        readline.cursorTo(process.stdout,0,0);
        console.log("\r");
    }
};
console.print = (str)=>{
    process.stdout.write("\r"+ (" ".repeat(process.stdout.columns))+ "\r");
    process.stdout.write(str);
}