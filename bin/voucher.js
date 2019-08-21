#!/usr/bin/env node

// parse command line
const minimist = require('minimist')
const fetch = require('node-fetch')

const opts = minimist(process.argv.slice(2))
const args = opts._

const server = opts.server || 'https://localhost:5010'
const cert = opts.cert
const voucher = opts.voucher

var uri = server + (voucher ? '/balance?voucher=' + voucher : '/')

// get channel balance
fetch(uri)
  .then(res => res.text())
  .then(body => console.log(body))
