import dotenv from "dotenv";
dotenv.config();

import app from "../src/app.js";

// Export the Express app as a serverless function
export default app;

