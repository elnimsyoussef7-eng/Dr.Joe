const fs = require('fs');
const code = fs.readFileSync('renderer.js', 'utf8');
const lines = code.split('\n');

function findExtra(openCh, closeCh) {
  let depth = 0;
  let inStr = false;
  let strCh = null;
  
  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    
    if (inStr) {
      if (ch === '\\\\') { i++; continue; }
      if (ch === strCh) { inStr = false; continue; }
      continue;
    }
    
    if (ch === '\' || ch === \"'\" || ch === '\"') {
      inStr = true;
      strCh = ch;
      continue;
    }
    
    if (ch === openCh) depth++;
    if (ch === closeCh) {
      depth--;
      if (depth < 0) {
        const lineNum = code.substring(0, i).split('\n').length;
        console.log('Extra ' + closeCh + ' at line ' + lineNum);
        const start = Math.max(0, i - 40);
        const end = Math.min(code.length, i + 40);
        console.log('  Context: ' + code.substring(start, end));
        depth = 0; // reset to find next
      }
    }
  }
  console.log('Final depth for ' + closeCh + ': ' + depth);
}

console.log('=== Parens ===');
findExtra('(', ')');
console.log('');
console.log('=== Brackets ===');
findExtra('[', ']');
