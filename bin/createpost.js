#!/usr/bin/env node

const user = process.argv[3] || 'https://melvincarvalho.com/#me';
const time = new Date().toISOString();
const content = process.argv[2] 
const ms = Math.floor(Math.random() * 1000);
const uri = time.substring(0,4) + time.substring(5,7) + time.substring(8,10) + time.substring(11,13) + time.substring(14,16) + time.substring (17,19) + "." + ms;
console.log(`
<> <http://purl.org/dc/terms/references> <#${uri}> .\n
\n
<#${uri}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://rdfs.org/sioc/ns#Post> .\n

<#${uri}> <http://purl.org/dc/terms/created> "${time}"^^<http://www.w3.org/2001/XMLSchema#dateTime> .\n
<#${uri}> <http://rdfs.org/sioc/ns#content> "${content}" .\n
<#${uri}> <http://xmlns.com/foaf/0.1/maker> <${user}> .\n
<#${uri}> <http://purl.org/dc/terms/creator> <${user}> .\n
<#${uri}> <http://www.w3.org/ns/mblog#author> <${user}> .\n
`);

