import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { List } from '../models/list.model.js';
import { Milestone } from '../models/milestones.model.js';
import { Animation } from '../models/animation.model.js';
import { Purchase } from '../models/purchase.model.js';
import { DoneProblem } from '../models/doneProblems.model.js';
import { Problem } from '../models/problem.model.js';
import mongoose from 'mongoose';

const getUserDashboard = asyncHandler(async (req, res) => {
  const username = req.params.username || req.user.username;
  const user = await User.findOne({ username });
  if (!user) throw new ApiError(404, 'User not found');

  try {
    const statsPipeline = await DoneProblem.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(user._id)
        }
      },
      {
        $unwind: '$problems'
      },
      {
        $lookup: {
          from: 'problems', // The actual collection name for 'Problem' model
          localField: 'problems.problemId',
          foreignField: '_id',
          as: 'problemDetails'
        }
      },
      {
        $group: {
          _id: {
            status: '$problems.status',
            difficulty: { $arrayElemAt: ['$problemDetails.difficulty', 0] }
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.status',
          stats: {
            $push: {
              difficulty: '$_id.difficulty',
              count: '$count'
            }
          }
        }
      }
    ]);

    const doneProblems = await DoneProblem.findOne({ user: user._id })
      .populate({
        path: 'problems.problemId',
        select: 'num title difficulty link'
      })
      .lean();

    const revisingProblems = doneProblems?.problems
      .filter(p => p.status === 'revising' || p.status === 'solved')
      .map(p => ({
        ...p.problemId,
        nextRevisionDate: p.nextRevisionDate
      })) || [];

    const stats = {
      solvedStats: [],
      revisedStats: [],
      masteredStats: []
    };

    statsPipeline.forEach(group => {
      if (group._id === 'solved') {
        stats.solvedStats.push(...group.stats);
      } else if (group._id === 'revising') {
        stats.revisedStats.push(...group.stats);
      } else if (group._id === 'mastered') {
        stats.masteredStats.push(...group.stats);
      }
    });

    const easyProblems = await Problem.countDocuments({ difficulty: 'Easy' });
    const mediumProblems = await Problem.countDocuments({ difficulty: 'Medium' });
    const hardProblems = await Problem.countDocuments({ difficulty: 'Hard' }); 

    const userObject = {
      username: user.username,
      avatar: user.avatar,
      pixels: user.pixels
    };
    return res.status(200).json(new ApiResponse(200, { user: userObject, solvedStats: stats.solvedStats, revisedStats: stats.revisedStats, masteredStats: stats.masteredStats, easyProblems, mediumProblems, hardProblems,revisingProblems }, 'User dashboard retrieved successfully'));
  } catch (error) {
    console.error(error);
    throw new ApiError(500, 'Dashboard aggregation failed');
  }
});

const getCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId).populate('cart');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json(new ApiResponse(200, user.cart, 'User cart retrieved successfully'));
});

const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { animationId } = req.params;
  const animation = await Animation.findById(animationId);
  if (!animation) {
    throw new ApiError(404, 'Animation not found');
  }
  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { cart: animationId } },
    { new: true, runValidators: true }
  ).populate('cart');

  return res.status(200).json(new ApiResponse(200, user.cart, 'Animation added to cart successfully'));
});

const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { animationId } = req.params;
  const animation = await Animation.findById(animationId);
  if (!animation) {
    throw new ApiError(404, 'Animation not found');
  }
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { cart: animationId } },
    { new: true, runValidators: true }
  ).populate('cart');

  return res.status(200).json(new ApiResponse(200, user.cart, 'Animation removed from cart successfully'));
});

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { username } = req.body;

  if (!username)
    throw new ApiError(400, 'Username is required');

  // Check if username or email is already taken
  if (username) {
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: userId } },
        { username: username }
      ]
    });

    if (existingUser)
      throw new ApiError(409, 'Username already exists');
  }

  // Find and update user
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: req.body },
    { new: true, runValidators: true }
  ).select('-password -_id -role -email -lists -createdAt -updatedAt -lastRevised -passwordResetToken -passwordResetExpires -refreshToken');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json(new ApiResponse(200, user, 'User profile updated successfully'));
});

const deleteAccount = asyncHandler(async (req, res) => {

  const userId = req.user.id;
  const { password } = req.body;

  // Validate input
  if (!password)
    throw new ApiError(400, 'Password is required to delete account');

  // Find user with password
  const user = await User.findById(userId).select('+password');

  if (!user)
    throw new ApiError(404, 'User not found');

  // Check if password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid)
    throw new ApiError(401, 'Incorrect password');

  // Delete user
  await User.findByIdAndDelete(userId);

  return res.status(200).json(new ApiResponse(200, null, 'User account deleted successfully'));
});

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    return res.status(200).json({
      success: true,
      count: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    // Find and update user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

const getAttemptedRevisedStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const stats = await List.aggregate([
    { $match: { owner: userId } },
    { $unwind: '$categories' },
    { $unwind: '$categories.problems' },
    {
      $lookup: {
        from: 'problems',
        localField: 'categories.problems.problemId',
        foreignField: '_id',
        as: 'problemInfo',
      },
    },
    { $unwind: '$problemInfo' },
    {
      $group: {
        _id: '$problemInfo.difficulty',
        attempted: {
          $sum: { $cond: ['$categories.problems.solved', 1, 0] },
        },
        revised: {
          $sum: { $cond: ['$categories.problems.revised', 1, 0] },
        },
      },
    },
  ]);

  // Format result as { Easy: { attempted, revised }, ... }
  const result = { Easy: { attempted: 0, revised: 0 }, Medium: { attempted: 0, revised: 0 }, Hard: { attempted: 0, revised: 0 } };
  stats.forEach((item) => {
    if (result[item._id]) {
      result[item._id].attempted = item.attempted;
      result[item._id].revised = item.revised;
    }
  });

  res.json({ success: true, data: result });
});

const addPixels = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  if (!userId)
    throw new ApiError(404, "No user id provided")
  const user = await User.findById(userId);
  if (!user)
    throw new ApiError(404, "User not found")
  const ownedpixels = user.pixels;
  user.pixels += req.body.amount;
  await user.save();
  return res.status(200).json(new ApiResponse(200, `${req.body.amount} Pixels added successfully`));
})
const removePixels = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  if (!userId)
    throw new ApiError(404, "No user id provided")
  const user = await User.findById(userId);
  if (!user)
    throw new ApiError(404, "User not found")
  const ownedpixels = user.pixels;
  user.pixels -= req.body.amount;
  await user.save();
  return res.status(200).json(new ApiResponse(200, `${req.body.amount} Pixels removed successfully`));
})
const markMilestoneDone = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  if (!userId)
    throw new ApiError(404, "No user id provided")
  const user = await User.findById(userId);
  if (!user)
    throw new ApiError(404, "User not found")
  const milestoneId = req.params.id;
  if (!milestoneId)
    throw new ApiError(404, "No milestone provided")
  const milestone = await Milestone.findById(milestoneId);
  if (!milestone)
    throw new ApiError(404, "No milestone found");
  if (user.milestones.includes(milestoneId))
    return res.status(200).json(new ApiResponse(200, 'Milestone already redeemed'));
  user.milestones.push(milestoneId);
  const dataset = await DoneProblem.find({ user: user._id });
  const data = dataset[0];
  const revisedProblems = data.problems.filter(prob => prob.status === 'revising' || prob.status === 'mastered');
  let diff = milestone.questionsToRevise - revisedProblems.length;
  if (diff > 0) {
    return res.status(300).json(new ApiResponse(300, `Just ${diff} more questions to revise 🦾😊🦾`))
  }
  if (milestone.rewardPixels > 0) {
    user.pixels += milestone.rewardPixels;
  }
  if (milestone.rewardAnimation) {
    const newPurchase = new Purchase({
      user: userId,
      animation: milestone.rewardAnimation,
      trialEnd: new Date(8640000000000000)
    })
    await newPurchase.save();
  }
  if (milestone.rewardTrophy) {
    user.trophies.push(milestone.rewardTrophy);
  }
  await user.save();
  return res.status(200).json(new ApiResponse(200, 'Marked Milestone done'));
})
const getAllMilestones = asyncHandler(async (req, res) => {
  const milestones = await Milestone.find();
  (milestones)
  return res.status(200).json(new ApiResponse(200, milestones, 'Successfully sent all milestones'));
})

const getAllMilestonesDone = asyncHandler(async (req, res) => {
  const userId = await req.user.id;
  if (!userId) throw new ApiError(400, 'user not logged in');
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  return res.status(200).json(new ApiResponse(200, { milestones: user.milestones, pixels: user.pixels }, 'Successfully sent all done milestones'));
})

export default {
  getUserDashboard,
  updateCurrentUserProfile,
  deleteAccount,
  getAllMilestonesDone,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getCart,
  addToCart,
  removeFromCart,
  addPixels,
  removePixels,
  markMilestoneDone,
  getAllMilestones
};