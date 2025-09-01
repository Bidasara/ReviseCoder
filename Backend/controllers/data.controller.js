import { List } from "../models/list.model.js";
import { Problem } from "../models/problem.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { DoneProblem } from "../models/doneProblems.model.js";
import { ApiError } from "../utils/apiError.js";
import mongoose from 'mongoose';
import { User } from "../models/user.model.js";

export const getAllListsByUserId = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    if (!userId) throw new ApiError(400, 'User not logged in');
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    const lists = await List.find({ owner: userId }).populate('categories.problems.problemId', 'num title difficulty tag hint link');
    if (!lists || lists.length === 0) {
        throw new ApiError(404, 'No lists found for this user');
    }
    const totsProbs = await Problem.find();
    ("totalProblems:", totsProbs.length);
    return res.status(200).json(new ApiResponse(200, { lists: lists, totalProblems: totsProbs.length, pixels: user.pixels }, 'Lists retrieved successfully'));
})

export const addListForUserId = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    if (!userId) throw new ApiError(400, 'User not logged in');
    if (!req.body.title) throw new ApiError(400, "Title not provided")
    const list = new List({
        ...req.body.list,
        owner: userId,
        title: req.body.title,
    });

    await list.save();
    const user = await User.findById(userId);
    user.lists.push(list._id);
    await user.save();

    return res.status(201).json(new ApiResponse(201, { list }, 'List created successfully'));
})

export const deleteList = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    if (!userId) throw new ApiError(400, 'User not logged in');

    const list = await List.findById(req.body.listId);
    if (!list.byAdmin && list.owner.toString() !== userId)
        throw new ApiError(404, 'Unauthorized to delete this list');

    await List.deleteOne({ _id: req.body.listId });
    return res.status(200).json(new ApiResponse(200, 'List deleted successfully'));
})

export const addCategoryForList = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    if (!userId) throw new ApiError(400, 'User not logged in');
    const { listId, title } = req.body;
    if (!listId) throw new ApiError(400, 'Invalid List');
    if (!title || title == "") throw new ApiError(400, 'Title is required');

    const list = await List.findById(listId);
    if (!list) {
        throw new ApiError(404, 'List not found');
    }
    if (list.byAdmin) {
        throw new ApiError(400, 'You are not authorized to add a category to this list');
    }

    const list1 = await List.findByIdAndUpdate(listId,
        {
            $push: {
                categories: {
                    title: title,
                    problems: [],
                }
            }
        },
        { new: true, runValidators: true }
    )

    const category = list1.categories.find(cat => cat.title === title);

    return res.status(200).json(new ApiResponse(200, category._id, 'Category Added Successfully'));
})

export const deleteCategory = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    if (!userId)
        throw new ApiError(400, 'User not logged in');
    const { listId, categoryId } = req.body;
    if (!listId || !categoryId)
        throw new ApiError(400, 'Need both listId and categoryId');

    const list = await List.findById(listId);
    if (!list)
        throw new ApiError(404, 'List not found');
    if (!list.byAdmin && list.owner != userId)
        throw new ApiError(403, 'Unauthorized to delete category');

    const category = list.categories.find(cat => cat._id.toString() === categoryId);
    if (!category)
        throw new ApiError(404, 'Category not found');

    // Remove the category from the categories array
    list.categories = list.categories.filter(cat => cat._id.toString() !== categoryId);
    await list.save();

    return res.status(200).json(new ApiResponse(200, 'Category deleted successfully'));
})

export const addProblemForCategory = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    if (!userId) throw new ApiError(400, 'User not logged in');
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    const { listId, catId, probNum } = req.body;
    if (!listId) throw new ApiError(400, 'Invalid List');
    if (!catId) throw new ApiError(400, 'Invalid Category');
    if (!probNum) throw new ApiError(400, 'Invalid Problem number');

    const prob = await Problem.findOne({ num: probNum })?.populate('title num difficulty link tag hint');
    if (!prob) throw new ApiError(404, 'Problem not found with this number');
    const data = await DoneProblem.findById(user.doneProblemId);
    if (!data) throw new ApiError(404, 'DoneProblem not found for this user');
    const probData = data.problems?.find(probo => probo?.problemId.toString() === prob._id.toString());
    let status = 'unsolved';
    if (probData) {
        status = probData?.status;
    }
    // Generate a new ObjectId for the problem entry
    const newProblemId = new mongoose.Types.ObjectId();

    // Find the list AND the specific category within it, and push the new problem with generated _id
    const list = await List.findOneAndUpdate(
        {
            _id: listId,
            "categories._id": catId
        },
        {
            $push: {
                "categories.$.problems": { _id: newProblemId, problemId: prob._id.toString(), status: status } // Only push the reference with generated _id
            }
        },
        { new: true, runValidators: false }
    );

    if (!list) {
        throw new ApiError(404, 'List or Category not found for adding problem.');
    }

    return res.status(200).json(new ApiResponse(200, {
        prob,
        p_id: newProblemId, 
        status: status
    }, 'Problem added successfully to specific category.'));
});

export const deleteProblem = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    if (!userId) throw new ApiError(400, 'User not logged in');
    const user = User.findById(userId)
    if (!user) throw new ApiError(404, 'User not found');
    const { listId, categoryId, problemId } = req.body;
    if (!listId) throw new ApiError(400, 'Invalid List');
    if (!categoryId) throw new ApiError(400, 'Invalid Category');
    if (!problemId) throw new ApiError(400, 'Invalid Problem id');

    const list = await List.findById(listId);
    if (!list) throw new ApiError(404, 'List not found');
    if (!list.byAdmin && list.owner != userId) throw new ApiError(404, 'Unauthorized to delete problem');

    const category = list.categories.id(categoryId);
    if (!category) throw new ApiError(404, 'Category not found');

    category.problems = category.problems.filter(prob => prob._id != problemId)

    await list.save();
    return res.status(200).json(new ApiResponse(200, 'Problem deleted successfully'));
})

export const markRevisedProblem = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { probId } = req.body;

    if (!userId) throw new ApiError(400, 'User not logged in');
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'No user found');
    if (!probId) throw new ApiError(400, 'Invalid Problem id');

    const data = await DoneProblem.findById(user.doneProblemId);
    if(!data) throw new ApiError(404, 'DoneProblem not found for this user');
    const probData = data.problems.find(prob => prob.problemId.toString() === probId);
    if(!probData) throw new ApiError(404, 'Problem not found in done problems');
    let newStatus;
    if (probData.interval === 31) {
        probData.status = 'mastered';
        probData.nextRevisionDate = null;
        probData.interval = 0;
        user.pixels += 5;
    } else {
        probData.status = 'revising';
        probData.nextRevisionDate = new Date(Date.now() + (probData.interval * 2 + 1) * 24 * 60 * 60 * 1000);
        probData.interval = probData.interval * 2 + 1;
        user.pixels += 2;
    }
    newStatus = probData.status;
    await data.save();
    await user.save();
    await List.updateMany(
        // 1. Query: Find all lists owned by the user that contain the problem.
        {
            owner: userId,
            'categories.problems.problemId': probId
        },

        // 2. Update: Set the status of the matched problem using identifiers.
        {
            $set: { 'categories.$[cat].problems.$[prob].status': probData.status }
        },

        // 3. Options: Define what the identifiers [cat] and [prob] mean.
        {
            arrayFilters: [
                { 'cat.problems.problemId': probId }, // 'cat' is any category containing our problem
                { 'prob.problemId': probId }         // 'prob' is the specific problem we want to update
            ]
        }
    );
    const updatedLists = await List.find({ owner: userId }).populate('categories.problems.problemId', 'num title difficulty tag hint link');
    const returnLists = {lists: updatedLists}


    return res.status(200).json(new ApiResponse(200, { pixels: user.pixels, status: newStatus,result:returnLists }, `Revised problem ${probId}`));
})

export const getNotesByUserProblem = asyncHandler(async (req, res) => {
    const { userId, probNum } = req.body;

    if (!userId) throw new ApiError(400, 'User not logged in');
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    if (!probNum) throw new ApiError(400, 'Invalid Problem number');
    const probId = Problem.findOne({ num: probNum }).select('_id').toString();

    const data = await DoneProblem.findOne({ user: userId });
    const probData = data.problems.find(prob => prob.problemId.toString() === probId);

    return res.status(200).json(new ApiResponse(200, probData.notes, "Retrieved notes successfully"));
})

const markSolvedWithNotes = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { probId, notes, levelOfRevision, probNum } = req.body;

    if (!userId) {
        throw new ApiError(400, 'User not logged in');
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, 'No user found');
    }

    if (!probId && !probNum) {
        throw new ApiError(400, 'Invalid Problem number or ID');
    }

    let problem;
    if (probNum) {
        problem = await Problem.findOne({ num: probNum });
    } else {
        problem = await Problem.findById(probId);
    }
    
    if (!problem) {
        throw new ApiError(404, 'Problem not found');
    }

    const points = {
        "Easy": 5,
        "Medium": 10,
        "Hard": 20
    };

    // if (user.todayPoints + (points[problem.difficulty] || 0) > user.todayPointLimit) {
    //     const diff = user.todayPointLimit - user.todayPoints;
    //     if (diff > 0) {
    //         if (diff >= points["Medium"]) {
    //             throw new ApiError(400, `Try solving a medium problem, or easy problems, you have only ${diff} points left for today`);
    //         } else if (diff >= points["Easy"]) {
    //             throw new ApiError(400, `Try solving an easy problem, you have only ${diff} points left for today`);
    //         }
    //     } else {
    //         throw new ApiError(400, `You have reached your limit of ${user.todayPointLimit} points for today, for a better learning experience, try again tomorrow, or try Grind Mode 🔥🔥`);
    //     }
    // }

    const levels = [1, 7, 15];
    const dayInMs = 1000 * 60 * 60 * 24;

    const data = await DoneProblem.findById(user.doneProblemId);

    const existingProblem = data.problems.find(p => p.problemId.equals(problem._id));

    if (existingProblem) {
        if (existingProblem.status === 'solved') {
            throw new ApiError(400, "Already solved this problem, revise it as scheduled");
        } else if (existingProblem.status === 'revising') {
            throw new ApiError(400, "Already revising this problem");
        } else if (existingProblem.status === 'mastered') {
            throw new ApiError(400, "Already Mastered this problem 🎉🎉");
        }
    }
    const nextRevisionInterval = levels[levelOfRevision];
    const nextRevisionDate = nextRevisionInterval * dayInMs + Date.now();

    const problemData = {
        problemId: problem._id,
        status: 'solved',
        nextRevisionDate: new Date(nextRevisionDate),
        interval: nextRevisionInterval,
        notes: notes || '',
    };

    data.problems.push(problemData);
    user.todayPoints += points[problem.difficulty] || 0;
    user.pixels += points[problem.difficulty] || 0;

    await user.save();
    await data.save();

    await List.updateMany(
        {
            owner: userId,
            'categories.problems.problemId': problem._id
        },
        {
            $set: { 'categories.$[cat].problems.$[prob].status': problemData.status }
        },
        {
            arrayFilters: [
                { 'cat.problems.problemId': problem._id },
                { 'prob.problemId': problem._id }
            ]
        }
    );

    return res.status(200).json(new ApiResponse(200, user.pixels, `Now Revising Problem ${problem.num}`));
});

const getRecommendedLists = asyncHandler(async (req, res) => {
    try {
        const recomLists = await List.find({ byAdmin: true })
            .populate('categories.problems.problemId', 'num title difficulty tag hint link');
        return res.status(200).json(new ApiResponse(200, recomLists, "Retrieved recommended lists successfully"));
    } catch (err) {
        console.error('Error fetching recommended lists:', err);
        throw new ApiError(500, 'Failed to retrieve recommended lists');
    }
});

const getReviseListByUserId = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    if (!userId) throw new ApiError(400, 'User not logged in');
    
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    
    // Get end of today (23:59:59.999) to capture all problems due today or earlier
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    console.log('End of today (cutoff):', endOfToday);

    const reviseList = await DoneProblem.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(user.doneProblemId) }
        },
        {
            $unwind: '$problems'
        },
        {
            $match: {
                'problems.status': { $in: ['revising', 'solved'] },
                // Get problems due today or earlier
                'problems.nextRevisionDate': { $lte: endOfToday }
            }
        },
        {
            $lookup: {
                from: 'problems',
                localField: 'problems.problemId',
                foreignField: '_id',
                as: 'problems.problemDetails'
            }
        },
        {
            $addFields: {
                'problems.problemDetails': { $arrayElemAt: ['$problems.problemDetails', 0] }
            }
        },
        {
            $project: {
                _id: '$problems._id',
                problemId: '$problems.problemDetails._id',
                num: '$problems.problemDetails.num',
                title: '$problems.problemDetails.title',
                difficulty: '$problems.problemDetails.difficulty',
                tag: '$problems.problemDetails.tag',
                hint: '$problems.problemDetails.hint',
                link: '$problems.problemDetails.link',
                status: '$problems.status',
                nextRevisionDate: '$problems.nextRevisionDate',
                notes: '$problems.notes'
            }
        }
    ]);
    
    console.log('Revise List:', reviseList);
    
    return res.status(200).json(new ApiResponse(200, reviseList, 'Problems to be revised sent successfully'));
});

const addRecomListForUserId = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    if (!userId) throw new ApiError(400, 'User not logged in');
    const { listId } = req.body;
    if (!listId) throw new ApiError(400, 'List ID is required');

    // Find the recommended list
    const list = await List.findOne({ _id: listId, byAdmin: true }).populate('categories.problems.problemId', 'num title difficulty tag hint link');
    if (!list) throw new ApiError(404, 'Recommended list not found');

    // Check if user already has a list with the same title
    const existingList = await List.findOne({ owner: userId, title: list.title });
    if (existingList) throw new ApiError(400, 'You already have this list');

    // Deep clone and remove all _id fields
    const listObj = list.toObject();
    delete listObj._id;
    listObj.owner = userId;
    listObj.byAdmin = false;

    // Remove _id from categories and problems, and ensure problemId is always ObjectId
    if (Array.isArray(listObj.categories)) {
        listObj.categories = listObj.categories.map(cat => {
            const catCopy = { ...cat };
            delete catCopy._id;
            if (Array.isArray(catCopy.problems)) {
                catCopy.problems = catCopy.problems.map(prob => {
                    const probCopy = { ...prob };
                    delete probCopy._id;
                    // Ensure problemId is always ObjectId
                    if (probCopy.problemId && typeof probCopy.problemId === 'object' && probCopy.problemId._id) {
                        probCopy.problemId = probCopy.problemId._id;
                    }
                    return probCopy;
                });
            }
            // Validation: Ensure category title exists
            if (!catCopy.title) {
                throw new ApiError(500, `A category is missing the required title field.`);
            }
            return catCopy;
        });
    }

    // Log the object to be saved for debugging
    ('About to save new list:', JSON.stringify(listObj, null, 2));

    // Create and save the new list, with error handling
    try {
        const newList = await new List(listObj).save();
        // Populate before returning
        const populatedList = await List.findById(newList._id).populate('categories.problems.problemId', 'num title difficulty tag hint link');
        return res.status(201).json(new ApiResponse(201, { list: populatedList }, 'Added recommended list successfully'));
    } catch (err) {
        console.error('Error saving new list:', err);
        return res.status(500).json(new ApiResponse(500, null, `Failed to add recommended list: ${err.message}`));
    }
});

const getAllProblems = asyncHandler(async (req, res) => {
    const totsProbs = await Problem.find();
    if (!totsProbs)
        throw new ApiError(404, 'no probs');
    const updated = totsProbs.map(prob => ({
            _id: prob._id,
            num: prob.num,
            title: prob.title,
        }))
    return res.status(200).json(new ApiResponse(200, { problems: updated, totalProblems: totsProbs.length }, 'Successfully sent all problems'));
})

const updateNotes = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { probId, notes } = req.body;

    if (!userId) throw new ApiError(400, 'User not logged in');
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    if (!probId) throw new ApiError(400, 'Invalid Problem number');

    const data = await DoneProblem.findById(user.doneProblemId);
    const probData = data.problems.find(prob => prob.problemId.toString() === probId);
    probData.notes = notes;
    await data.save();

    return res.status(200).json(new ApiResponse(200, `Problem id: ${probId}, notes updated`));
})

const getSolvedAndRevised = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    if (!userId) throw new ApiError('User not logged in');
    const user = await User.findById(userId)
    if (!user) throw new ApiError('User not found');
    const data = await DoneProblem.findById(user.doneProblemId);
    const solvedProblems = data.problems.filter(prob => prob.status === 'solved').length;
    const revisingProblems = data.problems.filter(prob => prob.status === 'revising').length;
    const masteredProblems = data.problems.filter(prob => prob.status === 'mastered').length
    return res.status(200).json(new ApiResponse(200, { solved: solvedProblems, revised: revisingProblems, mastered: masteredProblems }, 'Solved, revising and mastered problems count retrieved successfully'));
})

const getHint = asyncHandler(async (req, res) => {
    const probId  = req.query?.probId;
    const probNum = req.query?.probNum;
    if (!probId && !probNum) throw new ApiError(400, 'Problem id num is required');
    
    if(probId){
        const problem = await Problem.findById(probId);
        if (!problem) throw new ApiError(404, 'Problem not found');
    
        return res.status(200).json(new ApiResponse(200, problem.hint, 'Hint retrieved successfully'));
    } else {
        const problem = await Problem.findOne({num: probNum});
        if (!problem) throw new ApiError(404, 'Problem not found');
    
        return res.status(200).json(new ApiResponse(200, problem.hint, 'Hint retrieved successfully'));
    }
})

export default {
    getHint,
    getNotesByUserProblem,
    markRevisedProblem,
    addProblemForCategory,
    addCategoryForList,
    getAllListsByUserId,
    addListForUserId,
    getRecommendedLists,
    markSolvedWithNotes,
    addRecomListForUserId,
    deleteCategory,
    deleteList,
    deleteProblem,
    getReviseListByUserId,
    getAllProblems,
    updateNotes,
    getSolvedAndRevised,
}