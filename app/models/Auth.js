const mongoose = require('mongoose');
const time = require('../libs/timeLib');
const Schema = mongoose.Schema;

let auth = new Schema({
    userId : {
        type:String
    },
    authToken :{
        type:String
    },
    secretKey : {
        type:String
    },
    tokenGenerationTime : {
        type:Date,
        default:time.now()
    }
});

mongoose.model('Auth',auth);