const jwt       = require('jsonwebtoken');
const shortId   = require('shortid');
const secretKey = 'Be yourself everyone else is already taken';

let generateToken = (data,cb) => {

    try {
    let claims = {
        jwtid : shortId.generate(),
        iat   : Date.now(),
        exp   : Math.floor(Date.now() /1000) + (60 * 60 * 24),
        sub   : 'authToken',  
        iss   : 'auksChat',
        data  : data
    };

    let tokenDetails = {
        token         : jwt.sign(claims,secretKey),
        tokenSecret   : secretKey 
    };
    cb(null,tokenDetails);
}
catch(err){
    console.log(err);
    cb(err,null);
}
} //End of Generate Token

//Verify Claims

let verifyclaims = (token,key,cb) =>{
    jwt.verify(token,key,function(err,decoded){

        if(err){
            console.log("Secret Key "+ key);
            console.log('error while verifying token')
            console.log("Token verification error "+err);
            cb(err,null);
        }else{
            console.log('token verified');
            cb(null,decoded);
        }
    })//End of JWT verify 
} //End of verify claims


let verifyclaimsWithoutToken = (token,cb) =>{
    jwt.verify(token,secretKey,function(err,decoded){

        if(err){
            console.log('error while verifying token')
            console.log("Token verification error "+err);
            cb(err,null);
        }else{
            console.log('token verified');
            cb(null,decoded);
        }
    })//End of JWT verify 
} //End of verify claims




let decodeToken = (token) =>{
    return jwt.decode(token);
}


module.exports = {
    generateToken : generateToken,
    verifyToken : verifyclaims,
    verifyclaimsWithoutToken:verifyclaimsWithoutToken,
    decodeToken :decodeToken
}