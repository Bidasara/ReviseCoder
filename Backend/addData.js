import { ques } from "./models/ques.js";
import { Problem } from "./models/problem.model.js";
import { Animation } from "./models/animation.model.js";
import { animationPacks } from "./db/animations.js";

export const insertQuestions = async () => { 
  try {
      const operations = ques.map(question=>({
        updateOne: {
          filter: {title: question.title},
          update: {$set: question},
          upsert: true,
        }
      }))
      const result = await Problem.bulkWrite(operations);
      console.log("✅ Problem sync complete!");
    console.log(`${result.upsertedCount} problems inserted.`);
    console.log(`${result.modifiedCount} problems updated.`); 
    } catch (error) {
      console.error("Error inserting/updating animations:", error);
    }
};

export const insertAnimations = async () => {
  try {
    const operations = animationPacks.map(animation=>({
        updateOne: {
          filter: {title: animation.title},
          update: {$set: animation},
          upsert: true,
        }
      }))
      const result = await Animation.bulkWrite(operations);
      console.log("✅ Animation sync complete!");
    console.log(`${result.upsertedCount} animations inserted.`);
    console.log(`${result.modifiedCount} animations updated.`); 
    } catch (error) {
      console.error("Error inserting/updating animations:", error);
    }
}
