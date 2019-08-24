#!/usr/bin/env node

// parse command line

// requires
const minimist = require('minimist')
const fetch = require('node-fetch')

// getopts
const opts = minimist(process.argv.slice(2))
const args = opts._

// init
const cert = opts.cert
const request = opts.request || args[1]
var voucher = args[0]
var server = opts.server || 'https://melvincarvalho.com:5010'

// init method
var method = opts.method || 'balance'
if (!voucher) {
  method = 'ping'
}
if (request) {
  method = 'pay'
}

// init voucher
if (voucher && !voucher.match(/:/)) {
  voucher = 'urn:voucher:' + voucher
}
// console.log('method', method)

// ping
if (method === 'ping') {
  // get channel balance
  fetch(server)
    .then(res => res.text())
    .then(body => console.log(body))
    .catch(err => console.error(err))

  // balance
} else if (method === 'balance') {
  server = server + (voucher ? '/balance?voucher=' + voucher : '/')
  // get channel balance
  fetch(server)
    .then(res => res.text())
    .then(body => console.log(body))
    .catch(err => console.error(err))

  // pay
} else if (method === 'pay') {
  server = server + '/pay'
  // pay
  // console.log('pay')
  fetch(server, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'voucher=' + voucher + '&request=' + request
  })
    .then(res => res.text())
    .then(body => console.log(body))
    .catch(err => console.error(err))
}
