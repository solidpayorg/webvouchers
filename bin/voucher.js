#!/usr/bin/env node

// parse command line
const minimist = require('minimist')
const fetch = require('node-fetch')

const opts = minimist(process.argv.slice(2))
const args = opts._

const server = opts.server || 'https://localhost:5010'
const cert = opts.cert
const voucher = opts.voucher
const request = opts.request

var action = args[0] || 'ping'
// console.log('action', action)

if (action === 'ping') {
  var uri = server
  // get channel balance
  fetch(uri)
    .then(res => res.text())
    .then(body => console.log(body))
} else if (action === 'balance') {
  var uri = server + (voucher ? '/balance?voucher=' + voucher : '/')
  // get channel balance
  fetch(uri)
    .then(res => res.text())
    .then(body => console.log(body))
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
}

// curl --cert ~/s/webids.pem --key ~/s/webids.pem -X GET -H 'Content-Type : application/x-www-form-urlencoded' --data 'request=lnbc8880n1pw4nsqapp5f40ps55l6a7gtlphru9kpd9gcj54mnkdhfxemsqgnuyhqsg05kwsdqqxqyz5vqcqzysrzjqvp62xyytkuen9rc8asxue3fuuzultc89ewwnfxch70zf80yl0gpjzyhg5qqj6sqqqqqqqqqqqqqqqqqrclceftv8cf5tdev6xet0zk6v0nz7d5han3sl9wyftx2kkzezr3vv89ksmf9lnkqwsgj3ah2u346lpgxxdsu4ndqxpmcjnljsav97q43cqyjhpxf' 'https://melvincarvalho.com:5010/balance'
