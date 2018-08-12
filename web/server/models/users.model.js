import mongoose from 'mongoose'
import idvalidator from 'mongoose-id-validator'

const Schema = mongoose.Schema;

var UsersSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    created_on: {
        type: Date,
        default: Date.now
    },
});

UsersSchema.plugin(idvalidator);

module.exports = mongoose.model('User', UsersSchema);
