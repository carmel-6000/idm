# Idm Openid Nodejs

the package provide easy integration to the idm with openid
at nodejs env

## Getting Started

after the package will be installed config files will be created 
and fill with the relevant client and IDP info

the config files will be created at : app-root/config

it is recommended that you put all your other config files into that folder

first lets dive into the flow of the openid authorization
and speseficly authorization code exchange (wooo 👻👻👻)

 1. the start the authorization request and recive url send it to the client
 2. the client redirected to the login page of the IDP
 3. the user insert the credentials to the login page
 4. the client recive the code and send it back to the server
 5. the server request token from the IDP with the code
 6. then the server can request user info with the token
 
 with the user info you can identify the user


diagram :
https://www.draw.io/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=Untitled%20Diagram.html#R5VpNc5swEP01vnYAgT%2BOjZu2h3amMzm0PSoggxoZuUKO7f76rkACS8JNJgHHSX2wYdHnvn1PK%2BEJWq73nwTeFF95RtgkCrL9BH2YRFEYRFP4UZZDY4mDRWPIBc10oc5wQ%2F8QU1NbtzQjlVVQcs4k3djGlJclSaVlw0LwnV1sxZnd6wbnxDPcpJj51u80k0VjnUezzv6Z0LwwPYdTPb81NoX1TKoCZ3x3ZELXE7QUnMvmar1fEqacZ%2FzS1Pt44mk7MEFK%2BZgK6pmqcY%2FZVk9uWxEBlhKGAN7aygKaoimWJJtEUwatXt3C82murvQk5MF4hmTgKH3LhSx4zkvMrjvrleDbMiOq%2BwDuCrlmcBnCJcO3hF3h9C6viyw546JuFK3qDxT5RaQ86HCAkXEwdZ184XxjNcVFRsRRM0H9gcf3RKgZsfeM5iU8k6qinouawElfalPFtyLVpbT%2FJBY50aUWLY5AAMLXRIoDFBGEYUnv7daxjsS8LdeBBRcar37s4vAUdgo1LsBPbwaywcCJ4jOh4xNryagarIdIBeNTXAOmwTffkLJpxi9Iqory8jGYMgZaqLDbFVSSmw2uXbIDObYRxNWmEcgV3SuEdVOKIWT%2Fb1f7PtQVopkWN63uRut2nVQutKk4Uklje47Tw6nndUEyKtQc1RoBX4zntDQa3%2BPJMfnyomRY%2BGQIZ88kg676jVMV2CYA4oUTAHFiN9GMQddy0G2H8SjAFx7eN0TcKxF8CrIvyhqUOKxJPNrMemgzG4A2EfLcaGiyo9B5%2FUQpUtAsMK4nXY6lJ5TuQtceGKs4%2FFBdvEvM7U%2Fd4yhUDGcjLEz9XEyQzUU0deJlOC6aWfVEUSO2l0S32KFbGPl0m%2FfQbT4E3fxV6twr0RjsCS3u1FR6YtoW99BjnKUKObkKcvEdjh5mVj0Z4SURIwkdj8R%2B%2BjYWMZCfNEt%2BV%2BfDgvzekur1rCnj7Gd61g10As7hNzS%2BvL%2FaXGvxcIyPlWshXwZWJC3a3Cqg5Yp3iVezKdQs%2BH8iHZljveNIR2eKdOQfrLzWSJ87gY7OGOh9Wc5FRvATQxT1hGhyrhD1d2xvJETj%2BflCNPbzDUHkVpSu8Aa%2BE3GZtaVs5a63wM2D9ESC95rDPvHDPn6uMvcn51MnNJJotHMkM6s3wCfkJDftadw5ND%2Fw3FiRmiht%2Fn5Mj0q72E52Up6pn5Xg69ZmTpjUG40Hj3AdNGwuPYDIEAC4e8oeAEI01hbKPxGlmXqDtzq4cmU53ZIwx4HgCml7qZIChNGIT8lLFesryphjwvoNWwojgPb9V29rmmXsFFFs4B6VZz5vWxDYZ0LtVvgh4AZZi%2FwV%2FRKPB1xN7luuBzoegNvuRXij6d3fCdD1Xw%3D%3D

# Start Openid Session

```
 const idm = require('idm-openid');
 await idm.startOpenIdSession(); // => url to be redirect to

```

# Get User Info

the fechUserInfo recive a url that contain the 
authorization code (send by the client)

```
 const idm = require('idm-openid');
 let userInfo =  await idm.fechUserInfo(redirectedUrl);

```


### Installing

npm install <this-git-repository>

after the package will be installed config files will be created 
and fill with the relevant client and IDP info

the config files will be created at : app-root/config

it is recommended that you put all your other config files into that folder

