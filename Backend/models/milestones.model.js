import mongoose, { Schema } from "mongoose";

const milestoneSchema = new mongoose.Schema({
    rewardPixels: {
        type: Number,
        default: 0,
    },
    title: {
        type: String,
        default: ""
    },
    condition: {
        type: String,
        default: ""
    },
    questionsToRevise: {
        type: Number,
        default:0
    },
    rewardAnimation: {
        type: Schema.Types.ObjectId,
        ref: 'Animation',
        default: null,
    },
    rewardTrophy: {
        type: String,
        default: null
    }
})

export const Milestone = mongoose.model('Milestone',milestoneSchema)