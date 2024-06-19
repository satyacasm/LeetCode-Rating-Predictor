const mongoose=require('mongoose');
const Schema=mongoose.Schema;


const ContestSchema=new Schema({
    
    contestID:{
        type:String,
        required:true
    },
    username: {
        type: String,
        required: true,
      },
      ranking: {
        type: Number,
        required: true,
      },
});

module.exports=ContestRankings=mongoose.model('contestRankings',ContestSchema);