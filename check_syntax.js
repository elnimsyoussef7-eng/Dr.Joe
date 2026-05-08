const fs = require('fs');
const code = fs.readFileSync('renderer.js', 'utf8');
const lines = code.split('\n');
console.log('Total lines:', lines.length);

// Check braces
let depth = 0;
let inString = false;
let stringChar = null;
for (let i = 0; i < code.length; i++) {
  const ch = code[i];
  if (inString) {
    if (ch === '\\') { i++; continue; }
    if (ch === stringChar) inString = false;
    continue;
  }
  if (ch === '' || ch === "'" || ch === '"') {
    inString = true;
    stringChar = ch;
    continue;
  }
  if (ch === '{') depth++;
  if (ch === '}') depth--;
}
console.log('Brace depth at end:', depth);
if (depth !== 0) console.log('ERROR: Unbalanced braces!');

// Check parens
depth = 0;
inString = false;
stringChar = null;
for (let i = 0; i < code.length; i++) {
  const ch = code[i];
  if (inString) {
    if (ch === '\\') { i++; continue; }
    if (ch === stringChar) inString = false;
    continue;
  }
  if (ch === '' || ch === "'" || ch === '"') {
    inString = true;
    stringChar = ch;
    continue;
  }
  if (ch === '(') depth++;
  if (ch === ')') depth--;
}
console.log('Paren depth at end:', depth);
if (depth !== 0) console.log('ERROR: Unbalanced parens!');

// Check brackets
depth = 0;
inString = false;
stringChar = null;
for (let i = 0; i < code.length; i++) {
  const ch = code[i];
  if (inString) {
    if (ch === '\\') { i++; continue; }
    if (ch === stringChar) inString = false;
    continue;
  }
  if (ch === '' || ch === "'" || ch === '"') {
    inString = true;
    stringChar = ch;
    continue;
  }
  if (ch === '[') depth++;
  if (ch === ']') depth--;
}
console.log('Bracket depth at end:', depth);
if (depth !== 0) console.log('ERROR: Unbalanced brackets!');

console.log('Syntax check complete.');
