const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib')
const check = require('../libs/checkLib')
const passwordLib = require('../libs/passwordLib');
const token = require('../libs/tokenLib');


/* Models */
const authModel = mongoose.model('Auth');
const UserModel = mongoose.model('User');


// start user signup function 

let signUpFunction = (req, res) => {

    let validateUserInput = () => {
        return new Promise((resolve,reject)=>{
            if(req.body.email){
                if(!validateInput.Email(req.body.email)){
                    let apiresponse = response.generate(true,'Email id not valid',403,null);
                     reject(apiresponse);
                }else if(check.isEmpty(req.body.password)){
                    let apiresponse = response.generate(true,'Password missing',403,null);
                     reject(apiresponse);
                }else
                {
                    resolve(req)
                }
            }else{
                logger.error('One or more parameter missing', 'UserController:signUpFunction',8);
                let apiresponse = response.generate(true,'Email id missing',403,null);
                reject(apiresponse);

            }
        }) // Primise ends here
    } // Validate user input ends here

    //Create user 
    let createUser = () => { 
        return new Promise((resolve,reject)=>{
            UserModel.findOne({email:req.body.email})
            .exec((err,retrievedUserDetails)=>{
                if(err){
                    console.log(err);
                    let apiResponse = response.generate(true,'Unable to create user',403,null);
                    reject(apiResponse);
                }else if(check.isEmpty(retrievedUserDetails)){
                    let newUser = new UserModel({
                        userId      :shortid.generate(),
                        firstName   : req.body.firstName,
                        lastName    : req.body.lastName || '',
                        password    : passwordLib.hashpassword(req.body.password),
                        email       :req.body.email,
                        mobileNumber:req.body.mobileNumber,
                        createdOn   : time.now()
                      }); 
                      newUser.save((err,newuser)=>{
                        if(err){
                            let apiResponse = response.generate(true,'Unable to create user',403,null);
                             reject(apiResponse);
                        }else{
                            let newUserObj = newuser.toObject();
                            resolve(newUserObj);
                        }
                      }) //Saving new user
                }else{
                            logger.error('User cannot be created','UserController : createUser',10)
                             let apiResponse = response.generate(true,'User already exists',403,null);
                             reject(apiResponse);
                }
            }) //Checking user ends here
        }) //Promise ends here
    } // End of create user


    // Calling primise functions
    validateUserInput()
    .then(createUser)
    .then((resolve) =>{
        delete resolve.password;
        delete resolve._id;
        delete resolve.__v;
        let apiresponse = response.generate(false,'User created',200,resolve);
        res.send(apiresponse);
    })
    .catch(err => {
        console.log(err);
        res.send(err);
    })

}// end user signup function 

// start of login function 
let loginFunction = (req, res) => {

    let finduser = () =>{
        console.log('findUser called');
        return new Promise((resolve,reject) => { 
        if(req.body.email){
            
            UserModel.findOne({email:req.body.email},(err,userDetails)=> {
                if(err){
                    logger.error('Cant retrieve user details','UserCotroller:findUser()',10);
                    let apiResponse = response.generate(true,'Unable to retrieve user data',403,null);
                    reject(apiResponse);
                }else if(check.isEmpty(userDetails)){
                    let apiResponse = response.generate(true,'User not Found',403,null);
                    reject(apiResponse);
                }else{
                    resolve(userDetails);
                }

            }); //Find user Mongo DB function 
        
        } else{
            let apiResponse = response.generate(true,'Parameter Missing',403,null);
             reject(apiResponse);
        }// Main IF ELSE Function
    }); //End of Promises
    
    } //End of find user function

    let validatePassword = (retrievedUserDetails) => {
        console.log('validatePassword Called')
        return new Promise((resolve,reject)=>{
            passwordLib.comparePassword(req.body.password,retrievedUserDetails.password,(err,isMatch)=>{
                if(err){
                    let apiResponse = response.generate(true,'Login failed',403,null);
                    reject(apiResponse);
                }else if(isMatch){
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject();
                    delete retrievedUserDetailsObj.password;
                    delete retrievedUserDetailsObj._id;
                    delete retrievedUserDetailsObj.__v;
                    delete retrievedUserDetailsObj.createdOn;
                    resolve(retrievedUserDetailsObj);
                }else{
                    let apiResponse = response.generate(true,'Login failed due to invalid Password',403,null);
                    reject(apiResponse);
                }
            }) //Comparing passwords
        }) //Promise ends here

    } // Validate Password ends here 

    let generateToken = (userDetails) => {
        console.log('Generate token Called');
        return new Promise((resolve,reject)=>{
            token.generateToken(userDetails,(err,tokenDetails)=>{
                if(err){
                    let apiResponse = response.generate(true,'Token generation failed',403,null);
                    reject(apiResponse);
                }else{
                    tokenDetails.userId         = userDetails.userId;
                    tokenDetails.userDetails    = userDetails;
                    resolve(tokenDetails);
                }
            }) // Calling Token Generation library
        }) //Promise ends here
    } //Token Generation function ends here



    //Save Token function starts here
    let saveToken = (tokenDetails) =>{


        console.log('Save token Called ' +tokenDetails);
        return new Promise((resolve,reject)=>{ 
        authModel.findOne({userId:tokenDetails.userId},(err,retrievedTokenDetails)=>{
            if(err){
                let apiResponse = response.generate(true,'Token generation failed',403,null);
                    reject(apiResponse);
            }else if(check.isEmpty(retrievedTokenDetails)){
                let newAuthModel = new authModel({
                    userId              : tokenDetails.userId,
                    authToken           : tokenDetails.token,
                    secretKey           : tokenDetails.tokenSecret,
                    tokenGenerationTime : time.now() 
                });

                newAuthModel.save((err,newTokenDetails)=>{
                    if(err){
                        let apiResponse = response.generate(true,'Token generation failed',403,null);
                        reject(apiResponse);
                    }else{
                        let responseBody =  {
                        authToken   : newTokenDetails.token,
                        userDetails : tokenDetails.userDetails
                        }
                        logger.info("New Token model created",'',10);
                        resolve(responseBody);
                    } //Inner else ends here
                }) // Saving new auth Model ends here

            }else{
                console.log("tokenDetails-- "+tokenDetails.token);
                retrievedTokenDetails.authToken             = tokenDetails.token;
                retrievedTokenDetails.tokenSecret           = tokenDetails.tokenSecret;
                retrievedTokenDetails.tokenGenerationTime   = time.now();
                retrievedTokenDetails.save((err,newTokenDetails)=>{
                    if(err){
                        let apiResponse = response.generate(true,'Token generation failed',403,null);
                         reject(apiResponse);
                    }else{
                            console.log("NewTokenDetials "+newTokenDetails);
                        let responseBody = {
                            authToken   : newTokenDetails.authToken,
                            userDetails : tokenDetails.userDetails
                        }
                    
                        logger.info("Token model data updated",'',10);
                        resolve(responseBody);
                    }
                }) // Token Updation 
            }  // Main If else ends here 
        }) // Finding existing token data
    });// Promise ends here
    } //End of save token function

        finduser(req,res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then(resolve=>{
            console.log(resolve);
            let apiResponse = response.generate(false,'User Login successfull',200,resolve);
            res.status(200);
            res.send(apiResponse);
        })
        .catch(err=>{
            res.status(err.status);
            res.send(err);
        })


    
} //End of Login Function


// end of the login function 


let logout = (req, res) => {

    console.log(req);

    authModel.remove({userId:req.user.userId},(err,result)=>{
        if(err){
            let apiResponse = response.generate(true,"Server error,Unable to logged out",403,result);
            res.send(apiResponse);
        }else if(check.isEmpty(result)){
            let apiResponse = response.generate(false,"Some error occured,please try again",403,result);
            res.send(apiResponse);

        }else{
            let apiResponse = response.generate(false,"Logged out successfully",200,result);
            res.send(apiResponse);
        }
    })

  
} // end of the logout function.



// View All users 
let getAllUser = (req,res)=>{
    UserModel.find((err,userData)=>{
        if(err){
            let apiResponse = response.generate(true,'User data cant be retrieved',403,null);
            res.send(apiResponse); 
        }else if(check.isEmpty(userData)){
            let apiResponse = response.generate(true,'User Data not found',403,null);
            res.send(apiResponse); 
        }else{
    
            let apiResponse = response.generate(false,'User Details fetched',200,userData);
            res.send(apiResponse);
        }
    })
    .select('-__v -_id -password -createdOn');
} // Get all function ends heres


//Verify token 
let verifyTokens = (req,res)=>{

    let decodedToken = token.decodeToken(req.body.token);
    console.log(decodedToken);

    // token.verifyToken(req.body.token,req.body.key,(err,result)=>{
    //     if(err){
    //         console.log(err);
    //         let apiResponse = response.generate(true,'Token verification error',404,null);
    //         res.send(apiResponse);

    //     }else{
    //         let apiResponse = response.generate(false,'Token verified',404,result);
    //         res.send(apiResponse);
    //     }
    // })
} // verify token ends here

module.exports = {

    signUpFunction: signUpFunction,
    loginFunction: loginFunction,
    fetchAllUsers:getAllUser,
    verifyTokens :verifyTokens,
    logout: logout

}// end exports