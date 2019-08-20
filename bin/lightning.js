const webid = require('webid')('tls')
const https = require('https')
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const lnService = require('ln-service')

// init
const port = process.env.PORT || 5010

// get creds
const macaroonPath =
  process.env.HOME + '/.lnd/data/chain/bitcoin/mainnet/admin.macaroon'
const tlsPath = process.env.HOME + '/.lnd/tls.cert'

const macaroon = fs.readFileSync(macaroonPath).toString('base64')
const tls = fs.readFileSync(tlsPath).toString('base64')

// get ln service
const { lnd } = lnService.authenticatedLndGrpc({
  cert: tls,
  macaroon: macaroon,
  socket: '127.0.0.1:10009'
})

var amount = 999

/**
 * getBalance
 *
 * @param {string} webId of theuser
 */
function getBalance (user) {
  return ledger[user]
}

// get ledger
var ledger = require('./ledger.json')
var user = process.env.WEBID || 'https://melvincarvalho.com/#me'
var balance = getBalance(user)
console.log('ledger', ledger)

var options = {
  key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('fullchain.pem'),
  requestCert: true,
  rejectUnauthorized: false
}

var app = express()
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)

app.use(function (req, res, next) {
  if (!req.client) {
    return res.status(401).send('No client cert')
  }

  var cert = req.socket.getPeerCertificate()
  console.log(cert)
  webid.verify(cert, (err, res) => {
    console.log('webid', res)
    user = res
  })

  next()
})

app.get('/channel', (req, res) => {
  lnService.getChannelBalance({ lnd }, (err, result) => {
    res.send('<pre>channel balance is \n' + result.channel_balance)
  })
})

// info
app.get('/info', (req, res) => {
  lnService.getWalletInfo({ lnd }, (err, result) => {
    res.send('<pre>public key is : \n' + result.public_key)
  })
})

// balance
app.get('/balance', (req, res) => {
  res.send(`<pre>user : ${user}\nbalance : ${balance}`)
})

// index
app.get('/index', (req, res) => {
  var output = `Balance : <a href="/balance">Balance</a><br />`
  output += `Pay : <a href="/pay">Pay</a><br />`
  res.send(`${output}`)
})

// pay with get -- dangerous
// app.get('/pay', (req, res) => {
//   const request = req.query.request
//   console.log('request', request)
//   if (!request) {
//     res.send('add a payment request')
//     return
//   }
//   lnService.decodePaymentRequest({ lnd, request: request }, (err, result) => {
//     console.log('decoded', result)
//     amount = result.tokens
//     if (amount > ledger[user]) {
//       console.log('not enough funds')
//       res.send('not enough funds')
//       return
//     }
//     ledger[user] -= amount
//     console.log('ledger', ledger)
//     // @@ not concurrent for now
//     fs.writeFileSync('./ledger.json', JSON.stringify(ledger))
//     lnService.payViaPaymentRequest({ lnd, request: request }, (err, result) => {
//       res.send(
//         `<pre>request = ${request} \n\n${result ? result.toString() : ''}\n\n${
//           err ? err.toString() : ''
//         }`
//       )
//     })
//   })
// })

// pay with post
app.post('/pay', (req, res) => {
  // console.log('request', req.body)
  const request = req.body.request
  const destination = req.body.destination
  let amount = parseInt(req.body.amount)
  let voucher = req.body.voucher
  let balance = parseInt(ledger[user])
  console.log('request', request)
  console.log('destination', destination)
  console.log('amount', amount)
  console.log('balance', balance)
  console.log('user', user)
  console.log('voucher', voucher)
  const VOUCHER_REGEX = /^urn:voucher:/
  if (voucher && voucher.match(VOUCHER_REGEX)) {
    user = voucher
  }
  if (!user) {
    console.log('no user found')
    res.send('no user found')
    return
  }
  if (destination && amount) {
    if (amount > balance) {
      console.log('not enough funds')
      res.send('not enough funds')
      return
    }
    // transfer code here
    ledger[destination] = parseInt(ledger[destination]) || 0
    ledger[destination] += amount
    ledger[user] -= amount
    fs.writeFileSync('./ledger.json', JSON.stringify(ledger))
    res.send(
      'transfer successful, new balances : ',
      user,
      ledger[user],
      destination,
      ledger[destination]
    )
    console.log('new ledger', ledger)
    return
  }
  if (!request) {
    console.log('no request found')
    res.send('add a payment request')
    return
  }
  console.log('request', request)
  lnService.decodePaymentRequest({ lnd, request: request }, (err, result) => {
    console.log('decoded', result)
    if (err) {
      console.error(err)
      res.send(err)
      return
    }
    console.log('decoded', result)
    if (!result) {
      console.log('could not decode', request)
      res.send('could not decode', request)
      return
    }
    let amount = result.tokens
    if (!ledger) {
      console.log('cant find ledger')
      res.send('cant find ledger')
      return
    }
    if (!user || !ledger[user]) {
      console.log('cant find user')
      res.send('cant find user')
      return
    }
    if (amount > ledger[user]) {
      console.log('not enough funds')
      res.send('not enough funds')
      return
    }
    ledger[user] -= amount
    console.log('ledger', ledger)
    // @@ not concurrent for now
    fs.writeFileSync('./ledger.json', JSON.stringify(ledger))
    lnService.payViaPaymentRequest({ lnd, request: request }, (err, result) => {
      if (err) {
        console.error(err)
        res.send(err)
        return
      }
      res.send(
        `<pre>request = ${request} \n\n${result ? result.toString() : ''}\n\n${
          err ? err.toString() : ''
        }`
      )
    })
  })
})

app.get('/', function (req, res) {
  res.send('hello worlds')
})

https.createServer(options, app).listen(port, function () {
  console.log('Solidpay server running at : https://localhost:' + port + '/')
})
