import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import dayjs from 'dayjs';

const userSchema = new Schema({
    username: {
        type: String,
        required: [true,'Username is required'],
        unique: true,
        lowercase: true,
        trim: true,
        minlength: [3,'Username must be at least 3 characters long'],
    },
    email: {
        type: String,
        required: [true,'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true,'Password is required'],
        minlength: [8,'Password must be at least 8 characters long'],
        select: false
    }, 
    lists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List'
    }],
    avatar: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user','admin'],
        default: 'user'
    },
    lastLogin: {
        type: Date,
        default: null
    },
    streak: {
        type: Number,
        default: 0
    },
    lastRevised: {
        type: Date,
        default: null
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshToken: String,
    failedLoginAttempts: {
        type: Number,
        default: 0,
    },
    lockedUntil: {
        type: Date,
        default: null,
    },
    cart: [{
        type: Schema.Types.ObjectId,
        ref: 'Animation'
    }],
    pixels: {
        type: Number,
        default: 0
    },
    milestones: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: "Milestone"
        }],
        default: []
    },
    trophies: {
        type:[{
            type: String,
        }],
        default: []
    },
    doneProblemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DoneProblem'
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        default: null
    },
    todayPointLimit: {
        type: Number,
        default: 30,
    },
    todayPoints: {
        type: Number,
        default: 0,
    },
},{
    timestamps: true
});


userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.updateStreakOnRevision = async function () {
    const today = dayjs().startOf('day');
    const last = this.lastRevised ? dayjs(this.lastRevised).startOf('day') : null;

    if (!last || today.diff(last, 'day') > 1) {
        // Missed a day or never revised → reset streak
        this.streak = 1;
    } else if (today.diff(last, 'day') === 1) {
        // Streak continues
        this.streak += 1;
    } else {
        // Revised again on same day, streak remains
        return;
    }

    this.lastRevised = new Date(); // update to now
    await this.save();
};

//whenever fetching profile data or logging in, check if streak is expired
userSchema.methods.checkStreakExpiry = async function () {
    const today = dayjs().startOf('day');
    const last = this.lastRevised ? dayjs(this.lastRevised).startOf('day') : null;

    if (!last || today.diff(last, 'day') > 1) {
        this.streak = 0;
        await this.save();
    }
};

userSchema.methods.isPasswordCorrect = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);