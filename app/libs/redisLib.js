const check = require('./checkLib');
const redis = require('redis');
let client = redis.createClient({
    url:"redis://redis-11756.c90.us-east-1-3.ec2.cloud.redislabs.com:11756",
    password:'tsNrNM87acMnBbcO0j4faOdumPwKeXJr'
});

client.on('connect',()=>{
    console.log("Redis conneciton successfully opened");
}) 

let getAllUsersInHash = (hashName,callback)=>{
    client.HGETALL(hashName,(err,result)=>{
        if(err){
            console.log(err);
            callback(err,null);
        }else if(check.isEmpty(result)){
            console.log('Online user list is empty');
            callback(null,{});
        }else{
            console.log(result);
            callback(null,result);
        }
    })
} // Get all users


let setANewOnlineUserInHash = (hashName,key,value,callback) => {
    client.HMSET(hashName,[
        key,value
    ],(err,result)=>{
        if(err)
        {
            callback(err,null);
        }else{
            console.log('User has been set in the hash map');
            console.log(result);
            callback(null,result);
        }
    })
} // Set new user

let deleteUserFromHash = (hashName,key)=>{
    client.hdel(hashName,key,(err,_result)=>{

        console.log('Deleting user');
        if(err){
            console.log(err);
        }else{
            return true
        }
    });
}; // End of Delete Hash

module.exports = {

    getAllUsersInHash : getAllUsersInHash,
    setANewOnlineUserInHash : setANewOnlineUserInHash,
    deleteUserFromHash : deleteUserFromHash
}