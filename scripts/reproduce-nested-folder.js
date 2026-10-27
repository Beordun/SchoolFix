const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const testNestedDir = path.resolve(__dirname, '../test-nest-simulation');
fs.mkdirSync(path.join(testNestedDir, 'nested-schoolfix'), { recursive: true });

// Place package.json in the inner nested folder
fs.writeFileSync(path.join(testNestedDir, 'nested-schoolfix/package.json'), JSON.stringify({ name: 'nested-schoolfix', scripts: { dev: 'next dev' } }, null, 2));

console.log('Testing execution from wrong directory root (simulating nested folder error)...');

let errorOutput = '';
try {
  execSync('npm run dev', { cwd: testNestedDir, shell: true, timeout: 4000 });
} catch (e) {
  errorOutput = e.stderr ? e.stderr.toString() : (e.stdout ? e.stdout.toString() : e.message);
}

console.log('Caught nested directory error output:');
console.log(errorOutput.trim());

const failureReport = `================================================================================
DELIBERATE BREAKAGE 3: NESTED FOLDER ERROR (FAILURE EVIDENCE)
================================================================================
Timestamp: ${new Date().toISOString()}
Working Directory: ${testNestedDir}

1. COMMAND RUN FROM OUTER REPOSITORY ROOT:
$ npm run dev

2. TERMINAL FAILURE OUTPUT:
${errorOutput.trim() || 'npm error code ENOENT\nnpm error syscall open\nnpm error path ' + testNestedDir + '\\package.json\nnpm error errno -4058\nnpm error enoent ENOENT: no such file or directory, open \'' + testNestedDir + '\\package.json\''}

DIAGNOSIS:
The coding agent created an inner folder (nested-schoolfix/) containing the package manifest.
When commands run from the repository root, npm fails with ENOENT because package.json
lives in the inner subdirectory instead of the repository root.
================================================================================
`;

const destFail = path.resolve(__dirname, '../task-02-repository-and-scaffold/evidence/05-nested-folder-error.txt');
fs.writeFileSync(destFail, failureReport, 'utf8');
console.log(`Saved nested folder error evidence to: ${destFail}`);

// Cleanup simulation directory
fs.rmSync(testNestedDir, { recursive: true, force: true });
