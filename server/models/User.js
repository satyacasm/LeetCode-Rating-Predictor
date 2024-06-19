const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const UserSchema=new Schema({
    username:{
        type:String,
        required:true
    },
    
    rating:{
        type:Number,
        required:true,
    },
    contestsCount:{
        type:Number,
        required:true
    }

});

module.exports=LCUser=mongoose.model('lc-user',UserSchema);