const NodeRSA = require('node-rsa');
const fs = require('fs');
const appRoot = require('app-root-path');
const constants = require('constants');
let publicKeyStr;
if (process.env.ENV && fs.existsSync(appRoot + `/env-config/${process.env.ENV}/publicKey.txt`)) {
    publicKeyStr = fs.readFileSync(appRoot + `/env-config/${process.env.ENV}/publicKey.txt`, 'utf8');
} else if (fs.existsSync(appRoot + '/onsite-config/publicKey.txt')) {
    publicKeyStr = fs.readFileSync(appRoot + '/onsite-config/publicKey.txt', 'utf8');
} else if (fs.existsSync(__dirname + '/encryption/publicKey.txt')) {
    publicKeyStr = fs.readFileSync(__dirname + '/encryption/publicKey.txt', 'utf8');
} else if (!fs.existsSync(appRoot + '/onsite-config/publicKey.txt')) {
    publicKeyStr = fs.readFileSync(appRoot + '/encryption/publicKey.txt', 'utf8');
} else {
    // in case of missing key, a guide for deployment and generating a key:
    // https://docs.google.com/document/d/1d6ZKXZ04WXnrhRqddn6qk8VAYQX-b2QvbelGwvvUCbc/edit
    console.error('Public key file missing!');
    throw 'Cannot start server: public key file missing!';
}

const publicKey = new NodeRSA(publicKeyStr, {}, { encryptionScheme: 'pkcs1' });
// publicKey['keyPair'].encryptionScheme.options.encryptionSchemeOptions.padding = constants.RSA_NO_PADDING;

publicKey.setOptions({ encryptionScheme: 'pkcs1', padding: constants.RSA_NO_PADDING })
publicKey['keyPair'].encryptionScheme.options.encryptionSchemeOptions.padding = constants.RSA_NO_PADDING;

/**
 * encrypt the provided string with the public key 
 * and output as a base64 encoding
 * @param {*} str 
 */
module.exports.encryptBase64 = function (str) {
    return publicKey.encrypt(str, 'base64');
}