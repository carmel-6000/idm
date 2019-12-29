const express = require('express');
const idmRouter = express.Router();
const jsonParser = require('body-parser').json();
const idm=require('./../modules/idm');

  idmRouter.post('/users/start-openid-session', jsonParser, async (req, res, next) => {
      try {
      // explicitRedirectUri is optional, and intended for custom redirections, required in case
      // the IDM login is performed in a popup window opened in PWA mode of the app.
        let url = await idm.startOpenIdSession(req.body.explicitRedirectUri);
        console.log("Url to redirect?",url);
        res.send({ url, success: true });
      } catch (err) {
        next(err);
      }
  });

  idmRouter.post('/users/login', jsonParser, async (req, res, next) => {
      console.log("users/login is invoked");
      try {
      // explicitRedirectUri is an optional parameter, primarily for redirecting to localhost during development and testing
        let userInfo = await idm.fetchUserInfo(req.body.redirectedUrl, req.body.explicitRedirectUri);
        
        console.log("userInfo?!",userInfo);
        if (!userInfo) {
          throw 'No data was fetched from IDM. Aborting login from the following redirectedUrl: ' + req.body.redirectedUrl;
        }
        //let clientData = await usersLogic.userLogin(userInfo);

        res.send({ success: true, ...userInfo });

      } catch (err) {
     next(err);
      }
    });

module.exports=idmRouter;