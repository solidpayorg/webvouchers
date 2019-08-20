import React, { Component } from 'react'
import 'babel-polyfill'

/**
 * Gets sha256 string from string
 *
 * @param {string} str - A string to be hashed
 * @returns {Promise <string>} A promise of a sha256 hash of that string
 */
async function sha256 (str) {
  var bytes = new TextEncoder('utf-8').encode(str)
  const buf = await crypto.subtle.digest('SHA-256', bytes)
  return Array.prototype.map
    .call(new Uint8Array(buf), x => ('00' + x.toString(16)).slice(-2))
    .join('')
}

/**
 * Hex to bytes
 *
 * @param {string} str A hex string
 * @returns {int[]} An array of bytes
 */
function hexToBytes (str) {
  var result = []
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16))
    str = str.substring(2, str.length)
  }
  return result
}

/**
 * Get encoded point
 *
 * @param {*} pt
 * @param {*} compressed
 * @returns {int[]} Array of bytes
 */
function getEncoded (pt, compressed) {
  var x = pt.getX().toBigInteger()
  var y = pt.getY().toBigInteger()
  var enc = integerToBytes(x, 32)
  if (compressed) {
    if (y.isEven()) {
      enc.unshift(0x02)
    } else {
      enc.unshift(0x03)
    }
  } else {
    enc.unshift(0x04)
    enc = enc.concat(integerToBytes(y, 32))
  }
  return enc
}

/**
 * Get an EC Key from hash
 *
 * @param {string} hash
 * @returns ECKey
 */
function getECKeyFromHash (hash) {
  var eckey = new Bitcoin.ECKey(hexToBytes(hash))
  return eckey
}

/**
 * Get a private key address form hash
 *
 * @param {string} hash A hash
 * @param {string} addressType A string of compressed or uncompressed
 * @param {string} publicKeyVersion Version number of the public key
 * @returns {Bitcoin.Address} A bitcoin private key address
 */
function getPrivateKeyAddressFromHash (hash, addressType, publicKeyVersion) {
  const OFFSET = 128
  var payload = hexToBytes(hash)
  if (addressType === 'compressed') {
    payload.push(0x01)
  }
  var sec = new Bitcoin.Address(payload)
  sec.version = parseInt(publicKeyVersion) + OFFSET
  return sec
}

/**
 * Get public key from private
 *
 * @param {*} eckey
 * @param {*} addressType
 * @param {*} publicKeyVersion
 * @returns {Bitcoin.Address} A bticoin public key address
 */
function getPublicKeyFromPrivate (eckey, addressType, publicKeyVersion) {
  var curve = getSECCurveByName('secp256k1')
  var publicKey = {}
  var genPt = curve.getG().multiply(eckey.priv)
  if (addressType === 'uncompressed') {
    publicKey.pub = getEncoded(genPt, false)
  } else {
    publicKey.pub = getEncoded(genPt, true)
  }

  // get pub key hash
  publicKey.ripe160 = Bitcoin.Util.sha256ripe160(publicKey.pub)

  // get pub key address
  var address = new Bitcoin.Address(publicKey.ripe160)
  address.version = parseInt(publicKeyVersion)
  publicKey.address = address
  return publicKey
}

/**
 * Gets a key pair from a hash
 *
 * @param {*} hash
 * @param {*} addressType
 * @param {*} publicKeyVersion
 * @returns {*} A keypair
 */
function getKeyPairFromHash (hash, addressType, publicKeyVersion) {
  var keyPair = {}
  keyPair.hash = hash
  // get privkey from hash
  keyPair.privateKey = getECKeyFromHash(hash)

  // get privateKey address
  keyPair.privateKeyAddress = getPrivateKeyAddressFromHash(
    hash,
    addressType,
    publicKeyVersion
  )

  // get pub key from private
  keyPair.publicKey = getPublicKeyFromPrivate(
    keyPair.privateKey,
    addressType,
    publicKeyVersion
  )

  return keyPair
}

/**
 * Gets a key pair from a string using sha245 KDF
 *
 * @param {*} pw
 * @param {*} addressType
 * @param {*} publicKeyVersion
 * @returns {*} A key pair
 */
async function getKeyPairFromPW (pw, addressType, publicKeyVersion) {
  var hash = await sha256(pw, addressType, publicKeyVersion)
  var keyPair = getKeyPairFromHash(hash, addressType, publicKeyVersion)
  return keyPair
}

/**
 * Main body of brain app
 *
 * @class Body
 * @extends {React.Component}
 */
export default class Body extends React.Component {
  /**
   *Creates an instance of Body.
   * @param {*} props
   * @memberof Body
   */
  constructor (props) {
    super(props)
    this.state = {
      pw: '',
      sha256: '',
      publicKeyVersion: 0,
      addressType: 'uncompressed',
      timeTaken: 0,
      eckey: {}
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleSubmit (e) {
    e.preventDefault()
  }

  /**
   * handle all form changes
   *
   * @param {*} e
   * @memberof Body
   */
  async handleChange (event) {
    let startTime = new Date().getTime()
    var pw
    var target = event.target
    if (event.target) {
      var name = event.target.name
    }

    if (name === 'pw') {
      pw = event.target.value
      this.setState({ pw: pw })
    } else if (name === 'publicKeyVersion') {
      pw = this.state.pw
      this.setState({ publicKeyVersion: event.target.value })
    } else if (name === 'addressType') {
      pw = this.state.pw
      this.setState({ addressType: event.target.value })
    }

    var keyPair = await getKeyPairFromPW(
      pw,
      this.state.addressType,
      this.state.publicKeyVersion
    )

    // benchmark
    var timeTaken = new Date().getTime() - startTime

    // update state
    this.setState({
      sha256: keyPair.hash,

      privateKeyInt: keyPair.privateKey.priv,
      privateKeyAddress: keyPair.privateKeyAddress,

      publicKeyBytes: keyPair.publicKey.pub,
      ripe160: keyPair.publicKey.ripe160,
      publicKeyAddress: keyPair.publicKey.address,

      timeTaken: timeTaken
    })
  }

  /**
   * renders the form
   *
   * @returns
   * @memberof Body
   */
  render () {
    return (
      <section className='section'>
        <form onSubmit={this.handleSubmit}>
          <div className='columns'>
            <div className='column'>
              <select
                name='addressType'
                onChange={this.handleChange}
                value={this.state.addressType}
              >
                <option value='uncompressed'>
                  Uncompressed
                </option>
                <option value='compressed'>Compressed</option>
              </select>
              <select
                name='publicKeyVersion'
                onChange={this.handleChange}
                value={this.state.publicKeyVersion}
              >
                <option value='0'>
                  Bitcoin
                </option>
                <option value='85'>Bitmark</option>
                <option value='111'>Testnet3</option>
              </select>
              <hr />
              Passphrase
              <br />
              <input
                name='pw'
                size='60'
                type='text'
                placeholder='Enter passphrase'
                value={this.state.pw}
                onChange={this.handleChange}
                autoFocus
              />
              <br />
              <hr />
              Secret Exponent (sha256)
              <br />
              <input
                readOnly
                size='60'
                placeholder='Secret Exponent (sha256)'
                value={this.state.sha256}
              />
              <br />
              Secret Exponent (sha256) as Bytes
              <br />
              <input
                readOnly
                size='60'
                placeholder='Secret Exponent (sha256) as Bytes'
                value={hexToBytes(this.state.sha256)}
              />
              <br />
              ECDSA Private Key (BigInteger)
              <br />
              <input
                readOnly
                size='60'
                placeholder='ECDSA Private Key (BigInteger)'
                value={this.state.privateKeyInt}
              />
              <br />
              Private Key Base58 check Address
              <br />
              <input
                readOnly
                size='60'
                placeholder='Private Key Base58 check Address'
                value={this.state.privateKeyAddress}
              />
              <hr />
              ECDSA Public Key as Bytes
              <br />
              <input
                readOnly
                size='60'
                placeholder='ECDSA Public Key as Bytes'
                value={this.state.publicKeyBytes}
              />
              <br />
              Ripe 160 hash of Public Key as Bytes
              <br />
              <input
                readOnly
                size='60'
                placeholder='Ripe 160 hash of Public Key as Bytes'
                value={this.state.ripe160}
              />
              <br />
              Public Key Base58 check Address
              <br />
              <input
                readOnly
                size='60'
                placeholder='Public Key Base58 check Address'
                value={this.state.publicKeyAddress}
              />
              <br />
              <hr />
              Computed in : {this.state.timeTaken} ms
            </div>
          </div>
        </form>
      </section>
    )
  }
}
