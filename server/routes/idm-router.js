const idm = require('../idm');
var logUser = require('debug')('model:user');
const randomstring = require("randomstring");
const rsaEncryption = require("../rsa-encryption");
const PROD_ENV = "production";
module.exports = app => {

    app.get('/idmcallback', async (req, res) => {

        if (!req.query.code) {
            console.log("Missing query arg code");
            //next();
        }

        try {
            // explicitRedirectUri is an optional parameter, primarily for redirecting to localhost during development and testing

            let redirectedUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
            logUser("redirectedUrl?", redirectedUrl);
            let userInfo = await idm.fetchUserInfo(redirectedUrl);

            //Incoming data looks that way:
            //STUDENT:
            // let userInfo = {
            //   sub: '908febb59047954940b5908febb59047',
            //   isstudent: 'Yes',
            //   studentmakbila: '1',
            //   nickname: '12192121',
            //   name: 'המשתמש החדש והזמני',
            //   studentkita: '4',
            //   zehut: '12192121',
            //   given_name: 'אברהים',
            //   family_name: 'אבו עטא',
            //   studentmosad: '379842'
            // };

            //TEACHER
            // let x={ sub: 'cc1711c723783e4f1482cc1711c72378',
            // isstudent: 'No',
            // nickname: '0011463437',
            // name: 'יפית סמני',
            // zehut: '011463437',
            // given_name: 'יפית',
            // family_name: 'סמני',
            // orgrolecomplex: [ '667[Maarechet_hinuch:99999999]', '667[mosad:310300]' ] } +675ms

            let mosadsList = [];

            if (userInfo.orgrolecomplex && userInfo.orgrolecomplex.length > 1) {
                let temp;
                for (let i = 0; i < userInfo.orgrolecomplex.length; i++) { // loop over all the data, to have all the schools the teacer is teaching.
                    temp = userInfo.orgrolecomplex[i];
                    if (temp.includes('mosad')) {
                        mosadsList.push(temp.substr(temp.indexOf('[')).match(/\d/g).join(''))//extract mosad number
                    }
                }
                userInfo.studentmosad = JSON.stringify(mosadsList);
            }
            logUser("mosads list!! for teachers only:", mosadsList)

            const tz = rsaEncryption.encryptBase64(zehutFunctions.normalizeIdNum(userInfo.zehut));

            let userInfoForDb = {
                email: userInfo.sub + "@carmel.fake.com",
                realm: userInfo.name,
                username: userInfo.nickname,
                zehut: tz,
                studentClass: userInfo.studentkita,
                studentClassIndex: userInfo.studentmakbila,
                school: userInfo.studentmosad,
            };

            logUser("userInfo?!", userInfo, "\n");
            if (!userInfo) {
                //throw 'No data was fetched from IDM. Aborting login';
                logUser("ABORT>> no data.")
                return res.redirect("/");
            }

            let userRole = userInfo.isstudent === "Yes" ? 4 : 3; //student or teacher //TODO- get roles?

            app.models.CustomUser.registerOrLoginByUniqueField('zehut', userInfoForDb, userRole, (err, at) => {

                if (err) {
                    console.log("ERR", err)
                    res.redirect("/");
                    return;
                }

                logUser("back with from registerOrLoginByUniqueField with?", at, "\n\n");
                res.cookie('access_token', at.id, { signed: true, maxAge: 1000 * 60 * 60 * 5 });
                res.cookie('kl', at.__data.kl, { signed: false, maxAge: 1000 * 60 * 60 * 5 });
                res.cookie('klo', at.__data.klo, { signed: false, maxAge: 1000 * 60 * 60 * 5 });

                res.cookie('kloo', randomstring.generate(), { signed: true, maxAge: 1000 * 60 * 60 * 5 });
                res.cookie('klk', randomstring.generate(), { signed: true, maxAge: 1000 * 60 * 60 * 5 });
                res.cookie('olk', randomstring.generate(), { signed: true, maxAge: 1000 * 60 * 60 * 5 });

                let appDomain = app.get('APP_DOMAIN');
                return res.redirect(process.env.NODE_ENV == PROD_ENV ? appDomain : "http://localhost:3000/home");
            }, null,
                ['studentClass', 'studentClassIndex', 'school']);

        } catch (err) {
            console.log("err in idmcallback route", err);
        }

    });

}
const zehutFunctions = {
    normalizeIdNum(id, skipControlDigitCheck = false) {
        // Casting the ID to String (it might come numeric), and padding with zeroes in order to have 9 chars ID
        id = String(id).padStart(9, '0');
        if (skipControlDigitCheck || this.legalTz(id)) {
            return id;
        } else {
            throw { errorCode: 'ID_LAST_DIGIT_NOT_VALID' };
        }
    },

    legalTz(num) {
        var tot = 0;
        var tz = String(num);
        for (let i = 0; i < 8; i++) {
            let x = (((i % 2) + 1) * tz.charAt(i));
            if (x > 9) {
                x = x.toString();
                x = parseInt(x.charAt(0)) + parseInt(x.charAt(1));
            }
            tot += x;
        }

        if ((tot + parseInt(tz.charAt(8))) % 10 === 0) {
            return true;
        } else {
            return false;
        }
    }
}