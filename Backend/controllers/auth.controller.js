import { User } from '../models/user.model.js'
import { generateTokens, verifyRefreshToken } from '../utils/jwtUtils.js'
import crypto from 'crypto'
import { asyncHandler } from '../utils/asyncHandler.js'
import { DoneProblem } from '../models/doneProblems.model.js'
import { ApiError } from '../utils/apiError.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/apiResponse.js'
import nodemailer from 'nodemailer'
import dotenv from "dotenv"

dotenv.config({
    path: '../.env'
})

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'harshitbidasara@gmail.com',
        pass: process.env.EMAIL_PASS
    }
})

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, avatarLink } = req.body;

    const existingUser = await User.findOne({
        $or: [
            { username: username.toLowerCase() },
            { email: email.toLowerCase() }
        ]
    })

    if (existingUser)
        throw new ApiError(409, 'Username or email already exists');

    let avatarUrl;

    if (req.file) {
        const avatarLocalPath = req.file.path;
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (!avatar)
            throw new ApiError(500, 'Error uploading avatar to Cloudinary');
        avatarUrl = avatar.url;
    } else {
        avatarUrl = avatarLink;
    }
    const verificationCode = crypto.randomBytes(Math.ceil(11 / 2))
        .toString('hex')
        .slice(0, 11);
    const user = await User.create({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password,
        avatar: avatarUrl,
        verificationCode,
    })

    if (!user)
        throw new ApiError(500, 'Error creating user');
    const data = await DoneProblem.create({
        user: user._id
    })
    user.doneProblemId = data._id;
    await user.save();

    await transporter.sendMail({
        from: 'harshitbidasara@gmail.com',
        to: `${email}`,
        subject: 'Verify you identity',
        html: `<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><title>Account Verification</title><style>body {font-family: sans-serif;background-color: #f4f4f4;margin: 0;padding: 0;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;}.container {width: 100%;max-width: 600px;margin: 0 auto;background-color: #ffffff;border-radius: 8px;overflow: hidden;box-shadow: 0 4px 8px rgba(0,0,0,0.1);}.header {background-color: #000000;text-align: center;padding: 15px 0;}.header img {height: 30px;}.content {padding: 30px;color: #333333;}.content h1 {color: #000000;font-size: 24px;margin-top: 0;text-align: center;}.content p {font-size: 16px;line-height: 1.5;text-align: center;}.verification-code {background-color: #f0f0f0;color: #000000;font-size: 24px;font-weight: bold;text-align: center;padding: 15px 20px;border-radius: 5px;margin: 20px auto;max-width: 250px;letter-spacing: 2px;}.footer {background-color: #f9f9f9;text-align: center;padding: 20px;font-size: 12px;color: #999999;border-top: 1px solid #eeeeee;}</style></head><body><div class=\"container\"><div class=\"header\"><a href=\"#\"><img src=\"https://res.cloudinary.com/harshitbd/image/upload/v1755112477/Screenshot_2025-08-14_003524_ohybri.png\" alt=\"ReviseCoder Logo\"></a></div><div class=\"content\"><h1>Please Verify Your Account</h1><p>Thank you for registering with us! To complete your registration, please use the verification code below. This code is valid for the next 10 minutes.</p><div class=\"verification-code\">${verificationCode}</div><p>If you did not request this verification, you can safely ignore this email.</p></div><div class=\"footer\">This is an automated email. Please do not reply.</div></div></body></html>`
    })
    // const tokens = generateTokens(user);
    // if(!tokens)
    //     throw new ApiError(500, 'Error generating tokens');

    // res.cookie('refreshToken', tokens.refreshToken, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: "Strict",
    //     maxAge: 5 * 24 * 60 * 60 * 1000 // 7 days
    // }) 
    return res.status(200).json(new ApiResponse(200,
        // user: {
        //     id: user._id,
        //     username: user.username,
        //     email: user.email,
        //     role: user.role,
        //     avatar: user.avatar
        // },
        // accessToken:tokens.accessToken,
        // accessTokenExpiry:tokens.accessTokenExpiresIn
        'Check your email for a one-time password. Use it first time, your regular password will work second time onward')); 
})

const login = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body;

    const user = await User.findOne({
        $or: [
            { username: username },
            { email: email }
        ]
    }).select('+password +failedLoginAttempts +lockedUntil +isVerified +verificationCode');

    if (!user)
        throw new ApiError(401, 'Invalid username/email or password');

    if (user.lockedUntil && user.lockedUntil > Date.now()) {
        const timeLeft = Math.ceil((user.lockedUntil - Date.now()) / 1000);
        const formattedTime = new Date(user.lockedUntil).toLocaleString();
        throw new ApiError(403, `Account is locked until ${formattedTime} (${timeLeft} seconds remaining)`);
    }
    let isPasswordValid = false;
    if (user.isVerified)
        isPasswordValid = await user.isPasswordCorrect(password);
    else {
        isPasswordValid = user.verificationCode == password;
    }
    user.isVerified = true;
    user.verificationCode = null;

    if (!isPasswordValid) {
        user.failedLoginAttempts += 1;
        if (user.failedLoginAttempts >= 5) {
            user.lockedUntil = Date.now() + 1 * 60 * 1000;
        }
        await user.save({ validationBeforeSave: false });
        throw new ApiError(401, 'Invalid username/email or password');
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await user.save({ validateBeforeSave: false });

    const tokens = generateTokens(user);

    if (!tokens)
        throw new ApiError(500, 'Error generating tokens');

    res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 5 * 24 * 60 * 60 * 1000 // 5 days
    })
    return res.status(200).json(new ApiResponse(200, {
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,

        },
        accessToken: tokens.accessToken,
        accessTokenExpiry: tokens.accessTokenExpiresIn
    }, 'User logged in successfully'));
})

const refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken)
        throw new ApiError(400, 'Refresh token is required');

    let decoded;
    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
        res.clearCookie('refreshToken');
        return res.status(401).json({ success: false, message: 'Invalid or expired refresh token, user logged out successfully' });
    }

    const user = await User.findById(decoded.id);
    if (!user)
        throw new ApiError(403, 'User not found');

    const tokens = generateTokens(user);
    if (!tokens)
        throw new ApiError(500, 'Error generating tokens'); 

    return res.status(200).json(new ApiResponse(200, {
        accessToken: tokens.accessToken,
        accessTokenExpiry: tokens.accessTokenExpiresIn,
        username: user.username,
        avatar: user.avatar
    }, 'Tokens refreshed successfully'));
})

const logout = asyncHandler(async (req, res) => {
    res.clearCookie('refreshToken');
    return res.status(204).json({
        success: true,
        message: 'User logged out successfully'
    })
})

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(200).json(new ApiResponse(200, 'If your email is registered, you will receive a password reset link'));
    }
    console.log(121)

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.passwordResetToken = resetToken;
    await user.save({ validateBeforeSave: false });
    
    await transporter.sendMail({
        from: "harshitbidasara@gmail.com",
        to: `${email}`,
        subject: 'Password Reset Request',
        html: `<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><title>Password Reset</title><style>body {font-family: sans-serif;background-color: #f4f4f4;margin: 0;padding: 0;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;}.container {width: 100%;max-width: 600px;margin: 0 auto;background-color: #ffffff;border-radius: 8px;overflow: hidden;box-shadow: 0 4px 8px rgba(0,0,0,0.1);}.header {background-color: #000000;text-align: center;padding: 15px 0;}.header img {height: 30px;}.content {padding: 30px;color: #333333;}.content h1 {color: #000000;font-size: 24px;margin-top: 0;text-align: center;}.content p {font-size: 16px;line-height: 1.5;text-align: center;}.button {display: inline-block;background-color: #007bff;color: #ffffff;text-decoration: none;padding: 12px 25px;border-radius: 5px;font-weight: bold;margin: 20px auto;}.center-div {text-align: center;}.footer {background-color: #f9f9f9;text-align: center;padding: 20px;font-size: 12px;color: #999999;border-top: 1px solid #eeeeee;}</style></head><body><div class=\"container\"><div class=\"header\"><a href=\"#\"><img src=\"https://res.cloudinary.com/harshitbd/image/upload/v1755112477/Screenshot_2025-08-14_003524_ohybri.png\" alt=\"ReviseCoder Logo\"></a></div><div class=\"content\"><h1>Password Reset Requested</h1><p>You have requested to reset the password for your account. Use this reset code to change your password.</p><div class=\"center-div\">${resetToken}</div><p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p></div><div class=\"footer\">This is an automated email. Please do not reply.</div></div></body></html>`
    })

    return res.status(200).json(new ApiResponse(200, { user, resetToken: resetToken }, 'If your email is registered, you will receive a password reset link'))
});

const resetPassword = asyncHandler(async (req, res) => {

    const { email,token, password } = req.body;

    const user = await User.findOne({
        email: email,
    });
    console.log(email)

    if (!user)
        throw new ApiError(400, 'Invalid or expired password reset token,e');
    if(user.passwordResetToken != token)
        throw new ApiError(400, 'Invalid or expired password reset token');

    user.password = password;
    user.passwordResetToken = undefined;

    await user.save();

    const tokens = generateTokens(user);

    if (!tokens)
        throw new ApiError(500, 'Error generating tokens');

    res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 5 * 24 * 60 * 60 * 1000 // 5 days
    })
    return res.status(200).json(new ApiResponse(200, {
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,

        },
        accessToken: tokens.accessToken,
        accessTokenExpiry: tokens.accessTokenExpiresIn
    }, 'Password Changed, and logged in successfully'));
});

export default {
    registerUser,
    login,
    refreshToken,
    logout,
    forgotPassword,
    resetPassword
}