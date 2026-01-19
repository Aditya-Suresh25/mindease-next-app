import { inngest } from "./index";
import { functions as aiFinctions } from "./aiFunctions"



import { generateWellbeingReport } from "./reportFunctions";

// Add the function to the exported array:
export const functions = [
  ...aiFinctions,
  generateWellbeingReport,
];