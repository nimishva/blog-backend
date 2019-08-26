const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const request = require("request");
const Auth = mongoose.model('Auth');

const logger = require('./../libs/loggerLib');
const response = require('./../libs/responseLib');
const token = require('./../libs/tokenLib');
const check = require('./../libs/checkLib');

let isAuthorized = (req,res,next) =>{
   if(req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken')) {
       console.log(req.header('authToken'));
    Auth.findOne({authToken:req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken')},(err,authDetails)=>{
        if(err){
        logger.error('Unable to retrieve Token details','AuthMiddleWare',10);
        let apiResponse = response.generate(true,'Unable to retrieve Token details',403,null);
        res.send(apiResponse);
        }
        else if(check.isEmpty(authDetails)){
            logger.error('Token details not found','AuthMiddleWare',10);
            let apiResponse = response.generate(true,'Token details not found',403,null);
            res.send(apiResponse);
        }else{
            token.verifyToken(authDetails.authToken,authDetails.secretKey,(err,decoded)=>{
               if(err){
                logger.error('Unable to retrieve Token details','AuthMiddleWare',10);
                let apiResponse = response.generate(true,'Unable to retrieve Token details',403,null);
                res.send(apiResponse);
               } else{
                   req.user = {userId: decoded.data.userId};
                   next();
               }
            }) // Verifying token
        }
    }) // Checking for Token ends here -- Mangoose
   } else {
        logger.error('Expired or Invalid Token','AuthMiddleWare',10);
        let apiResponse = response.generate(true,'Expired or Invalid Token',400,null);
        res.send(apiResponse);
   }//if else ends here
} //IsAuthorized ends here


module.exports = {
    isAuthorized :isAuthorized
}