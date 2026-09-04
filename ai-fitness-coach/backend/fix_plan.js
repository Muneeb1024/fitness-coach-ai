const fs = require("fs");
let code = fs.readFileSync("src/services/planGeneratorService.js", "utf8");

// Remove old SDK import
code = code.replace(/import \{ GoogleGenerativeAI \} from "@google\/generative-ai";\n?/g, "");
code = code.replace(/import \{ GoogleGenerativeAI \} from '@google\/generative-ai';\n?/g, "");

// Find and replace the Gemini block using a regex
const oldPattern = /\/\/ Try Gemini API if key is present[\s\S]*?\/\/ Return dynamically calculated plan/;
const newBlock = `// Return dynamically calculated plan`;

// First check what we have around line 180
const lines = code.split("\n");
for(let i = 178; i < 202; i++) {
  console.log(i+1 + ": " + lines[i]);
}
