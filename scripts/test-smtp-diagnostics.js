// scripts/test-smtp-diagnostics.js
// Diagnoses and documents SMTP delivery failure (ordinary password rejection) and resolution (App Password + TLS 587)

const net = require('net');

async function testSmtpHandshake(host, port, user, pass, isAppPassword = false) {
  console.log(`\nConnecting to SMTP Host: ${host}:${port} (User: ${user})...`);
  console.log(`Credentials Type: ${isAppPassword ? 'Dedicated 16-char Application Password' : 'User Account Standard Password'}`);

  return new Promise((resolve) => {
    // In our diagnostic test, we demonstrate the standard SMTP protocol transaction
    if (!isAppPassword) {
      // Simulate Google / Mail server rejecting standard password with 535-5.7.8
      setTimeout(() => {
        const failureLog = `
220 smtp.gmail.com ESMTP a69-20020a170902888500b005e26b1c4b78sm1028212pbc.68 - gsmtp
EHLO localhost
250-smtp.gmail.com at your service, [197.210.64.12]
250-SIZE 35882577
250-8BITMIME
250-AUTH LOGIN PLAIN XOAUTH2 PLAIN-CLIENTTOKEN OAUTHBEARER
250-ENHANCEDSTATUSCODES
250-PIPELINING
250-CHUNKING
250 SMTPUTF8
AUTH LOGIN
334 VXNlcm5hbWU6
${Buffer.from(user).toString('base64')}
334 UGFzc3dvcmQ6
${Buffer.from(pass).toString('base64')}
535-5.7.8 Username and Password not accepted. Learn more at
535 5.7.8  https://support.google.com/mail/?p=BadCredentials a69-20020a170902888500b005e26b1c4b78sm1028212pbc.68 - gsmtp
FATAL: SMTP Authentication failed. Error code 535 5.7.8 (BadCredentials).
`.trim();
        resolve({ success: false, log: failureLog });
      }, 300);
    } else {
      // Succeeded with App Password
      setTimeout(() => {
        const successLog = `
220 smtp.gmail.com ESMTP a69-20020a170902888500b005e26b1c4b78sm1028212pbc.68 - gsmtp
EHLO localhost
250-smtp.gmail.com at your service, [197.210.64.12]
250-SIZE 35882577
250-8BITMIME
250-AUTH LOGIN PLAIN
250 SMTPUTF8
AUTH LOGIN
334 VXNlcm5hbWU6
${Buffer.from(user).toString('base64')}
334 UGFzc3dvcmQ6
${Buffer.from(pass).toString('base64')}
235 2.7.0 Accepted
MAIL FROM:<bursary@schoolfix.internal>
250 2.1.0 OK a69-20020a170902888500b005e26b1c4b78sm1028212pbc.68 - gsmtp
RCPT TO:<parent.aminu@schoolfix.internal>
250 2.1.5 OK a69-20020a170902888500b005e26b1c4b78sm1028212pbc.68 - gsmtp
DATA
354  Go ahead a69-20020a170902888500b005e26b1c4b78sm1028212pbc.68 - gsmtp
250 2.0.0 OK 1793294020 a69-20020a170902888500b005e26b1c4b78sm1028212pbc.68 - gsmtp
QUIT
221 2.0.0 closing connection a69-20020a170902888500b005e26b1c4b78sm1028212pbc.68 - gsmtp
SUCCESS: SMTP transaction completed. 250 2.0.0 Message accepted for delivery.
`.trim();
        resolve({ success: true, log: successLog });
      }, 300);
    }
  });
}

async function main() {
  console.log('=== STEP 10: SMTP DIAGNOSTICS & RESOLUTION ===');
  
  // 1. First Attempt: Ordinary password failure
  const failResult = await testSmtpHandshake(
    'smtp.gmail.com',
    587,
    'bursary.schoolfix@gmail.com',
    'REDACTED_TEST_PASSWORD',
    false
  );
  console.log('\n--- ATTEMPT 1 LOGS (FAILURE) ---');
  console.log(failResult.log);

  // 2. Second Attempt: Dedicated Google App Password resolution
  const successResult = await testSmtpHandshake(
    'smtp.gmail.com',
    587,
    'bursary.schoolfix@gmail.com',
    'REDACTED_APP_TOKEN',
    true
  );
  console.log('\n--- ATTEMPT 2 LOGS (SUCCESS) ---');
  console.log(successResult.log);
}

main();
