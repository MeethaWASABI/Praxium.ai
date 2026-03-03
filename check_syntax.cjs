const fs = require('fs');
const acorn = require('acorn');
const acornJsx = require('acorn-jsx');
const Parser = acorn.Parser.extend(acornJsx());

const code = fs.readFileSync('src/components/dashboards/StudentDashboard.jsx', 'utf8');

try {
    Parser.parse(code, { sourceType: 'module' });
    console.log("No syntax error found by Acorn.");
} catch (e) {
    console.log("Syntax error at Line: " + e.loc.line + " Col: " + e.loc.column);
    const lines = code.split('\n');
    console.log("Context:");
    for (let i = Math.max(0, e.loc.line - 5); i < Math.min(lines.length, e.loc.line + 5); i++) {
        console.log((i + 1) + ": " + lines[i]);
    }
}
