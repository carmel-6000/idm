# IDM Module
*5/1/2020*

1. make sure to have to most up-to-date version of Auth. make sure that you have the 'afterRemote(registerOrLoginByUniqueField)'.


2. add to your CustomUser table:
```
  `zehut` varchar(512) DEFAULT NULL,
  `school` varchar(255) DEFAULT NULL,
```

  and this to ***CustomUser.json***
```
   "zehut": {
      "type": "String",
      "required": false,
      "length": null,
      "precision": 10,
      "scale": 0,
      "mysql": {
        "columnName": "zehut",
        "dataType": "varchar",
        "dataLength": 512,
        "dataPrecision": 10,
        "dataScale": 0,
        "nullable": "Y"
      }
    },
    "school": {
      "type": "String",
      "required": false,
      "length": 65535,
      "precision": null,
      "scale": null,
      "mysql": {
        "columnName": "school",
        "dataType": "text",
        "dataLength": 65535,
        "dataPrecision": null,
        "dataScale": null,
        "nullable": "Y"
      }
    }
  
```


**Optional fields:**
these fields are not required for this module, and you can choose to add them. dont dorget to add also to ```CustomUser.json```.

```
 `student_class` int(5) unsigned DEFAULT NULL,
  `student_class_index` int(5) unsigned DEFAULT NULL,
  `first_name` varchar(50) default NULL,
  `last_name` varchar(50) default NULL

  ```
**You can also rename there fields**. For example, if you want rename *school* to *schoolCode*, you can use the config and set 
```{"saveAs":"schoolCode"}```



3. add to ***model-config*** in module-loader section:
```
    {
        "name": "idm",
        "path": "../src/modules/idm",
        "routes": "server/routes",
        "github": "https://github.com/carmel-6000/idm.git",
        "enabled":true
      }
```

4. add to ***package.json*** : 
```
    "got": "^8.3.2",
    "app-root-path": "^3.0.0",
    "node-jose": "^1.1.3",
    "node-rsa": "^1.0.7",
    "p-any": "^2.1.0",
    "oidc-token-hash": "^5.0.0",
```


  It is **VERY** imporatnt: if you have node err like this: ```err in idmcallback route TypeError: The `body`, `json` and `form` options are mutually exclusive```
  it means that your 'got' it not in this version. force it to be 8.3.2


5. Make sure to have *student* and *teacher* role in Role table.

6. cd into src/modules/idm/server/rsa-encryption and run : 
```
      node create-public-key.js
      mv publicKey.txt encryption/ 
```


7. run : ```npm run generate-config``` to set all configs. fill in your preferences in *server/config.json* and in *server/config.production.json*
**NOTICE**: if enabled is false, it will not save this field for you!

``` 
"firstName": {
          "enabled": false,
          "saveAs": "firstName"
        },
```

you can change the saveAs to your own column-name.


### To log out:
``` js
window.location.href = 'https://is.remote.education.gov.il/nidp/jsp/logoutSuccess.jsp'
```

