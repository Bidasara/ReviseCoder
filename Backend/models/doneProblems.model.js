import mongoose, { SchemaTypes } from "mongoose";
import { Schema } from "mongoose";

const doneProblemsSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    problems: [{
        problemId: {
            type: Schema.Types.ObjectId,
            ref: 'Problem'
        },
        status: {
            type: String,
            enum: ['solved', 'revising', 'mastered', 'unsolved'],
            default: 'unsolved'
        },
        nextRevisionDate: {
            type: Date,
            default: null
        },
        interval: {
            type: Number,
            default: 1
        },
        notes: {
            type: String,
            default: ''
        },
    }]
});

export const DoneProblem = mongoose.model('DoneProblem',doneProblemsSchema)