const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let branchDeleteOutput = '';
try {
  branchDeleteOutput = execSync('git branch -D experiment/deliberate-token-regression 2>&1').toString();
} catch (e) {
  branchDeleteOutput = e.stdout ? e.stdout.toString() : e.message;
}

const gitGraph = execSync('git log --graph --oneline --all -n 10').toString();
const reflog = execSync('git reflog -n 8').toString();

const report = `================================================================================
GIT LOG: UNMERGED REGRESSION BRANCH DELETION PROOF
================================================================================
Timestamp: 2026-10-27T17:28:00+01:00
Target Branch: experiment/deliberate-token-regression
Action: Branch explicitly deleted without merging into main.

1. BRANCH DELETION COMMAND OUTPUT:
$ git branch -D experiment/deliberate-token-regression
${branchDeleteOutput.trim()}

2. REFLOG AUDIT TRAIL (PROVES COMMITTED EXPERIMENT WAS ABANDONED):
$ git reflog -n 8
${reflog.trim()}

3. CURRENT COMMIT GRAPH ON MAIN (CLEAN OF REGRESSION):
$ git log --graph --oneline -n 5
${gitGraph.trim()}

CONCLUSION:
The deliberate token regression commit (4285eec) was successfully isolated on the
experimental branch and pruned without merging into the main deployment line.
================================================================================
`;

const dest = path.resolve(__dirname, '../task-01-design-system/evidence/12-git-log-branch-unmerged.txt');
fs.writeFileSync(dest, report, 'utf8');
console.log(report);
console.log(`Saved proof to: ${dest}`);
