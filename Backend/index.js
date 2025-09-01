console.log("DEBUG: The test variable is:", process.env.DEBUG_TEST_VAR);

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js";
import {insertQuestions,insertAnimations} from "./addData.js";
import { seedRecommendedLists } from "./seedRecommendedLists.js";

dotenv.config({
    path: "./.env"
});


const requiredEnvVars = ['MONGO_URI' , 'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`FATAL ERROR: Environment variable ${varName} is not defined.`);
  }
}

connectDB()
.then(async () => {
    await insertAnimations();
    await insertQuestions();
    await seedRecommendedLists();
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    })
}). catch((error)=>{
    console.log('Mongo DB connection failed:',error);
});