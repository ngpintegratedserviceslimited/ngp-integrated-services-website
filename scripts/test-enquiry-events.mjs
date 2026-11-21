#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
function run(scriptPath, hostname = "ngpintegratedservices.com", consent = "accepted") {
  const listeners = {}, calls = [];
  const window = { __ngpEnquiryEventsInstalled:false, location:{hostname,pathname:"/contact"}, localStorage:{getItem:()=>consent}, gtag:(...args)=>calls.push(args) };
  const document = { addEventListener:(name,callback)=>{listeners[name]=callback;} };
  vm.runInNewContext(fs.readFileSync(scriptPath,"utf8"),{window,document});
  if(listeners.click) for(const href of ["tel:+2349012532054","https://wa.me/2348162371966"]) {
    const link={getAttribute:()=>href}; listeners.click({target:{closest:()=>link}});
  }
  if(listeners.submit) {
    const form={tagName:"FORM",id:"ngp-contact-form",checkValidity:()=>true,getAttribute:()=>"mailto:ngpintegratedserviceslimited@gmail.com"};
    listeners.submit({target:form}); listeners.submit({target:{...form,checkValidity:()=>false}});
  }
  return calls.map(([kind,name,params])=>({kind,name,params:JSON.parse(JSON.stringify(params))}));
}
const source="assets/js/ngp-enquiry-events.js", minified="assets/js/ngp-enquiry-events.min.js";
for(const [host,consent] of [["ngpintegratedservices.com","accepted"],["ngpintegratedservices.com","essential"],["www.ngpintegratedservices.com","accepted"]]) {
  assert.deepEqual(run(minified,host,consent),run(source,host,consent),"Readable/minified event behaviour differs");
}
assert.deepEqual(run(minified).map(x=>x.name),["phone_click","whatsapp_click","generate_lead"]);
console.log("PASS readable and minified enquiry scripts produce identical consent-aware events.");
