import mongoose from "mongoose";

const animationSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    scale: {
        type: Number,
        required: true
    }, 
    pack: { 
        idle: {
            sprite: {
                type: String,
                required: true,
                trim: true
            },
            frames: {
                type: Number,
                required: true
            },
            frameWidth: {
                type: Number,
                required: true
            },
            frameHeight: {
                type: Number,
                required: true
            },
            fps: {
                type: Number,
                required: true
            }
        },
        attack: {
            sprite: {
                type: String,
                required: true,
                trim: true
            },
            frames: {
                type: Number,
                required: true
            },
            frameWidth: {
                type: Number,
                required: true
            },
            frameHeight: {
                type: Number,
                required: true
            },
            fps: {
                type: Number,
                required: true
            },
            delay: {
                type: Number
            }
        },
        break: {
            sprite: {
                type: String,
                required: true,
                trim: true
            },
            frames: {
                type: Number,
                required: true
            },
            frameWidth: {
                type: Number,
                required: true
            },
            frameHeight: {
                type: Number,
                required: true
            },
            fps: {
                type: Number,
                required: true
            },
            delay: {
                type: Number,
            }
        }
    },
    price: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    icon: {
        type: String,
        required: true,
    }
})

export const Animation = mongoose.model('Animation', animationSchema);
