#!/usr/bin/env node

// parse command line

// requires
const minimist = require('minimist')
const fetch = require('node-fetch')

// getopts
const opts = minimist(process.argv.slice(2))
const args = opts._

// init
const server = opts.server || 'https://localhost:5010'
const cert = opts.cert
const voucher = opts.voucher
const request = opts.request

// get action
var action = args[0] || 'ping'
var uri = server
// console.log('action', action)

// ping
if (action === 'ping') {
  // get channel balance
  fetch(uri)
    .then(res => res.text())
    .then(body => console.log(body))
    .catch(err => console.error(err))

  // balance
} else if (action === 'balance') {
  var uri = server + (voucher ? '/balance?voucher=' + voucher : '/')
  // get channel balance
  fetch(uri)
    .then(res => res.text())
    .then(body => console.log(body))
    .catch(err => console.error(err))

  // pay
} else if (action === 'pay') {
  var uri = server + '/pay'
  // pay
  // console.log('pay')
  fetch(uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'voucher=' + voucher + '&request=' + request
  })
    .then(res => res.text())
    .then(body => console.log(body))
    .catch(err => console.error(err))
}
