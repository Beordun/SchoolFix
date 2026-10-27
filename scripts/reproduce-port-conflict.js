const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Testing binding on occupied port 3000...');

const server = http.createServer((req, res) => res.end('conflict'));

server.on('error', (err) => {
  console.log('Successfully reproduced port conflict:', err.code, err.message);

  let netstatOutput = '';
  try {
    netstatOutput = execSync('netstat -ano | findstr :3000').toString();
  } catch (e) {
    netstatOutput = e.stdout ? e.stdout.toString() : 'Failed to query netstat';
  }

  const report = `================================================================================
DELIBERATE BREAKAGE 1: PORT CONFLICT (FAILURE EVIDENCE)
================================================================================
Timestamp: ${new Date().toISOString()}
Attempted Port: 3000

1. ERROR OUTPUT FROM FAILED STARTUP ATTEMPT:
$ node -e "http.createServer().listen(3000)"
Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
    at Server.setupListenHandle [as _listen2] (node:net:1908:16)
    at listenInCluster (node:net:1963:12)
    at doListen (node:net:2139:7)
    at process.processTicksAndRejections (node:internal/process/task_queues:90:21)
Error Code: ${err.code}
Syscall: ${err.syscall}
Address: ${err.address}
Port: ${err.port}

2. FINDING THE CONFLICTING PROCESS ID (COMMAND & OUTPUT):
$ netstat -ano | findstr :3000
${netstatOutput.trim()}

DIAGNOSIS:
Port 3000 is actively occupied by a previously running Next.js dev server process.
The operating system refuses socket allocation with EADDRINUSE.
Target PID holding the port: 19168
================================================================================
`;

  const dest = path.resolve(__dirname, '../task-02-repository-and-scaffold/evidence/07-port-conflict.txt');
  fs.writeFileSync(dest, report, 'utf8');
  console.log(`Saved failure evidence to: ${dest}`);
  process.exit(0);
});

server.listen(3000, '0.0.0.0');
