import mongoose from "mongoose";

const listSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true, 
        trim: true
    },
    byAdmin: {
        type: Boolean,
        default: false
    },
    categories: [{
        title: {
            type: String, 
            required: true, 
            trim: true
        },
        problems: [{
            problemId: {
                type: mongoose.Schema.Types.ObjectId, ref: 'Problem', 
                required: true
            },
            status: {
                type: String,
                enum: ['solved', 'revising', 'mastered','unsolved'],
                default: 'unsolved'
            },
            notes: {
                type: String,
                default: ''
            }
        }]
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},{timestamps: true});

listSchema.index({ owner: 1, title: 1 }, { unique: true });

export const List = mongoose.model('List', listSchema);