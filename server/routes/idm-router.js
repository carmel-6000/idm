require('dotenv').config()
const idm = require('../idm');
var logUser = require('debug')('model:user');
const randomstring = require("randomstring");
const rsaEncryption = require("../rsa-encryption");

const IDM_ROLES = { STUDENT: 'student', TEACHER: 'teacher', none: 'SIMPLEUSER' };
module.exports = app => {
    const customConfig = app.get('modules').idm;

    app.get('/idmcallback', async (req, res) => {

        if (!req.query.code) {
            console.log("Missing query arg code");
            res.redirect('/');
        }

        try {
            // explicitRedirectUri is an optional parameter, primarily for redirecting to localhost during development and testing

            let redirectedUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
            logUser("redirectedUrl?", redirectedUrl);
            let userInfo = await idm.fetchUserInfo(redirectedUrl);

            let redirectUrl = req.query.state ? req.query.state : process.env.REACT_APP_DOMAIN ? process.env.REACT_APP_DOMAIN : "https://www.hilma.tech/";
            //Incoming data looks that way:
            //STUDENT:
            //{
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
            //{ sub: 'cc1711c723783e4f1482cc1711c72378',
            // isstudent: 'No',
            // nickname: '0011463437',
            // name: 'יפית סמני',
            // zehut: '011463437',
            // given_name: 'יפית',
            // family_name: 'סמני',
            // orgrolecomplex: [ '667[Maarechet_hinuch:99999999]', '667[mosad:310300]' ] } 


            if (userInfo.orgrolecomplex && userInfo.orgrolecomplex.length > 1) {
                userInfo.studentmosad = IdmDataFunctions.getTeacherSchoolsString(userInfo.orgrolecomplex);
                logUser("mosads list!! for teachers only:", userInfo.studentmosad)
            }

            const tz = rsaEncryption.encryptBase64(IdmDataFunctions.normalizeIdNum(userInfo.zehut));

            let userInfoForDb = {
                email: userInfo.sub + "@carmel.fake.com",
                realm: userInfo.name,
                username: userInfo.nickname,
                zehut: tz,
                studentClass: userInfo.studentkita,
                studentClassIndex: userInfo.studentmakbila,
                school: userInfo.studentmosad,
                firstName: userInfo.given_name,
                lastName: userInfo.family_name
            };
            for (key in customConfig.fields) {
                if (customConfig.fields[key].enabled) {
                    if (key !== customConfig.fields[key].saveAs) {
                        userInfoForDb[customConfig.fields[key].saveAs] = userInfoForDb[key];
                        delete userInfoForDb[key];
                    }
                }
                else
                    delete userInfoForDb[key];
            }

            logUser("userInfo?!", userInfo, "\n");
            if (!userInfo) {
                //throw 'No data was fetched from IDM. Aborting login';
                logUser("ABORT>> no data.")
                return res.redirect("/");
            }


            let rolesToFind = [IDM_ROLES.none, userInfo.isstudent === "Yes" ? IDM_ROLES.STUDENT : IDM_ROLES.TEACHER];
            let userRole, relevantRoles = await app.models.Role.find({ where: { name: { inq: rolesToFind } } }); //we dont use here findOne because it might give us the simpleuser instead of other role.
            logUser("try find roles: ", relevantRoles);
            if (relevantRoles.length === 1) userRole = relevantRoles[0].id;
            else if (relevantRoles.length) {
                userRole = relevantRoles.find(item => item.name.toLowerCase() === rolesToFind[1].toLowerCase()).id;
            }
            else {
                console.log("\nYOU MUST HAVE THESE ROLES FOR IDM, DUDE: TEACHER,STUDENT, or at least SIMPLEUSER.\n");
                return res.redirect("/");
            }

            logUser("role we try:", userRole);

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

                return res.redirect(redirectUrl);
            }, null,
                ['studentClass', 'studentClassIndex', 'school']);

        } catch (err) {
            console.log("err in idmcallback route", err);
        }

    });

}
const IdmDataFunctions = {
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
    },
    getTeacherSchoolsString(orgrolecomplex) {
        /** @param {Array} orgrolecomplex  */
        let temp, mosadsList = [];
        if (Array.isArray(orgrolecomplex))
            for (let i = 0; i < orgrolecomplex.length; i++) { // loop over all the data, to have all the schools the teacer is teaching.
                temp = orgrolecomplex[i];
                if (temp.includes('mosad')) {
                    mosadsList.push(temp.substr(temp.indexOf('[')).match(/\d/g).join(''))//extract mosad number
                }
            }
        else mosadsList = [];
        return JSON.stringify(mosadsList);
    }

}