/* scripts/verify-invite-rbac.js
 * SchoolFix — Teacher Invitation, Activation & RBAC verification harness.
 *
 * This script exercises the real HTTP surface of a running SchoolFix server and
 * asserts the machine-verifiable security properties of the P0 hardening batch:
 *
 *   1. Unauthenticated / parent callers cannot mint teacher invites.
 *   2. The setup code is a CSPRNG SF-###### value, stored only as a SHA-256 digest,
 *      with a 72-hour expiry.
 *   3. Activation rejects wrong codes, expired codes, unknown emails and code reuse.
 *   4. Identity and class-arm assignment come from the server, never the client.
 *   5. A teacher can only read/write attendance and scores inside assigned arms,
 *      and cannot write a record for a pupil from another class arm.
 *
 * Rows created by this script are removed in the finally block. No schema is
 * ever touched. Run against a started server:
 *
 *   npx next start -p 3100
 *   node scripts/verify-invite-rbac.js
 */

const crypto = require('crypto');
const argon2 = require('argon2');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const BASE_URL = (process.env.SF_BASE_URL || 'http://127.0.0.1:3100').replace(/\/+$/, '');
const CLIENT_IP = '203.0.113.77';
const RUN = `${Date.now()}`;

const RESULTS = [];
const created = {
  userIds: [],
  classArmIds: [],
  studentIds: [],
};

function record(name, expected, actual, extra = '') {
  const pass = expected === actual;
  RESULTS.push({ name, pass, expected, actual, extra });
  const status = pass ? 'PASS' : 'FAIL';
  console.log(`${status} | ${name} | expected=${expected} actual=${actual}${extra ? ` | ${extra}` : ''}`);
}

async function http(path, { method = 'GET', body, cookie, ip = CLIENT_IP } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
      ...(cookie ? { cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  const setCookies =
    typeof res.headers.getSetCookie === 'function'
      ? res.headers.getSetCookie()
      : [res.headers.get('set-cookie')].filter(Boolean);

  const sessionCookie = setCookies
    .map((entry) => entry.split(';')[0])
    .find((entry) => entry.startsWith('schoolfix_session='));

  return { status: res.status, json, sessionCookie };
}

async function makeUser({ email, fullName, role, password }) {
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const user = await prisma.user.create({
    data: {
      email,
      fullName,
      role,
      nin: `NIN-VERIFY-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      passwordHash,
      isVerified: true,
    },
  });

  created.userIds.push(user.id);
  return user;
}

async function login(email, password, ip) {
  // The login route has its own rate limiter; use distinct IPs for distinct users.
  return http('/api/login', {
    method: 'POST',
    body: { email, password },
    ip,
  });
}

async function main() {
  const health = await fetch(`${BASE_URL}/api/health-does-not-exist`);
  if (health.status === 0) throw new Error('server unreachable');
  void health;

  const adminEmail = `verify.admin.${RUN}@schoolfix.internal`;
  const parentEmail = `verify.parent.${RUN}@schoolfix.internal`;
  const teacherEmail = `verify.teacher.${RUN}@schoolfix.internal`;
  const adminPassword = `Admin!${RUN}aB3`;
  const parentPassword = `Parent!${RUN}aB3`;
  const teacherPassword = `Teacher!${RUN}aB3`;

  // ---------- Fixtures ----------
  await makeUser({ email: adminEmail, fullName: 'Verification Admin', role: 'ADMIN', password: adminPassword });
  await makeUser({ email: parentEmail, fullName: 'Verification Parent', role: 'PARENT', password: parentPassword });

  const armName = `Verification Arm A ${RUN}`;
  const otherArmName = `Verification Arm B ${RUN}`;

  const armA = await prisma.classArm.create({ data: { name: armName } });
  const armB = await prisma.classArm.create({ data: { name: otherArmName } });
  created.classArmIds.push(armA.id, armB.id);

  const studentA = await prisma.student.create({
    data: { admissionNum: `SF-VER-A-${RUN}`, fullName: 'Verification Pupil A', classArmId: armA.id },
  });
  const studentB = await prisma.student.create({
    data: { admissionNum: `SF-VER-B-${RUN}`, fullName: 'Verification Pupil B', classArmId: armB.id },
  });
  created.studentIds.push(studentA.id, studentB.id);

  const adminLogin = await login(adminEmail, adminPassword, '198.51.100.11');
  record('ADMIN can sign in', 200, adminLogin.status);
  const adminCookie = adminLogin.sessionCookie;

  const parentLogin = await login(parentEmail, parentPassword, '198.51.100.12');
  record('PARENT can sign in', 200, parentLogin.status);
  const parentCookie = parentLogin.sessionCookie;

  // ---------- Invite authorization ----------
  const invitePayload = {
    fullName: 'Verification Teacher',
    email: teacherEmail,
    phone: '08031234567',
    classArmName: armName,
  };

  const anonymousInvite = await http('/api/teachers/invite', { method: 'POST', body: invitePayload });
  record('Anonymous invite is refused (401)', 401, anonymousInvite.status);

  const parentInvite = await http('/api/teachers/invite', {
    method: 'POST',
    body: invitePayload,
    cookie: parentCookie,
  });
  record('PARENT invite is refused (403)', 403, parentInvite.status);

  // ---------- Invite creation ----------
  const invite = await http('/api/teachers/invite', {
    method: 'POST',
    body: invitePayload,
    cookie: adminCookie,
  });
  record('ADMIN invite is created (201)', 201, invite.status);

  const setupCode = invite.json?.setupCode;
  const expiresAt = invite.json?.expiresAt ? new Date(invite.json.expiresAt) : null;
  const ttlHours = expiresAt ? (expiresAt.getTime() - Date.now()) / 3_600_000 : -1;

  record('Setup code matches SF-###### CSPRNG format', true, /^SF-\d{6}$/.test(setupCode || ''), setupCode);
  record('Invite expires in ~72 hours', true, ttlHours > 71.9 && ttlHours <= 72.01, `${ttlHours.toFixed(2)}h`);
  record(
    'Invite returns a WhatsApp share message',
    true,
    typeof invite.json?.whatsappText === 'string' && invite.json.whatsappText.length > 40
  );

  const invitedUser = await prisma.user.findUnique({ where: { email: teacherEmail } });
  // The teacher row is created by the endpoint, not by makeUser(); track it for cleanup.
  if (invitedUser && !created.userIds.includes(invitedUser.id)) created.userIds.push(invitedUser.id);
  record('Invite creates an unverified TEACHER row', 'TEACHER:false', `${invitedUser?.role}:${invitedUser?.isVerified}`);
  record(
    'Stored invite secret is a SHA-256 digest, not the code',
    true,
    /^[0-9a-f]{64}$/.test(invitedUser?.verificationCode || '') && invitedUser.verificationCode !== setupCode
  );

  // ---------- Activation failures ----------
  const wrongCode = setupCode === 'SF-000000' ? 'SF-111111' : 'SF-000000';
  const wrongActivation = await http('/api/teachers/activate', {
    method: 'POST',
    body: {
      code: wrongCode,
      fullName: 'Verification Teacher',
      email: teacherEmail,
      phone: '08031234567',
      password: teacherPassword,
      acceptedTerms: true,
    },
  });
  record('Wrong setup code is refused (400)', 400, wrongActivation.status, wrongActivation.json?.error || '');
  record(
    'Wrong code does not consume the invitation',
    true,
    Boolean((await prisma.user.findUnique({ where: { email: teacherEmail } }))?.verificationCode)
  );

  const unknownEmailActivation = await http('/api/teachers/activate', {
    method: 'POST',
    body: {
      code: setupCode,
      fullName: 'Nobody Invited',
      email: `verify.unknown.${RUN}@schoolfix.internal`,
      phone: '08031234567',
      password: teacherPassword,
      acceptedTerms: true,
    },
  });
  record('Open self-registration as TEACHER is refused (400)', 400, unknownEmailActivation.status);

  // Expire the code deliberately, then attempt activation.
  await prisma.user.update({
    where: { email: teacherEmail },
    data: { codeExpiresAt: new Date(Date.now() - 60_000) },
  });

  const expiredActivation = await http('/api/teachers/activate', {
    method: 'POST',
    body: {
      code: setupCode,
      fullName: 'Verification Teacher',
      email: teacherEmail,
      phone: '08031234567',
      password: teacherPassword,
      acceptedTerms: true,
    },
  });
  record('Expired setup code is refused (400)', 400, expiredActivation.status);
  record(
    'Expired digest is cleared from the row',
    true,
    (await prisma.user.findUnique({ where: { email: teacherEmail } }))?.verificationCode === null
  );

  // ---------- Re-issue and activate ----------
  const reinvite = await http('/api/teachers/invite', {
    method: 'POST',
    body: invitePayload,
    cookie: adminCookie,
  });
  record('ADMIN can re-issue an invite (201)', 201, reinvite.status);

  const reissuedUser = await prisma.user.findUnique({ where: { email: teacherEmail } });
  record('Re-issue does not duplicate the teacher row', invitedUser?.id, reissuedUser?.id);

  const goodCode = reinvite.json?.setupCode;

  const activation = await http('/api/teachers/activate', {
    method: 'POST',
    body: {
      code: goodCode,
      // Deliberately wrong client-supplied identity and arm: the server must ignore them.
      fullName: 'Attacker Chosen Name',
      email: teacherEmail,
      phone: '08031234567',
      password: teacherPassword,
      acceptedTerms: true,
    },
  });
  record('Valid invite activates the account (200)', 200, activation.status);
  record('Activation issues an HttpOnly session cookie', true, Boolean(activation.sessionCookie));
  record(
    'Activation uses the administrator-authored name',
    'Verification Teacher',
    activation.json?.user?.fullName || ''
  );
  record('Activation reports the administrator-assigned arm', armName, activation.json?.user?.assignedClassArm || '');

  const activated = await prisma.user.findUnique({ where: { email: teacherEmail } });
  record('Activated teacher is verified with no live code', 'true:null', `${activated?.isVerified}:${activated?.verificationCode}`);

  const assignments = await prisma.teacherClassAssignment.findMany({
    where: { teacherId: activated.id },
    include: { classArm: true },
  });
  record(
    'Only the admin-assigned class arm is attached',
    `1:${armName}`,
    `${assignments.length}:${assignments[0]?.classArm?.name || ''}`
  );

  const reuse = await http('/api/teachers/activate', {
    method: 'POST',
    body: {
      code: goodCode,
      fullName: 'Verification Teacher',
      email: teacherEmail,
      phone: '08031234567',
      password: teacherPassword,
      acceptedTerms: true,
    },
  });
  record('Single-use: replaying the code is refused (409)', 409, reuse.status, reuse.json?.error || '');

  // ---------- Teacher RBAC ----------
  const teacherLogin = await login(teacherEmail, teacherPassword, '198.51.100.13');
  record('Activated teacher can sign in (200)', 200, teacherLogin.status);
  const teacherCookie = teacherLogin.sessionCookie;

  const ownRegister = await http(`/api/teacher/attendance?classArmId=${armA.id}`, {
    cookie: teacherCookie,
    ip: '198.51.100.13',
  });
  record('Teacher reads own class register (200)', 200, ownRegister.status);

  const foreignRegister = await http(`/api/teacher/attendance?classArmId=${armB.id}`, {
    cookie: teacherCookie,
    ip: '198.51.100.13',
  });
  record('Teacher blocked from another class register (403)', 403, foreignRegister.status, foreignRegister.json?.error || '');

  const foreignAttendanceWrite = await http('/api/teacher/attendance', {
    method: 'POST',
    cookie: teacherCookie,
    ip: '198.51.100.13',
    body: {
      classArmId: armA.id,
      date: new Date().toISOString().split('T')[0],
      records: [{ studentId: studentB.id, status: 'PRESENT' }],
    },
  });
  record(
    'Attendance write for a foreign pupil is refused (403)',
    403,
    foreignAttendanceWrite.status,
    foreignAttendanceWrite.json?.error || ''
  );

  const ownAttendanceWrite = await http('/api/teacher/attendance', {
    method: 'POST',
    cookie: teacherCookie,
    ip: '198.51.100.13',
    body: {
      classArmId: armA.id,
      date: new Date().toISOString().split('T')[0],
      records: [{ studentId: studentA.id, status: 'PRESENT' }],
    },
  });
  record('Attendance write for own pupil succeeds (200)', 200, ownAttendanceWrite.status);

  const foreignScoresRead = await http(
    `/api/teacher/scores?classArmId=${armB.id}&subject=Mathematics&term=First%20Term`,
    { cookie: teacherCookie, ip: '198.51.100.13' }
  );
  record('Teacher blocked from another arm\u2019s scores (403)', 403, foreignScoresRead.status);

  const foreignScoreWrite = await http('/api/teacher/scores', {
    method: 'POST',
    cookie: teacherCookie,
    ip: '198.51.100.13',
    body: {
      classArmId: armA.id,
      subject: 'Mathematics',
      term: 'First Term',
      entries: [{ studentId: studentB.id, caScore: 30, examScore: 40 }],
    },
  });
  record('Score write for a foreign pupil is refused (403)', 403, foreignScoreWrite.status);

  const ownScoreWrite = await http('/api/teacher/scores', {
    method: 'POST',
    cookie: teacherCookie,
    ip: '198.51.100.13',
    body: {
      classArmId: armA.id,
      subject: 'Mathematics',
      term: 'First Term',
      entries: [{ studentId: studentA.id, caScore: 35, examScore: 55 }],
    },
  });
  record('Score write for own pupil succeeds (200)', 200, ownScoreWrite.status);

  const ownScoresRead = await http(
    `/api/teacher/scores?classArmId=${armA.id}&subject=Mathematics&term=First%20Term`,
    { cookie: teacherCookie, ip: '198.51.100.13' }
  );
  const written = (ownScoresRead.json?.students || []).find((s) => s.studentId === studentA.id);
  record('40/60 split stored deterministically', '35:55:90:A', `${written?.caScore}:${written?.examScore}:${written?.totalScore}:${written?.grade}`);
}

main()
  .catch((error) => {
    console.error('HARNESS ERROR:', error);
    RESULTS.push({ name: 'harness', pass: false });
  })
  .finally(async () => {
    try {
      await prisma.attendance.deleteMany({ where: { studentId: { in: created.studentIds } } });
      await prisma.assessment.deleteMany({ where: { studentId: { in: created.studentIds } } });
      await prisma.student.deleteMany({ where: { id: { in: created.studentIds } } });
      await prisma.teacherClassAssignment.deleteMany({ where: { classArmId: { in: created.classArmIds } } });
      await prisma.classArm.deleteMany({ where: { id: { in: created.classArmIds } } });
      await prisma.session.deleteMany({ where: { userId: { in: created.userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: created.userIds } } });
      // Safety net: any fixture row from this run that was not tracked above.
      await prisma.user.deleteMany({ where: { email: { endsWith: `.${RUN}@schoolfix.internal` } } });
    } catch (cleanupError) {
      console.error('CLEANUP ERROR (fixtures may remain):', cleanupError.message);
    }

    const passed = RESULTS.filter((r) => r.pass).length;
    console.log(`\nSUMMARY: ${passed}/${RESULTS.length} checks passed`);
    await prisma.$disconnect();
    process.exit(RESULTS.every((r) => r.pass) ? 0 : 1);
  });
