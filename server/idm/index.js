const appRoot = require('app-root-path');
const { Issuer } = require('./modules/openid-client');
const idmIdpConfig = require('./onsite-config/idmIdpConfig.json');
const idmClientConfig = require('./onsite-config/idmClientConfig.json');
const url = require('url');

let idmIssuer = null;
let client = null;

idmIssuer = new Issuer({
  issuer: idmIdpConfig.issuer,
  authorization_endpoint: idmIdpConfig.authorization_endpoint_uri,
  token_endpoint: idmIdpConfig.token_endpoint_uri,
  userinfo_endpoint: idmIdpConfig.user_info_endpoint_uri,
  jwks_uri: idmIdpConfig.jwks_uri,
});

client = new idmIssuer.Client({
  client_id: idmClientConfig.client_id,
  client_secret: idmClientConfig.client_secret,
  token_endpoint_auth_method: idmClientConfig.token_endpoint_auth_method,
  id_token_signed_response_alg: idmClientConfig.id_token_signed_response_alg
}); // => Client

// module.exports.logOut = async function () {
//   console.log('so how do i logout?')
//   client.endSessionUrl({
//     state: 'yay'
//     // post_logout_redirect_uri: '...', // OPTIONAL, defaults to client.post_logout_redirect_uris[0] if there's only one
//     // state: '...', // RECOMMENDED
//     // id_token_hint: '...', // OPTIONAL, accepts the string value or tokenSet with id_token
//   });
// }

client['CLOCK_TOLERANCE'] = idmIdpConfig.CLOCK_TOLERANCE;

/**
 * start an open id session id the client is not authorized yet then
 * a login page url will be return otherwise the redirect uril will be return
 */
module.exports.startOpenIdSession = async function (explicitRedirectUri = null, state = null) {

  let authUrlRequestData = {
    redirect_uri: explicitRedirectUri || idmClientConfig.redirect_uri,
    scope: idmClientConfig.authorization_scope,
  };
  if (state) {
    authUrlRequestData.state = state;
  }

  let url = await client.authorizationUrl(authUrlRequestData);

  return url;
}

module.exports.processCodeCallBack = async function (redirectUri, explicitRedirectUri = null) {
  let urlObject = url.parse(redirectUri, true)
  let tokenSet = await client.authorizationCallback(explicitRedirectUri || idmClientConfig.redirect_uri,
    urlObject.query, {});
  return tokenSet;
}

/**
 * request token from the code in the redirectedUrl 
 * and then request the user info and return it
 * @param {*} redirectedUrl the redirect url that was received with IDM callback and then sent from the client
 * @param {*} explicitRedirectUri allows to explicitly specify callback URL by the client
 * while overriding the settingsin the config, usually for testing.
 * Please note that the callback, even it's under localhost, still has to be predefined on IDM side.
 */
module.exports.fetchUserInfo = async function (redirectedUrl, explicitRedirectUri = null, accessToken = null) {

  let userInfo = null;
  if (!accessToken) {
    // If the logic was made via a deep link, the URL might contain a 'state parameter,
    // carried over from the previous phase of the login (i.e. when we were getting the code).
    // The state parameter must be cleared from the URL's parameters, otherwise we'll get an error from IDM.
    redirectedUrl = removeParameterFromUrl(redirectedUrl, 'state');
    let token = await this.processCodeCallBack(redirectedUrl, explicitRedirectUri);
    if (token) {
      userInfo = await client.userinfo(token.access_token);
    }
  } else {
    userInfo = await client.userinfo(accessToken);
  }
  return userInfo;
}

// This is for backward compatibility, due to a typo in a previous version
module.exports.fechUserInfo = async function (redirectedUrl, accessToken = null) {
  return await this.fetchUserInfo(redirectedUrl, null, accessToken);
}

module.exports.callbackParams = client.callbackParams;

module.exports.utils = {};
module.exports.utils.userInfo = require('./managers/user-info-manager');

function removeParameterFromUrl(url, parameter) {
  return url
    .replace(new RegExp('[?&]' + parameter + '=[^&#]*(#.*)?$'), '$1')
    .replace(new RegExp('([?&])' + parameter + '=[^&]*&'), '$1');
}