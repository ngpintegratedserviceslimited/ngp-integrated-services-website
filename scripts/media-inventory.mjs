#!/usr/bin/env node
/**
 * List every local /media/ asset reference and the HTML files that use it.
 * Run: node scripts/media-inventory.mjs
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
const root=process.cwd();
const ignored=new Set([".git","node_modules",".wrangler","dist"]);
const files=[];
function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(ignored.has(entry.name)) continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) walk(full);
    else if(/\.(html?|css|js|mjs)$/i.test(entry.name)) files.push(full);
  }
}
walk(root);
const assets=new Map();
function add(raw,file){
  let value=raw.trim().replace(/&amp;/g,"&").split("#")[0].split("?")[0];
  if(!value.includes("/media/")) return;
  try{
    const u=new URL(value,"https://ngpintegratedservices.com/");
    value=u.pathname;
  }catch{
    value=value.replace(/^https?:\/\/[^/]+/i,"");
  }
  if(!value.startsWith("/")) value="/"+value;
  if(!assets.has(value)) assets.set(value,{count:0,files:new Set()});
  const item=assets.get(value);
  item.count++;
  item.files.add(path.relative(root,file).split(path.sep).join("/"));
}
for(const file of files){
  const source=fs.readFileSync(file,"utf8");
  for(const m of source.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)) add(m[1],file);
  for(const m of source.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) add(m[1],file);
}
const sorted=[...assets.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
console.log("NGP MEDIA ASSET INVENTORY");
console.log("Unique assets: "+sorted.length);
console.log("Total references: "+sorted.reduce((n,x)=>n+x[1].count,0));
for(const [url,item] of sorted){
  console.log(url+" | refs="+item.count+" | pages="+[...item.files].sort().join(", "));
}
