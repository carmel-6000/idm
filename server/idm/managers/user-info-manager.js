const EDU_WORKER_ROLE_REGEX = '([^0-9]|^)667([^0-9]|$)'; // edu worker role (TEACHER role)

let fields = {
    SUR_NAME_FIELD : 'family_name',
    FIRST_NAME_FIELD : 'given_name',
    STUDENT_SCHOOL_ID_FIELD : 'studentmosad',
    STUDENT_GRADE_FIELD  : 'studentkita',
    STUDENT_CLASS_NUMBER_FIELD  : 'studentmakbila',
    ORG_ROLE_SIMPLE_FIELD : 'orgrolessimple',
    ORG_ROLE_COMPLEX_FIELD : 'orgrolecomplex',
    ZEHOT_FIELD: 'zehut'
}; 

module.exports.fields = fields;

module.exports.getUserId = function(userInfo){
    let zehot = null;

    zehot = module.exports.searchFieldInUserinfo(userInfo, fields.ZEHOT_FIELD);
    return zehot;
}

/**
 * check if the user info that is provided is TEACHER
 * @param {*} userInfo 
 */
module.exports.isTeacher = function (userInfo) {
    let orgRoleObject = this.searchFieldInUserinfo(userInfo, fields.ORG_ROLE_COMPLEX_FIELD);

    if (!orgRoleObject) {
        return false;
    }
    //check if the role is array
    if (orgRoleObject.__proto__ == Array.prototype) {
        for (curRole of orgRoleObject) {
            // check if we found the role number for edu worker
            if (curRole.search(EDU_WORKER_ROLE_REGEX) >= 0) {
                return true;
            }
        }

    }
    else {
        // check if we found the role number for edu worker
        if (orgRoleObject.search(EDU_WORKER_ROLE_REGEX) >= 0) {
            return true;
        }
    }
    return false;
}

module.exports.searchFieldInUserinfo =  function searchFieldInUserinfo(userInfo,fieldToSearch){
    let fieldFound = null;

    if(userInfo){
        //  fieldFound = Object.keys(userInfo).find(checkField(element,fieldToSearch))
         let fieldKey = Object.keys(userInfo).find(field => field.endsWith(fieldToSearch));
         if(fieldKey){
             fieldFound = userInfo[fieldKey];
         }
    }
    return fieldFound;
}