async function test() {
  const loginRes = await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin.bursar@schoolfix.internal',
      password: 'Password123@SchoolFix',
    }),
  });
  console.log('Login status:', loginRes.status);
  const cookie = loginRes.headers.get('set-cookie');

  if (cookie) {
    const adminRes = await fetch('http://localhost:3000/portal/admin', {
      headers: { Cookie: cookie.split(';')[0] },
    });
    console.log('/portal/admin status:', adminRes.status);
    const html = await adminRes.text();
    console.log('Contains "Greenfield Academy":', html.includes('Greenfield Academy'));
    console.log('Contains "Setup progress":', html.includes('Setup progress'));
    console.log('Contains "Add school details":', html.includes('Add school details'));
    console.log('Contains "upload handbook for the policy assistant":', html.includes('upload handbook for the policy assistant'));
    console.log('Contains "Collected":', html.includes('Collected'));
    console.log('Contains "Outstanding":', html.includes('Outstanding'));
    console.log('Contains "To verify":', html.includes('To verify'));
    console.log('Contains "Attendance":', html.includes('Attendance'));
    console.log('Contains "Teachers":', html.includes('Teachers'));
  }
}

test().catch(console.error);
