import mongoose from 'mongoose'
import idvalidator from 'mongoose-id-validator'

const Schema = mongoose.Schema;

var FileSchema = new Schema({
    filename: {
      type: String,
      required: true
    },
    length: {
    	type: Number,
      required: true
    },
    chunkSize: {
    	type: Number,
      required: true
    },
    date: {
    	type: Date,
    	required: true
    },
    md5: {
    	type: String,
    	required: true
    },
    contentType: {
    	type: String,
    	required: true
    }
});

module.exports = mongoose.model('fs.files', FileSchema);
