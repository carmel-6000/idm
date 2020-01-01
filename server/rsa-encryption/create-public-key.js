const NodeRSA = require('node-rsa');
const fs = require('fs');

const key = new NodeRSA();

key.generateKeyPair();

let publicKeyStr = key.exportKey('pkcs1-public');

 fs.writeFileSync('publicKey.txt',publicKeyStr);

 let privateKeyStr = key.exportKey('pkcs1');

 fs.writeFileSync('privateKey.txt',privateKeyStr);