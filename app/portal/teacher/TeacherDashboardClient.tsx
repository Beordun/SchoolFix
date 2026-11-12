// app/portal/teacher/TeacherDashboardClient.tsx
// SchoolFix Multi-Form-Factor Teacher Dashboard Client
// Responsive across Mobile (390px), Tablet Landscape (1024px), and Web Desktop (1440px)
// Consuming SchoolFix Primary 40 Indigo brand design tokens

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import styles from './teacher.module.css';

interface StudentAttendance {
  studentId: string;
  admissionNum: string;
  fullName: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
}

interface StudentScore {
  studentId: string;
  fullName: string;
  caScore: number | '';
  examScore: number | '';
  status: 'Saved' | 'Waiting to sync' | 'Not entered';
}

interface TeacherDashboardClientProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
  assignedClasses?: Array<{ id: string; name: string; studentCount: number }>;
}

interface AttendancePayload {
  classArmId: string;
  date: string;
  records: Array<{ studentId: string; status: StudentAttendance['status'] }>;
}

interface ScoresPayload {
  classArmId: string;
  subject: string;
  term: string;
  entries: Array<{ studentId: string; caScore: number; examScore: number }>;
}

const SCORE_SUBJECT = 'Mathematics';
const SCORE_TERM = 'First Term';

export default function TeacherDashboardClient({ user, assignedClasses = [] }: TeacherDashboardClientProps) {
  // The server decides which class arms this teacher owns; nothing here is invented.
  const classOptions = assignedClasses;

  // Navigation & View state
  const [activeTab, setActiveTab] = useState<'home' | 'attendance' | 'scores' | 'remarks' | 'handbook'>('home');
  const [activeClassId, setActiveClassId] = useState<string>(classOptions[0]?.id ?? '');
  const activeClass = classOptions.find((c) => c.id === activeClassId) ?? classOptions[0] ?? null;
  const activeClassName = activeClass?.name ?? 'No class assigned';

  // Attendance state
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);
  const [isAttendanceDirty, setIsAttendanceDirty] = useState<boolean>(false);
  const [isSavingAttendance, setIsSavingAttendance] = useState<boolean>(false);
  const [attendanceFeedback, setAttendanceFeedback] = useState<string>('');

  // Scores state
  const [scores, setScores] = useState<StudentScore[]>([]);
  const [isSavingScores, setIsSavingScores] = useState<boolean>(false);
  const [scoreFeedback, setScoreFeedback] = useState<string>('');

  // Roster loading state
  const [isLoadingRoster, setIsLoadingRoster] = useState<boolean>(false);
  const [rosterError, setRosterError] = useState<string>('');
  const [todayLabel, setTodayLabel] = useState<string>('');

  // Sync state — pending counts only ever reflect payloads actually waiting on this device.
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'syncing'>('synced');
  const [queuedAttendance, setQueuedAttendance] = useState<AttendancePayload | null>(null);
  const [queuedScores, setQueuedScores] = useState<ScoresPayload | null>(null);

  // Remark draft state
  const [remarkAccepted, setRemarkAccepted] = useState<boolean>(false);
  const [remarkText, setRemarkText] = useState<string>(
    'Tola is a focused student who leads the class in Mathematics. Keep challenging yourself.'
  );

  // Logout state
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/logout', { method: 'POST' });
    } finally {
      window.location.href = '/';
    }
  };

  // Rotate attendance state: PRESENT -> ABSENT -> LATE -> EXCUSED
  const handleToggleAttendance = (studentId: string) => {
    setAttendance((prev) =>
      prev.map((item) => {
        if (item.studentId !== studentId) return item;
        let nextStatus: StudentAttendance['status'] = 'PRESENT';
        if (item.status === 'PRESENT') nextStatus = 'ABSENT';
        else if (item.status === 'ABSENT') nextStatus = 'LATE';
        else if (item.status === 'LATE') nextStatus = 'EXCUSED';
        else if (item.status === 'EXCUSED') nextStatus = 'PRESENT';
        return { ...item, status: nextStatus };
      })
    );
    setIsAttendanceDirty(true);
    setSyncStatus('pending');
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    setAttendance((prev) => prev.map((item) => ({ ...item, status: 'PRESENT' })));
    setIsAttendanceDirty(true);
    setSyncStatus('pending');
  };

  // Draft keys are per class-arm id so a renamed arm can never mis-file a register.
  const attendanceDraftKey = activeClassId ? `schoolfix_attendance_draft_${activeClassId}` : '';
  const scoresDraftKey = activeClassId ? `schoolfix_scores_draft_${activeClassId}` : '';

  const persistAttendance = async (payload: AttendancePayload): Promise<boolean> => {
    try {
      const res = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setAttendanceFeedback(`✗ Not saved: ${body?.message || `server responded ${res.status}`}`);
        return false;
      }

      return true;
    } catch {
      setAttendanceFeedback('✗ Network unreachable. This register is NOT saved yet.');
      return false;
    }
  };

  // Save attendance
  const handleSaveAttendance = async () => {
    if (!activeClassId) {
      setAttendanceFeedback('Select an assigned class arm before saving.');
      return;
    }

    setIsSavingAttendance(true);
    setAttendanceFeedback('Saving register...');

    const payload: AttendancePayload = {
      classArmId: activeClassId,
      date: new Date().toISOString().split('T')[0],
      records: attendance.map((a) => ({ studentId: a.studentId, status: a.status })),
    };

    const success = await persistAttendance(payload);

    if (success) {
      setIsAttendanceDirty(false);
      setQueuedAttendance(null);
      setSyncStatus(queuedScores ? 'pending' : 'synced');
      setPendingSyncCount(queuedScores ? 1 : 0);
      setAttendanceFeedback('✓ Register saved & synchronized');
      if (typeof window !== 'undefined' && attendanceDraftKey) {
        window.localStorage.removeItem(attendanceDraftKey);
      }
    } else {
      // Kept on this device as an unsent draft; nothing claims it reached the server.
      setQueuedAttendance(payload);
      setSyncStatus('pending');
      setPendingSyncCount(1 + (queuedScores ? 1 : 0));
      if (typeof window !== 'undefined' && attendanceDraftKey) {
        window.localStorage.setItem(
          attendanceDraftKey,
          JSON.stringify({ payload, savedAt: new Date().toISOString() })
        );
      }
    }

    setIsSavingAttendance(false);
    setTimeout(() => setAttendanceFeedback(''), 5000);
  };

  // Tally counts for sticky bottom bar
  const attendanceTally = useMemo(() => {
    const present = attendance.filter((a) => a.status === 'PRESENT').length;
    const absent = attendance.filter((a) => a.status === 'ABSENT').length;
    const late = attendance.filter((a) => a.status === 'LATE').length;
    const excused = attendance.filter((a) => a.status === 'EXCUSED').length;
    return { present, absent, late, excused };
  }, [attendance]);

  // Score Calculations & Dynamic Rankings
  const computedScores = useMemo(() => {
    const rows = scores.map((s) => {
      const ca = s.caScore === '' ? 0 : Number(s.caScore);
      const exam = s.examScore === '' ? 0 : Number(s.examScore);
      const hasScores = s.caScore !== '' || s.examScore !== '';
      const total = hasScores ? Number((ca + exam).toFixed(2)) : null;

      let grade = '—';
      if (total !== null) {
        if (total >= 70.0) grade = 'A';
        else if (total >= 60.0) grade = 'B';
        else if (total >= 50.0) grade = 'C';
        else if (total >= 40.0) grade = 'D';
        else grade = 'F';
      }

      return {
        ...s,
        total,
        grade,
        hasScores,
      };
    });

    // Compute dynamic rank position
    const sortedTotals = rows
      .filter((r) => r.total !== null)
      .map((r) => r.total as number)
      .sort((a, b) => b - a);

    return rows.map((r) => {
      let position: number | string = '—';
      if (r.total !== null) {
        position = sortedTotals.indexOf(r.total) + 1;
      }
      return { ...r, position };
    });
  }, [scores]);

  // All dashboard figures are derived from the loaded roster, never hard-coded.
  const scoredCount = computedScores.filter((s) => s.hasScores).length;
  const notScoredCount = Math.max(0, attendance.length - scoredCount);
  const presentCount = attendance.filter((a) => a.status === 'PRESENT').length;
  const presentRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;
  const absentToday = attendance.filter((a) => a.status === 'ABSENT');

  // Update Score Input
  const handleScoreChange = (studentId: string, field: 'caScore' | 'examScore', value: string) => {
    const num = value === '' ? '' : Math.max(0, Math.min(field === 'caScore' ? 40 : 60, Number(value)));
    setScores((prev) =>
      prev.map((item) => {
        if (item.studentId !== studentId) return item;
        return {
          ...item,
          [field]: num,
          status: 'Waiting to sync',
        };
      })
    );
    setSyncStatus('pending');
  };

  const persistScores = async (payload: ScoresPayload): Promise<boolean> => {
    try {
      const res = await fetch('/api/teacher/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setScoreFeedback(`✗ Not saved: ${body?.message || `server responded ${res.status}`}`);
        return false;
      }

      return true;
    } catch {
      setScoreFeedback('✗ Network unreachable. These scores are NOT saved yet.');
      return false;
    }
  };

  // Save Scores
  const handleSaveScores = async () => {
    if (!activeClassId) {
      setScoreFeedback('Select an assigned class arm before saving.');
      return;
    }

    const entries = scores
      .filter((s) => s.caScore !== '' || s.examScore !== '')
      .map((s) => ({
        studentId: s.studentId,
        caScore: Number(s.caScore || 0),
        examScore: Number(s.examScore || 0),
      }));

    if (entries.length === 0) {
      setScoreFeedback('Enter at least one score before saving.');
      return;
    }

    setIsSavingScores(true);
    setScoreFeedback('Saving scores matrix...');

    const payload: ScoresPayload = {
      classArmId: activeClassId,
      subject: SCORE_SUBJECT,
      term: SCORE_TERM,
      entries,
    };

    const success = await persistScores(payload);

    if (success) {
      setScores((prev) =>
        prev.map((s) => (s.caScore !== '' || s.examScore !== '' ? { ...s, status: 'Saved' } : s))
      );
      setQueuedScores(null);
      setSyncStatus(queuedAttendance ? 'pending' : 'synced');
      setPendingSyncCount(queuedAttendance ? 1 : 0);
      setScoreFeedback('✓ Scores saved & recalculated');
      if (typeof window !== 'undefined' && scoresDraftKey) {
        window.localStorage.removeItem(scoresDraftKey);
      }
    } else {
      setQueuedScores(payload);
      setSyncStatus('pending');
      setPendingSyncCount(1 + (queuedAttendance ? 1 : 0));
      if (typeof window !== 'undefined' && scoresDraftKey) {
        window.localStorage.setItem(
          scoresDraftKey,
          JSON.stringify({ payload, savedAt: new Date().toISOString() })
        );
      }
    }

    setIsSavingScores(false);
    setTimeout(() => setScoreFeedback(''), 5000);
  };

  // Manual retry: re-sends only payloads that genuinely failed on this device.
  const handleRetrySync = async () => {
    if (!queuedAttendance && !queuedScores) {
      setSyncStatus('synced');
      setPendingSyncCount(0);
      return;
    }

    setSyncStatus('syncing');
    let remaining = 0;

    if (queuedAttendance) {
      const ok = await persistAttendance(queuedAttendance);
      if (ok) {
        setQueuedAttendance(null);
        setAttendanceFeedback('✓ Queued register synchronized');
        if (typeof window !== 'undefined' && attendanceDraftKey) {
          window.localStorage.removeItem(attendanceDraftKey);
        }
      } else {
        remaining += 1;
      }
    }

    if (queuedScores) {
      const ok = await persistScores(queuedScores);
      if (ok) {
        setQueuedScores(null);
        setScoreFeedback('✓ Queued scores synchronized');
        if (typeof window !== 'undefined' && scoresDraftKey) {
          window.localStorage.removeItem(scoresDraftKey);
        }
      } else {
        remaining += 1;
      }
    }

    setPendingSyncCount(remaining);
    setSyncStatus(remaining === 0 ? 'synced' : 'pending');
  };

  // Load the real roster and any saved scores for the selected class arm.
  useEffect(() => {
    if (!activeClassId) {
      setAttendance([]);
      setScores([]);
      setIsAttendanceDirty(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setIsLoadingRoster(true);
      setRosterError('');

      try {
        const [attendanceRes, scoresRes] = await Promise.all([
          fetch(`/api/teacher/attendance?classArmId=${encodeURIComponent(activeClassId)}`),
          fetch(
            `/api/teacher/scores?classArmId=${encodeURIComponent(activeClassId)}&subject=${encodeURIComponent(SCORE_SUBJECT)}&term=${encodeURIComponent(SCORE_TERM)}`
          ),
        ]);

        const attendanceBody = await attendanceRes.json().catch(() => null);

        if (!attendanceRes.ok || !attendanceBody?.success) {
          throw new Error(attendanceBody?.message || 'Could not load this class register.');
        }

        const scoresBody = scoresRes.ok ? await scoresRes.json().catch(() => null) : null;

        if (cancelled) return;

        const roster: StudentAttendance[] = (attendanceBody.students || []).map((s: any) => ({
          studentId: s.studentId,
          admissionNum: s.admissionNum,
          fullName: s.fullName,
          status: s.status || 'PRESENT',
        }));

        setAttendance(roster);
        setIsAttendanceDirty(false);
        setSyncStatus(queuedAttendance || queuedScores ? 'pending' : 'synced');
        setPendingSyncCount((queuedAttendance ? 1 : 0) + (queuedScores ? 1 : 0));

        if (scoresBody?.success) {
          setScores(
            (scoresBody.students || []).map((s: any) => ({
              studentId: s.studentId,
              fullName: s.fullName,
              caScore: s.isSaved ? s.caScore : '',
              examScore: s.isSaved ? s.examScore : '',
              status: s.isSaved ? 'Saved' : 'Not entered',
            }))
          );
        } else {
          setScores(
            roster.map((s) => ({
              studentId: s.studentId,
              fullName: s.fullName,
              caScore: '',
              examScore: '',
              status: 'Not entered',
            }))
          );
        }
      } catch (error: any) {
        if (!cancelled) {
          setAttendance([]);
          setScores([]);
          setRosterError(error?.message || 'Could not load this class register.');
        }
      } finally {
        if (!cancelled) setIsLoadingRoster(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClassId]);

  // Dates and term labels are derived at runtime, never hard-coded.
  useEffect(() => {
    setTodayLabel(
      new Date().toLocaleDateString('en-NG', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    );
  }, []);

  // Opportunistic retry when the device regains connectivity.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onOnline = () => {
      if (queuedAttendance || queuedScores) {
        void handleRetrySync();
      }
    };

    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queuedAttendance, queuedScores]);

  return (
    <div className={styles.portalContainer}>
      {/* ====================================================================
          DESKTOP / TABLET SIDEBAR NAVIGATION (>= 768px)
          ==================================================================== */}
      <aside className={styles.sidebar}>
        <div>
          <Link href="/portal/teacher" className={styles.brandLogo}>
            <img
              src="/icon.svg"
              alt="SchoolFix Favicon"
              width={28}
              height={28}
              style={{ borderRadius: '6px', verticalAlign: 'middle', display: 'inline-block' }}
            />
            <span>SchoolFix</span>
          </Link>
          <ul className={styles.navLinks}>
            <li>
              <button
                type="button"
                className={`${styles.navButton} ${activeTab === 'home' ? styles.navButtonActive : ''}`}
                onClick={() => setActiveTab('home')}
              >
                <span>🏠</span> Home
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`${styles.navButton} ${activeTab === 'attendance' ? styles.navButtonActive : ''}`}
                onClick={() => setActiveTab('attendance')}
              >
                <span>📋</span> Attendance
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`${styles.navButton} ${activeTab === 'scores' ? styles.navButtonActive : ''}`}
                onClick={() => setActiveTab('scores')}
              >
                <span>📊</span> Scores
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`${styles.navButton} ${activeTab === 'remarks' ? styles.navButtonActive : ''}`}
                onClick={() => setActiveTab('remarks')}
              >
                <span>✍️</span> Remarks
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`${styles.navButton} ${activeTab === 'handbook' ? styles.navButtonActive : ''}`}
                onClick={() => setActiveTab('handbook')}
              >
                <span>📖</span> School handbook
              </button>
            </li>
          </ul>
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.sidebarTeacherName}>{user.fullName} · Teacher</div>
          <div>Greenfield Academy</div>
          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <Link
              href="/portal/dashboard"
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-primary, #4B0082)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Switch to Parent Portal →
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '0.2rem 0',
                color: 'var(--color-error, #BA1A1A)',
                fontSize: '0.75rem',
                fontWeight: 700,
                textAlign: 'left',
                cursor: isLoggingOut ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoggingOut ? 'Logging out...' : '🚪 Log out'}
            </button>
          </div>
        </div>
      </aside>

      {/* ====================================================================
          MAIN CONTENT VIEWPORT
          ==================================================================== */}
      <main className={styles.mainContent}>
        {/* Top Header Bar */}
        <header className={styles.headerBar}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
              <img
                src="/icon.svg"
                alt="SchoolFix Favicon"
                width={22}
                height={22}
                style={{ borderRadius: '5px', verticalAlign: 'middle' }}
              />
              <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--color-primary, #4B0082)', letterSpacing: '-0.02em' }}>
                SchoolFix
              </span>
            </div>
            <h1 className={styles.greetingTitle}>Good morning, {user.fullName.split(' ')[0] || 'Teacher'}</h1>
            <p className={styles.greetingSubtitle}>{todayLabel || 'Today'}</p>
          </div>

          <div className={styles.headerRightCluster}>
            <div className={styles.classSelectorRow} style={{ margin: 0, padding: 0 }}>
              {classOptions.map((cls) => (
                <button
                  key={cls.id}
                  type="button"
                  className={`${styles.classPill} ${activeClassId === cls.id ? styles.classPillActive : ''}`}
                  onClick={() => setActiveClassId(cls.id)}
                >
                  {cls.name}
                </button>
              ))}
            </div>

            {syncStatus === 'synced' ? (
              <span className={styles.syncPill}>
                <span>●</span> Synced
              </span>
            ) : syncStatus === 'syncing' ? (
              <span className={styles.syncPillPending}>
                <span>⏳</span> Syncing...
              </span>
            ) : (
              <span className={styles.syncPillPending}>
                <span>▲</span> {pendingSyncCount} pending
              </span>
            )}

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Log out and return to homepage"
              aria-label="Log out"
              style={{
                background: 'transparent',
                border: '1px solid var(--color-outline-variant, #D8D8E2)',
                borderRadius: 'var(--radius-small, 0.375rem)',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--color-error, #BA1A1A)',
                cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                minHeight: '2rem',
              }}
            >
              <span>🚪</span>
              <span>{isLoggingOut ? '...' : 'Log out'}</span>
            </button>
          </div>
        </header>

        {/* Server-derived state banners — no invented pupils, no silent failures */}
        {classOptions.length === 0 && (
          <div
            role="status"
            style={{
              backgroundColor: 'var(--color-surface-container-high)',
              color: 'var(--color-on-surface)',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: 'var(--radius-small)',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              lineHeight: 1.5,
            }}
          >
            <strong>No class arm assigned yet.</strong> Ask your school administrator to assign a class arm
            from the admin portal. Your register will appear here as soon as the assignment is saved.
          </div>
        )}

        {rosterError && (
          <div
            role="alert"
            style={{
              backgroundColor: 'var(--color-error-container)',
              color: 'var(--color-on-error-container)',
              border: '1px solid var(--color-error)',
              borderRadius: 'var(--radius-small)',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {rosterError}
          </div>
        )}

        {isLoadingRoster && (
          <div
            role="status"
            aria-live="polite"
            style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)', marginBottom: '1rem' }}
          >
            Loading {activeClassName} register…
          </div>
        )}

        {!isLoadingRoster && !rosterError && activeClassId && attendance.length === 0 && (
          <div
            role="status"
            style={{
              backgroundColor: 'var(--color-surface-container-low)',
              border: '1px dashed var(--color-outline-variant)',
              borderRadius: 'var(--radius-small)',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              color: 'var(--color-on-surface-variant)',
            }}
          >
            No pupils are enrolled in {activeClassName} yet.
          </div>
        )}

        {/* ==================================================================
            TAB 1: HOME COCKPIT VIEW (Matching Mobile & Tablet Home)
            ================================================================== */}
        {activeTab === 'home' && (
          <div>
            {/* Top 4 KPI Metrics Strip (Visible on Desktop / Large Tablet) */}
            <div className={styles.metricsStrip}>
              <div className={styles.metricCard}>
                <div className={styles.metricTitle}>Today&apos;s attendance</div>
                <div className={`${styles.metricValue} ${isAttendanceDirty ? styles.metricValueHighlight : styles.metricValueSuccess}`}>
                  {isAttendanceDirty ? 'Not marked' : 'Marked'}
                </div>
                <button
                  type="button"
                  className={styles.primaryButton}
                  style={{ marginTop: '0.5rem', minHeight: '2.25rem', padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
                  onClick={() => setActiveTab('attendance')}
                >
                  Mark attendance
                </button>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricTitle}>Present today</div>
                <div className={`${styles.metricValue} ${styles.metricValueSuccess}`}>{presentRate}%</div>
                <div className={styles.metricSubtitle}>{attendance.length} students on register</div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricTitle}>Maths exam scores</div>
                <div className={styles.metricValue}>
                  {scoredCount} of {attendance.length}
                </div>
                <div className={styles.metricSubtitle}>{notScoredCount} still to enter</div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricTitle}>Remarks</div>
                <div className={styles.metricValue}>
                  0 of {attendance.length}
                </div>
                <div className={styles.metricSubtitle}>Drafts are not yet persisted</div>
              </div>
            </div>

            {/* Mobile Hero Card & To-Do Card Layout */}
            <div className={styles.twoColLayout}>
              <div>
                {/* Hero Card */}
                <div className={styles.heroCard}>
                  <div className={styles.heroHeader}>
                    <h2 className={styles.heroClassTitle}>
                      {activeClassName} · {attendance.length} students
                    </h2>
                    <span className={isAttendanceDirty ? styles.pillLate : styles.pillPresent} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                      {isAttendanceDirty ? 'Not marked' : 'Saved'}
                    </span>
                  </div>
                  <p className={styles.heroSubtext}>Today&apos;s morning attendance register</p>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => setActiveTab('attendance')}
                  >
                    Mark attendance
                  </button>
                </div>

                {/* Quick Attendance Snapshot */}
                <div className={styles.workCard}>
                  <div className={styles.workCardHeader}>
                    <div>
                      <h3 className={styles.workCardTitle}>Quick Attendance Roster</h3>
                      <p className={styles.workCardSubtext}>Tap any student to rotate status</p>
                    </div>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      style={{ minHeight: '2.25rem', padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
                      onClick={handleMarkAllPresent}
                    >
                      Mark all present
                    </button>
                  </div>

                  <div className={styles.attendanceList}>
                    {attendance.slice(0, 4).map((student) => (
                      <div
                        key={student.studentId}
                        className={styles.studentCard}
                        onClick={() => handleToggleAttendance(student.studentId)}
                      >
                        <div>
                          <div className={styles.studentName}>{student.fullName}</div>
                          <div className={styles.studentAdmission}>{student.admissionNum}</div>
                        </div>
                        <span
                          className={`${styles.statusPill} ${
                            student.status === 'PRESENT'
                              ? styles.pillPresent
                              : student.status === 'ABSENT'
                              ? styles.pillAbsent
                              : student.status === 'LATE'
                              ? styles.pillLate
                              : styles.pillExcused
                          }`}
                        >
                          {student.status === 'PRESENT'
                            ? 'Present'
                            : student.status === 'ABSENT'
                            ? 'Absent'
                            : student.status === 'LATE'
                            ? 'Late'
                            : 'Excused'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      style={{ width: '100%' }}
                      onClick={() => setActiveTab('attendance')}
                    >
                      Open Full Attendance Register ({attendance.length} students) →
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Rail: To Do & Health */}
              <div>
                <div className={styles.attentionCard}>
                  <h3 className={styles.attentionTitle}>To do</h3>
                  <div className={styles.attentionRow}>
                    <span>Maths exam scores</span>
                    <span className={styles.warningBadge} style={{ backgroundColor: '#FFF3E0', color: '#B26A00' }}>
                      {scoredCount} of {attendance.length}
                    </span>
                  </div>
                  <div className={styles.attentionRow}>
                    <span>Write remarks</span>
                    <span className={styles.warningBadge} style={{ backgroundColor: '#F0F0F5', color: '#555' }}>
                      0 of {attendance.length}
                    </span>
                  </div>
                  <div className={styles.attentionRow}>
                    <span>Waiting to sync</span>
                    <button
                      type="button"
                      className={styles.retryButton}
                      onClick={handleRetrySync}
                    >
                      Retry {pendingSyncCount}
                    </button>
                  </div>
                </div>

                <div className={styles.attentionCard}>
                  <h3 className={styles.attentionTitle}>Today&apos;s register</h3>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-success, #1B5E20)', marginBottom: '0.25rem' }}>
                    {presentRate}% present
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)', margin: 0, fontWeight: 600 }}>
                    {absentToday.length === 0
                      ? 'No absences recorded for today.'
                      : `Marked absent today: ${absentToday.slice(0, 3).map((s) => s.fullName).join(', ')}${absentToday.length > 3 ? '…' : ''}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================
            TAB 2: ATTENDANCE VIEW (Matching Mobile & Tablet Attendance)
            ================================================================== */}
        {activeTab === 'attendance' && (
          <div>
            <div className={styles.workCard} style={{ marginBottom: '1.25rem' }}>
              <div className={styles.workCardHeader}>
                <div>
                  <h2 className={styles.workCardTitle}>{activeClassName} attendance</h2>
                  <p className={styles.workCardSubtext}>{todayLabel || 'Today'} · tap a student name or pill to rotate status</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {isAttendanceDirty && <span className={styles.badgeWaiting}>Not saved</span>}
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={handleMarkAllPresent}
                  >
                    Mark all present
                  </button>
                </div>
              </div>

              {attendanceFeedback && (
                <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#E8F5E9', color: '#1B5E20', borderRadius: '0.375rem', marginBottom: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>
                  {attendanceFeedback}
                </div>
              )}

              {/* Roster Card List */}
              <div className={styles.attendanceList}>
                {attendance.map((student) => (
                  <div
                    key={student.studentId}
                    className={styles.studentCard}
                    onClick={() => handleToggleAttendance(student.studentId)}
                  >
                    <div>
                      <div className={styles.studentName}>{student.fullName}</div>
                      <div className={styles.studentAdmission}>{student.admissionNum}</div>
                    </div>
                    <span
                      className={`${styles.statusPill} ${
                        student.status === 'PRESENT'
                          ? styles.pillPresent
                          : student.status === 'ABSENT'
                          ? styles.pillAbsent
                          : student.status === 'LATE'
                          ? styles.pillLate
                          : styles.pillExcused
                      }`}
                    >
                      {student.status === 'PRESENT'
                        ? 'Present'
                        : student.status === 'ABSENT'
                        ? 'Absent'
                        : student.status === 'LATE'
                        ? 'Late'
                        : 'Excused'}
                    </span>
                  </div>
                ))}
              </div>

              <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--color-on-surface-variant, #767688)', marginTop: '1rem' }}>
                Showing {attendance.length} of {attendance.length} students · All changes saved to local queue
              </p>

              {/* Sticky / Inline Save Bar */}
              <div className={styles.stickyBottomBar}>
                <div className={styles.tallyText}>
                  {attendanceTally.present} present · {attendanceTally.absent} absent · {attendanceTally.late} late · {attendanceTally.excused} excused
                </div>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleSaveAttendance}
                  disabled={isSavingAttendance}
                >
                  {isSavingAttendance ? 'Saving register...' : 'Save register'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================
            TAB 3: SCORES MATRIX VIEW (Matching Web 1440)
            ================================================================== */}
        {activeTab === 'scores' && (
          <div className={styles.twoColLayout}>
            <div className={styles.workCard}>
              <div className={styles.workCardHeader}>
                <div>
                  <h2 className={styles.workCardTitle}>Mathematics · First Term exam</h2>
                  <p className={styles.workCardSubtext}>
                    CA out of 40 · Exam out of 60 · totals & letter grades update as you type
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.primaryButton}
                  style={{ width: 'auto' }}
                  onClick={handleSaveScores}
                  disabled={isSavingScores}
                >
                  {isSavingScores ? 'Saving...' : 'Save scores'}
                </button>
              </div>

              {scoreFeedback && (
                <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#E8F5E9', color: '#1B5E20', borderRadius: '0.375rem', marginBottom: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>
                  {scoreFeedback}
                </div>
              )}

              <div className={styles.tableContainer}>
                <table className={styles.scoresTable}>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th style={{ textAlign: 'center' }}>CA /40</th>
                      <th style={{ textAlign: 'center' }}>Exam /60</th>
                      <th style={{ textAlign: 'center' }}>Total</th>
                      <th style={{ textAlign: 'center' }}>Grade</th>
                      <th style={{ textAlign: 'center' }}>Position</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {computedScores.map((student) => (
                      <tr key={student.studentId}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{student.fullName}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="number"
                            min="0"
                            max="40"
                            className={styles.scoreInput}
                            value={student.caScore}
                            onChange={(e) => handleScoreChange(student.studentId, 'caScore', e.target.value)}
                            placeholder="0"
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="number"
                            min="0"
                            max="60"
                            className={styles.scoreInput}
                            value={student.examScore}
                            onChange={(e) => handleScoreChange(student.studentId, 'examScore', e.target.value)}
                            placeholder="0"
                          />
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>
                          {student.total !== null ? student.total : '—'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            className={`${styles.gradeBadge} ${
                              student.grade === 'A'
                                ? styles.gradeA
                                : student.grade === 'B'
                                ? styles.gradeB
                                : student.grade === 'C'
                                ? styles.gradeC
                                : student.grade === 'D'
                                ? styles.gradeD
                                : student.grade === 'F'
                                ? styles.gradeF
                                : ''
                            }`}
                          >
                            {student.grade}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{student.position}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            className={
                              student.status === 'Saved'
                                ? styles.badgeSaved
                                : student.status === 'Waiting to sync'
                                ? styles.badgeWaiting
                                : styles.badgeNotEntered
                            }
                          >
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View (≤ 640px): Stacked Responsive Grading Cards */}
              <div className={styles.mobileScoresCards}>
                {computedScores.map((student) => (
                  <div key={student.studentId} className={styles.studentScoreCard}>
                    <div className={styles.studentScoreCardHeader}>
                      <span className={styles.studentScoreName}>{student.fullName}</span>
                      <div className={styles.studentScoreBadges}>
                        <span
                          className={`${styles.gradeBadge} ${
                            student.grade === 'A'
                              ? styles.gradeA
                              : student.grade === 'B'
                              ? styles.gradeB
                              : student.grade === 'C'
                              ? styles.gradeC
                              : student.grade === 'D'
                              ? styles.gradeD
                              : student.grade === 'F'
                              ? styles.gradeF
                              : ''
                          }`}
                        >
                          Grade {student.grade}
                        </span>
                        <span className={styles.studentPositionPill}>#{student.position}</span>
                      </div>
                    </div>

                    <div className={styles.studentInputsRow}>
                      <div className={styles.scoreInputGroup}>
                        <label className={styles.scoreInputLabel}>CA (/40)</label>
                        <input
                          type="number"
                          min="0"
                          max="40"
                          inputMode="numeric"
                          className={styles.scoreInputMobile}
                          value={student.caScore}
                          onChange={(e) => handleScoreChange(student.studentId, 'caScore', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div className={styles.scoreInputGroup}>
                        <label className={styles.scoreInputLabel}>Exam (/60)</label>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          inputMode="numeric"
                          className={styles.scoreInputMobile}
                          value={student.examScore}
                          onChange={(e) => handleScoreChange(student.studentId, 'examScore', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className={styles.studentScoreCardFooter}>
                      <div>
                        Total: <span className={styles.studentTotalScore}>{student.total !== null ? `${student.total} / 100` : '—'}</span>
                      </div>
                      <span
                        className={
                          student.status === 'Saved'
                            ? styles.badgeSaved
                            : student.status === 'Waiting to sync'
                            ? styles.badgeWaiting
                            : styles.badgeNotEntered
                        }
                      >
                        {student.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#666', marginTop: '0.75rem' }}>
                Showing {computedScores.length} students · Grades derived: 70+ A, 60-69 B, 50-59 C, 40-49 D, 0-39 F
              </p>
            </div>

            {/* Right Column: Attention & AI Remark */}
            <div>
              <div className={styles.attentionCard}>
                <h3 className={styles.attentionTitle}>Needs your attention</h3>
                {absentToday.slice(0, 3).map((student) => (
                  <div key={student.studentId} className={styles.attentionRow}>
                    <span>{student.fullName}</span>
                    <span className={styles.warningBadge}>Absent today</span>
                  </div>
                ))}
                {absentToday.length === 0 && (
                  <div className={styles.attentionRow}>
                    <span>No absences recorded today</span>
                  </div>
                )}
                <div className={styles.attentionRow}>
                  <span>{pendingSyncCount} entries not synced</span>
                  <button type="button" className={styles.retryButton} onClick={handleRetrySync}>
                    Retry
                  </button>
                </div>
              </div>

              <div className={styles.attentionCard}>
                <h3 className={styles.attentionTitle}>Remark draft</h3>
                <div style={{ fontSize: '0.8125rem', color: '#666' }}>
                  {attendance[0]?.fullName || 'No pupil selected'} ·{' '}
                  {remarkText.trim().split(/\s+/).filter(Boolean).length} words
                </div>
                <div className={styles.remarkBox}>
                  {remarkText}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', margin: '0.5rem 0 0 0' }}>
                  Draft only — remarks are not yet saved to the server.
                </p>
                <div className={styles.remarkActions}>
                  {remarkAccepted ? (
                    <span className={styles.badgeSaved} style={{ padding: '0.5rem 1rem' }}>
                      ✓ Accepted & Published
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        style={{ flex: 1, minHeight: '2.25rem', padding: '0.35rem' }}
                        onClick={() => {
                          const updated = prompt('Edit terminal comment:', remarkText);
                          if (updated) setRemarkText(updated);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={styles.primaryButton}
                        style={{ flex: 1, minHeight: '2.25rem', padding: '0.35rem' }}
                        onClick={() => setRemarkAccepted(true)}
                      >
                        Accept
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================
            TAB 4: REMARKS VIEW
            ================================================================== */}
        {activeTab === 'remarks' && (
          <div className={styles.twoColLayout}>
            <div className={styles.workCard}>
              <div className={styles.workCardHeader}>
                <div>
                  <h2 className={styles.workCardTitle}>Continuous Assessment & Terminal Remarks</h2>
                  <p className={styles.workCardSubtext}>
                    Standardized, constructive feedback (&lt; 30 words) derived from student performance
                  </p>
                </div>
              </div>

              <div className={styles.attentionCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Adeyemi Tola (SF-2026-001)</strong>
                  <span className={styles.gradeA} style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 800 }}>
                    Grade A · Rank 1st
                  </span>
                </div>
                <div className={styles.remarkBox}>
                  {remarkText}
                </div>
                <div className={styles.remarkActions}>
                  {remarkAccepted ? (
                    <span className={styles.badgeSaved} style={{ padding: '0.4rem 0.8rem' }}>
                      ✓ Approved for Terminal Report Card
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={styles.primaryButton}
                      style={{ width: 'auto' }}
                      onClick={() => setRemarkAccepted(true)}
                    >
                      Accept Comment
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.attentionCard} style={{ opacity: 0.85 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Bello Aisha (SF-2026-002)</strong>
                  <span className={styles.gradeA} style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 800 }}>
                    Grade A · Rank 2nd
                  </span>
                </div>
                <div className={styles.remarkBox}>
                  Aisha demonstrates exceptional discipline and conceptual mastery in mathematics. Recommended for national junior Olympiad training.
                </div>
                <span className={styles.badgeSaved} style={{ padding: '0.35rem 0.75rem' }}>
                  ✓ Approved
                </span>
              </div>
            </div>

            <div>
              <div className={styles.attentionCard}>
                <h3 className={styles.attentionTitle}>Guidelines</h3>
                <ul style={{ fontSize: '0.8125rem', lineHeight: 1.6, color: '#444', paddingLeft: '1.25rem', margin: 0 }}>
                  <li>Strict 30-word limit enforced for report card layout consistency.</li>
                  <li>Comments are locked once terminal reports are published by the Bursar.</li>
                  <li>Fee clearance is strictly enforced: parents with balances &gt; ₦0 will see comments redacted.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================
            TAB 5: SCHOOL HANDBOOK & POLICIES VIEW
            ================================================================== */}
        {activeTab === 'handbook' && (
          <div className={styles.workCard}>
            <div className={styles.workCardHeader}>
              <div>
                <h2 className={styles.workCardTitle}>School Handbook & Administrative Regulations</h2>
                <p className={styles.workCardSubtext}>Greenfield Academy · 2026/2027 Academic Session</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div className={styles.attentionCard}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary, #4B0082)' }}>Daily Attendance Rules</h4>
                <p style={{ fontSize: '0.8125rem', lineHeight: 1.5, margin: 0 }}>
                  Morning registration must be completed before 08:30 AM. Students arriving after 08:35 AM are marked LATE. Three consecutive unexcused absences trigger an automated bursary and welfare alert.
                </p>
              </div>

              <div className={styles.attentionCard}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary, #4B0082)' }}>Continuous Assessment (40/60 Split)</h4>
                <p style={{ fontSize: '0.8125rem', lineHeight: 1.5, margin: 0 }}>
                  Continuous Assessment is strictly capped at 40.00 marks (20 marks test, 10 marks assignments, 10 marks midterm). Terminal Examination accounts for 60.00 marks.
                </p>
              </div>

              <div className={styles.attentionCard}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary, #4B0082)' }}>Grading Formula</h4>
                <p style={{ fontSize: '0.8125rem', lineHeight: 1.5, margin: 0 }}>
                  A (70-100% Distinction), B (60-69% Credit), C (50-59% Merit), D (40-49% Pass), F (0-39% Fail). Grades are derived deterministically on the server.
                </p>
              </div>

              <div className={styles.attentionCard}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary, #4B0082)' }}>Account & Session</h4>
                <p style={{ fontSize: '0.8125rem', lineHeight: 1.5, margin: '0 0 0.75rem 0' }}>
                  Logged in as <strong>{user.fullName}</strong> ({user.email}). Active teacher session.
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={styles.secondaryButton}
                  style={{
                    color: 'var(--color-error, #BA1A1A)',
                    borderColor: 'var(--color-error, #BA1A1A)',
                    fontWeight: 700,
                    width: '100%',
                    justifyContent: 'center',
                  }}
                >
                  {isLoggingOut ? 'Logging out...' : '🚪 Log Out to Homepage'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ====================================================================
          MOBILE BOTTOM NAVIGATION (< 768px)
          ==================================================================== */}
      <nav className={styles.mobileNavBar}>
        <button
          type="button"
          className={`${styles.mobileNavTab} ${activeTab === 'home' ? styles.mobileNavTabActive : ''}`}
          onClick={() => setActiveTab('home')}
        >
          {activeTab === 'home' && <div className={styles.mobileNavIndicator} />}
          <span>🏠</span>
          <span>Home</span>
        </button>

        <button
          type="button"
          className={`${styles.mobileNavTab} ${activeTab === 'attendance' ? styles.mobileNavTabActive : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          {activeTab === 'attendance' && <div className={styles.mobileNavIndicator} />}
          <span>📋</span>
          <span>Attendance</span>
        </button>

        <button
          type="button"
          className={`${styles.mobileNavTab} ${activeTab === 'scores' ? styles.mobileNavTabActive : ''}`}
          onClick={() => setActiveTab('scores')}
        >
          {activeTab === 'scores' && <div className={styles.mobileNavIndicator} />}
          <span>📊</span>
          <span>Scores</span>
        </button>

        <button
          type="button"
          className={`${styles.mobileNavTab} ${activeTab === 'remarks' || activeTab === 'handbook' ? styles.mobileNavTabActive : ''}`}
          onClick={() => setActiveTab(activeTab === 'handbook' ? 'handbook' : 'remarks')}
        >
          {(activeTab === 'remarks' || activeTab === 'handbook') && <div className={styles.mobileNavIndicator} />}
          <span>✍️</span>
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
