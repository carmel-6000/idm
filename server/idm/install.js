///DEPRECATED, do not execute.


const fs = require('fs');
const appRoot = require('app-root-path');
const mkdirp = require('mkdirp');

mkdirp.sync(appRoot + '/onsite-config');

try {
  fs.copyFileSync(
    './onsite-config/idmIdpConfig.json',
    appRoot + '/onsite-config/idmIdpConfig.json',
    fs.constants.COPYFILE_EXCL
  );
  fs.copyFileSync(
    './onsite-config/idmClientConfig.json',
    appRoot + '/onsite-config//idmClientConfig.json',
    fs.constants.COPYFILE_EXCL
  );
} catch (err) {
  console.log('error while copy config files ' + err);
}
