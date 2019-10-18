#!/usr/bin/env node

"use strict";
const Flickr = require("flickr-sdk");
const fs = require("fs");
const inquirer = require("inquirer");
const flickrKeys = {
    api_key: "af1146a2df5582ec7a4b02c644eb2c1f",
    secret: "0ebfc840048d60b1",
    access_token: '72157700484389675-24d7a90f926a3398',
    access_token_secret: '0096f537b1c3cfcf'
};
var flickr = new Flickr(Flickr.OAuth.createPlugin(flickrKeys.api_key,flickrKeys.secret,flickrKeys.access_token,flickrKeys.access_token_secret));

console.clear();
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
                    page: curPage++,
                    extras: "url_sq,url_q,url_s,url_n,url_w,url_m,url_z,url_c,url_l,url_h,url_k,url_o"
                })
                console.log(res.body.photos.photo[0]);
                // fs.writeFileSync(`photostream-${ID}.txt`,)
            }while(curPage <= res.body.photos.pages);
        break;
    }

    process.exit();
})();

function Largest(json){
    
}

// function getLinks(method,id){
//         method({
//             user_id: id,
//             group_id: id,
//             gallery_id: id,
//             per_page: 1,
//             page:2,
//             extras: "url_sq,url_q,url_s,url_n,url_w,url_m,url_z,url_c,url_l,url_h,url_k,url_o"
//         });
// }