#!/usr/bin/env node

"use strict";
const Flickr = require("flickrapi");
const fs = require("fs");
const inquirer = require("inquirer");
const flickrOptions = {
    api_key: "af1146a2df5582ec7a4b02c644eb2c1f",
    secret: "0ebfc840048d60b1",
    user_id: '143988946@N05',
    access_token: '72157700484389675-24d7a90f926a3398',
    access_token_secret: '0096f537b1c3cfcf'
};


console.clear();
(async function(){
    if(process.argv.length <= 2){
        console.log("flickr <link>");
        process.exit();
    }
    console.log("Authenticating ...");
    var __DIR__ = process.cwd();
    let flickr = await Auth(flickrOptions);
    if(!flickr){
        console.log("error");
        process.exit();
    }
    let ans = await inquirer.prompt([
        {
            type:"list",
            name:"aaaa",
            message:"Download",
            choices: [
                "photostream",
                "album",
                "favorite",
                "gallery"
            ]
        }
    ]);
    console.log(ans);
    process.exit();
})();

function Auth(flickrOptions){
    return new Promise((resolve)=>{
        Flickr.authenticate(flickrOptions,(error,flickr)=>{
            if(error){
                console.log(error);
                resolve(false);
            }
            else {
                resolve(flickr);
            }
        })
    })
}