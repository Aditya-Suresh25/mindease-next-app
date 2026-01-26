"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.functions = void 0;
const aiFunctions_1 = require("./aiFunctions");
const reportFunctions_1 = require("./reportFunctions");
// Add the function to the exported array:
exports.functions = [
    ...aiFunctions_1.functions,
    reportFunctions_1.generateWellbeingReport,
];
