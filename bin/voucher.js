#!/usr/bin/env node

// parse command line
const minimist = require('minimist')
const fetch = require('node-fetch')

const opts = minimist(process.argv.slice(2))
const args = opts._

const server = opts.server || 'https://localhost:5010'
const cert = opts.cert
const voucher = opts.voucher

// get channel balance
fetch(server)
  .then(res => res.text())
  .then(body => console.log(body))
