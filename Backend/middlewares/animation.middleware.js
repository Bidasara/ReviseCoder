import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Purchase } from "../models/purchase.model.js";

export const checkAnimationAccess = asyncHandler(async(req,res,next)=>{
    const userId = req.user.id;
    const animationId = req.params.id;

    if(!userId || !animationId) {
        throw new ApiError(400, 'User ID and Animation ID are required');
    }

    const purchase = await Purchase.findOne({ user: userId, animation: animationId });

    if(!purchase) {
        throw new ApiError(403, 'Access denied. User does not own this animation.');
    }
    
    next();
})