// app/portal/admin/components/TeachersView.tsx
// SchoolFix Administrator Teaching Staff Directory & Class Arm Assignment (RBAC Boundary)
'use client';

import React, { useState } from 'react';

export interface Teacher {
  id: string;
  staffId: string;
  fullName: string;
  email: string;
  phone: string;
  subjects: string;
  assignedClassArm: string | null;
  status: 'ACTIVE' | 'INVITED';
  attendanceSubmittedToday: boolean;
  attendanceTime?: string;
}

export default function TeachersView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState<'ALL' | 'ASSIGNED' | 'UNASSIGNED'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [reassignTeacher, setReassignTeacher] = useState<Teacher | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Available class arms for assignment
  const availableClassArms = [
    'Nursery 2 Diamond',
    'Primary 1 Gold',
    'Primary 2 Silver',
    'Primary 3 Bronze',
    'Primary 4 Blue',
    'Primary 5 Emerald',
    'JSS 1 Ruby',
    'JSS 2 Diamond',
    'SSS 1 Science',
  ];

  // Initial Seeded Teachers (Nigerian domain personas)
  const [teachers, setTeachers] = useState<Teacher[]>([
    {
      id: 'TEA-01',
      staffId: 'SF-TEA-001',
      fullName: 'Mr. Ibrahim Danladi',
      email: 'teacher.ibrahim@schoolfix.internal',
      phone: '08034567891',
      subjects: 'Mathematics & Basic Science',
      assignedClassArm: 'Primary 4 Blue',
      status: 'ACTIVE',
      attendanceSubmittedToday: true,
      attendanceTime: '08:14 AM',
    },
    {
      id: 'TEA-02',
      staffId: 'SF-TEA-002',
      fullName: 'Mrs. Folake Badmus',
      email: 'teacher.folake@schoolfix.internal',
      phone: '08023456782',
      subjects: 'Early Childhood & Phonics',
      assignedClassArm: 'Nursery 2 Diamond',
      status: 'ACTIVE',
      attendanceSubmittedToday: true,
      attendanceTime: '08:05 AM',
    },
    {
      id: 'TEA-03',
      staffId: 'SF-TEA-003',
      fullName: 'Mr. Emeka Okonkwo',
      email: 'teacher.emeka@schoolfix.internal',
      phone: '08056789013',
      subjects: 'English Studies & Literature',
      assignedClassArm: 'Primary 1 Gold',
      status: 'ACTIVE',
      attendanceSubmittedToday: true,
      attendanceTime: '08:22 AM',
    },
    {
      id: 'TEA-04',
      staffId: 'SF-TEA-004',
      fullName: 'Mrs. Amina Yusuf',
      email: 'teacher.amina@schoolfix.internal',
      phone: '08078901234',
      subjects: 'Social Studies & Civic Education',
      assignedClassArm: 'Primary 2 Silver',
      status: 'ACTIVE',
      attendanceSubmittedToday: true,
      attendanceTime: '08:18 AM',
    },
    {
      id: 'TEA-05',
      staffId: 'SF-TEA-005',
      fullName: 'Mr. Chinedu Eze',
      email: 'teacher.chinedu@schoolfix.internal',
      phone: '08090123455',
      subjects: 'Basic Technology & Physical Health',
      assignedClassArm: 'Primary 3 Bronze',
      status: 'ACTIVE',
      attendanceSubmittedToday: false,
    },
    {
      id: 'TEA-06',
      staffId: 'SF-TEA-006',
      fullName: 'Mr. Babatunde Lawal',
      email: 'teacher.babatunde@schoolfix.internal',
      phone: '08021234566',
      subjects: 'Integrated Science & Agricultural Science',
      assignedClassArm: 'JSS 1 Ruby',
      status: 'ACTIVE',
      attendanceSubmittedToday: true,
      attendanceTime: '08:29 AM',
    },
    {
      id: 'TEA-07',
      staffId: 'SF-TEA-007',
      fullName: 'Mrs. Grace Ogbonna',
      email: 'teacher.grace@schoolfix.internal',
      phone: '08039876547',
      subjects: 'Business Studies & French',
      assignedClassArm: 'JSS 2 Diamond',
      status: 'ACTIVE',
      attendanceSubmittedToday: true,
      attendanceTime: '08:10 AM',
    },
    {
      id: 'TEA-08',
      staffId: 'SF-TEA-008',
      fullName: 'Miss Ngozi Adebayo',
      email: 'teacher.ngozi@schoolfix.internal',
      phone: '08051239878',
      subjects: 'Computer Studies & ICT',
      assignedClassArm: null, // Subject teacher across multiple classes
      status: 'INVITED',
      attendanceSubmittedToday: false,
    },
  ]);

  // Form State for Adding Teacher
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('080');
  const [newSubjects, setNewSubjects] = useState('');
  const [newClassArm, setNewClassArm] = useState('');

  // Form State for Reassigning Teacher
  const [targetClassArm, setTargetClassArm] = useState('');

  // Handle Add Teacher Form Submission
  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newEmail) return;

    const newTeacherRecord: Teacher = {
      id: `TEA-${Date.now().toString().slice(-4)}`,
      staffId: `SF-TEA-${(teachers.length + 1).toString().padStart(3, '0')}`,
      fullName: newFullName.trim(),
      email: newEmail.trim().toLowerCase(),
      phone: newPhone.trim(),
      subjects: newSubjects.trim() || 'General Studies',
      assignedClassArm: newClassArm || null,
      status: 'ACTIVE',
      attendanceSubmittedToday: false,
    };

    setTeachers((prev) => [newTeacherRecord, ...prev]);
    setShowAddModal(false);
    setNewFullName('');
    setNewEmail('');
    setNewPhone('080');
    setNewSubjects('');
    setNewClassArm('');

    const classMsg = newClassArm ? ` and assigned to ${newClassArm}` : '';
    setSuccessToast(`✓ ${newTeacherRecord.fullName} added successfully${classMsg}! Welcome invite dispatched to ${newTeacherRecord.email}.`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  // Handle Reassign Class Form Submission
  const handleReassignClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignTeacher) return;

    setTeachers((prev) =>
      prev.map((t) => (t.id === reassignTeacher.id ? { ...t, assignedClassArm: targetClassArm || null } : t))
    );

    const reassignedName = reassignTeacher.fullName;
    setReassignTeacher(null);
    setTargetClassArm('');

    const destMsg = targetClassArm ? `assigned to ${targetClassArm}` : 'set to Unassigned (Subject Teacher)';
    setSuccessToast(`✓ Class assignment updated: ${reassignedName} is now ${destMsg}.`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  // Filtered teachers list
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subjects.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.assignedClassArm && teacher.assignedClassArm.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (assignmentFilter === 'ASSIGNED') return teacher.assignedClassArm !== null;
    if (assignmentFilter === 'UNASSIGNED') return teacher.assignedClassArm === null;
    return true;
  });

  const totalTeachers = teachers.length;
  const assignedTeachers = teachers.filter((t) => t.assignedClassArm !== null).length;
  const attendanceToday = teachers.filter((t) => t.assignedClassArm !== null && t.attendanceSubmittedToday).length;
  const pendingInvites = teachers.filter((t) => t.status === 'INVITED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      {/* 1. Header with Title and Add Teacher Action */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--spacing-4)',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'var(--type-headline-medium-size)',
              lineHeight: 'var(--type-headline-medium-line-height)',
              fontWeight: 700,
              margin: 0,
              color: 'var(--color-on-surface)',
            }}
          >
            Teachers &amp; Class Assignments 👩‍🏫
          </h1>
          <p
            style={{
              fontSize: 'var(--type-body-medium-size)',
              color: 'var(--color-on-surface-variant)',
              margin: 'var(--spacing-1) 0 0 0',
            }}
          >
            Manage teaching staff credentials, subject specializations, and RBAC class arm boundaries.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--spacing-2)',
            padding: 'var(--spacing-3) var(--spacing-5)',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            border: 'none',
            borderRadius: 'var(--radius-small)',
            fontWeight: 700,
            fontSize: 'var(--type-label-large-size)',
            cursor: 'pointer',
            minHeight: 'var(--size-touch-target)',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <span>＋</span> Add New Teacher
        </button>
      </div>

      {/* Success Feedback Toast */}
      {successToast && (
        <div
          style={{
            padding: 'var(--spacing-3) var(--spacing-4)',
            backgroundColor: 'var(--color-success-container)',
            color: 'var(--color-on-success-container)',
            borderRadius: 'var(--radius-small)',
            border: '1px solid var(--color-success)',
            fontWeight: 600,
            fontSize: 'var(--type-body-medium-size)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{successToast}</span>
          <button
            onClick={() => setSuccessToast(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Overview Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))',
          gap: 'var(--spacing-4)',
        }}
      >
        {/* Total Teachers */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-medium)',
            border: '1px solid var(--color-outline-variant)',
            padding: 'var(--spacing-4)',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <span
            style={{
              fontSize: 'var(--type-label-small-size)',
              fontWeight: 600,
              color: 'var(--color-on-surface-variant)',
              textTransform: 'uppercase',
            }}
          >
            Total Teaching Staff
          </span>
          <div
            style={{
              fontSize: 'var(--type-headline-medium-size)',
              lineHeight: 1.2,
              fontWeight: 800,
              color: 'var(--color-on-surface)',
              marginTop: 'var(--spacing-1)',
            }}
          >
            {totalTeachers}
          </div>
          <div
            style={{
              fontSize: 'var(--type-body-small-size)',
              color: 'var(--color-on-surface-variant)',
              marginTop: 'var(--spacing-1)',
            }}
          >
            Across all sections
          </div>
        </div>

        {/* Assigned Form Teachers */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-medium)',
            border: '1px solid var(--color-outline-variant)',
            padding: 'var(--spacing-4)',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <span
            style={{
              fontSize: 'var(--type-label-small-size)',
              fontWeight: 600,
              color: 'var(--color-on-surface-variant)',
              textTransform: 'uppercase',
            }}
          >
            Assigned Form Teachers
          </span>
          <div
            style={{
              fontSize: 'var(--type-headline-medium-size)',
              lineHeight: 1.2,
              fontWeight: 800,
              color: 'var(--color-primary)',
              marginTop: 'var(--spacing-1)',
            }}
          >
            {assignedTeachers}
          </div>
          <div
            style={{
              fontSize: 'var(--type-body-small-size)',
              color: 'var(--color-on-surface-variant)',
              marginTop: 'var(--spacing-1)',
            }}
          >
            Active class arm managers
          </div>
        </div>

        {/* Attendance Submission Today */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-medium)',
            border: '1px solid var(--color-outline-variant)',
            padding: 'var(--spacing-4)',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <span
            style={{
              fontSize: 'var(--type-label-small-size)',
              fontWeight: 600,
              color: 'var(--color-on-surface-variant)',
              textTransform: 'uppercase',
            }}
          >
            Attendance Submitted Today
          </span>
          <div
            style={{
              fontSize: 'var(--type-headline-medium-size)',
              lineHeight: 1.2,
              fontWeight: 800,
              color: attendanceToday === assignedTeachers ? 'var(--color-success)' : 'var(--color-warning)',
              marginTop: 'var(--spacing-1)',
            }}
          >
            {attendanceToday} / {assignedTeachers}
          </div>
          <div
            style={{
              fontSize: 'var(--type-body-small-size)',
              color: 'var(--color-on-surface-variant)',
              marginTop: 'var(--spacing-1)',
            }}
          >
            {attendanceToday === assignedTeachers ? '100% complete' : `${assignedTeachers - attendanceToday} arm(s) pending`}
          </div>
        </div>

        {/* Pending Invites */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-medium)',
            border: '1px solid var(--color-outline-variant)',
            padding: 'var(--spacing-4)',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <span
            style={{
              fontSize: 'var(--type-label-small-size)',
              fontWeight: 600,
              color: 'var(--color-on-surface-variant)',
              textTransform: 'uppercase',
            }}
          >
            Pending Invites
          </span>
          <div
            style={{
              fontSize: 'var(--type-headline-medium-size)',
              lineHeight: 1.2,
              fontWeight: 800,
              color: pendingInvites > 0 ? 'var(--color-warning)' : 'var(--color-on-surface)',
              marginTop: 'var(--spacing-1)',
            }}
          >
            {pendingInvites}
          </div>
          <div
            style={{
              fontSize: 'var(--type-body-small-size)',
              color: 'var(--color-on-surface-variant)',
              marginTop: 'var(--spacing-1)',
            }}
          >
            Awaiting login activation
          </div>
        </div>
      </div>

      {/* 3. Search Bar and Filter Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--spacing-3)',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: '1 1 18rem', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search teacher by name, staff ID, subject, or class arm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--spacing-2) var(--spacing-4)',
              paddingLeft: '2.5rem',
              backgroundColor: 'var(--color-surface-container-lowest)',
              color: 'var(--color-on-surface)',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: 'var(--radius-small)',
              fontSize: 'var(--type-body-medium-size)',
              boxSizing: 'border-box',
              minHeight: 'var(--size-touch-target)',
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-on-surface-variant)',
            }}
          >
            🔍
          </span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          <button
            onClick={() => setAssignmentFilter('ALL')}
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              borderRadius: 'var(--radius-small)',
              border: '1px solid var(--color-outline-variant)',
              backgroundColor:
                assignmentFilter === 'ALL' ? 'var(--color-primary)' : 'var(--color-surface-container-lowest)',
              color: assignmentFilter === 'ALL' ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
              fontWeight: 600,
              fontSize: 'var(--type-label-small-size)',
              cursor: 'pointer',
              minHeight: '2.25rem',
            }}
          >
            All Teachers ({totalTeachers})
          </button>
          <button
            onClick={() => setAssignmentFilter('ASSIGNED')}
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              borderRadius: 'var(--radius-small)',
              border: '1px solid var(--color-outline-variant)',
              backgroundColor:
                assignmentFilter === 'ASSIGNED' ? 'var(--color-primary)' : 'var(--color-surface-container-lowest)',
              color: assignmentFilter === 'ASSIGNED' ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
              fontWeight: 600,
              fontSize: 'var(--type-label-small-size)',
              cursor: 'pointer',
              minHeight: '2.25rem',
            }}
          >
            Assigned Arms ({assignedTeachers})
          </button>
          <button
            onClick={() => setAssignmentFilter('UNASSIGNED')}
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              borderRadius: 'var(--radius-small)',
              border: '1px solid var(--color-outline-variant)',
              backgroundColor:
                assignmentFilter === 'UNASSIGNED' ? 'var(--color-primary)' : 'var(--color-surface-container-lowest)',
              color: assignmentFilter === 'UNASSIGNED' ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
              fontWeight: 600,
              fontSize: 'var(--type-label-small-size)',
              cursor: 'pointer',
              minHeight: '2.25rem',
            }}
          >
            Unassigned ({totalTeachers - assignedTeachers})
          </button>
        </div>
      </div>

      {/* 4. Teachers Directory Table */}
      <div
        style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          borderRadius: 'var(--radius-medium)',
          border: '1px solid var(--color-outline-variant)',
          boxShadow: 'var(--shadow-soft)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--color-surface-container)',
                  borderBottom: '1px solid var(--color-outline-variant)',
                }}
              >
                <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontSize: 'var(--type-label-small-size)', fontWeight: 700, color: 'var(--color-on-surface)' }}>
                  Teacher
                </th>
                <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontSize: 'var(--type-label-small-size)', fontWeight: 700, color: 'var(--color-on-surface)' }}>
                  Contact Information
                </th>
                <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontSize: 'var(--type-label-small-size)', fontWeight: 700, color: 'var(--color-on-surface)' }}>
                  Subject Specialization
                </th>
                <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontSize: 'var(--type-label-small-size)', fontWeight: 700, color: 'var(--color-on-surface)' }}>
                  Assigned Class Arm
                </th>
                <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontSize: 'var(--type-label-small-size)', fontWeight: 700, color: 'var(--color-on-surface)' }}>
                  Attendance Today
                </th>
                <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontSize: 'var(--type-label-small-size)', fontWeight: 700, color: 'var(--color-on-surface)', textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher, idx) => (
                <tr
                  key={teacher.id}
                  style={{
                    borderBottom: idx === filteredTeachers.length - 1 ? 'none' : '1px solid var(--color-outline-variant)',
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--color-surface-container-low)',
                  }}
                >
                  {/* Teacher Name & Staff ID */}
                  <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                      <div
                        style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary-container)',
                          color: 'var(--color-on-primary-container)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          flexShrink: 0,
                        }}
                      >
                        {teacher.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(-2)
                          .join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--color-on-surface)', fontSize: 'var(--type-body-medium-size)' }}>
                          {teacher.fullName}
                        </div>
                        <div style={{ fontSize: 'var(--type-label-small-size)', color: 'var(--color-on-surface-variant)', fontFamily: 'monospace' }}>
                          {teacher.staffId}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontSize: 'var(--type-body-small-size)' }}>
                    <div style={{ color: 'var(--color-on-surface)' }}>{teacher.email}</div>
                    <div style={{ color: 'var(--color-on-surface-variant)', marginTop: '0.2rem' }}>{teacher.phone}</div>
                  </td>

                  {/* Subjects */}
                  <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface)' }}>
                    {teacher.subjects}
                  </td>

                  {/* Assigned Class Arm (RBAC) */}
                  <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                    {teacher.assignedClassArm ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: 'var(--spacing-1) var(--spacing-3)',
                          borderRadius: 'var(--radius-small)',
                          backgroundColor: 'var(--color-primary-container)',
                          color: 'var(--color-on-primary-container)',
                          fontWeight: 700,
                          fontSize: 'var(--type-label-small-size)',
                        }}
                      >
                        🏫 {teacher.assignedClassArm}
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: 'var(--spacing-1) var(--spacing-2)',
                          borderRadius: 'var(--radius-small)',
                          backgroundColor: 'var(--color-surface-container)',
                          color: 'var(--color-on-surface-variant)',
                          fontWeight: 600,
                          fontSize: 'var(--type-label-small-size)',
                        }}
                      >
                        Unassigned (Subject Teacher)
                      </span>
                    )}
                  </td>

                  {/* Daily Attendance State */}
                  <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                    {teacher.assignedClassArm ? (
                      teacher.attendanceSubmittedToday ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: 'var(--spacing-1) var(--spacing-2)',
                            borderRadius: 'var(--radius-small)',
                            backgroundColor: 'var(--color-success-container)',
                            color: 'var(--color-on-success-container)',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        >
                          ✓ Submitted ({teacher.attendanceTime || 'Today'})
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: 'var(--spacing-1) var(--spacing-2)',
                            borderRadius: 'var(--radius-small)',
                            backgroundColor: 'var(--color-warning-container)',
                            color: 'var(--color-on-warning-container)',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        >
                          ⏳ Pending Submission
                        </span>
                      )
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>— Not form teacher</span>
                    )}
                  </td>

                  {/* Actions: Reassign Class */}
                  <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setReassignTeacher(teacher);
                        setTargetClassArm(teacher.assignedClassArm || '');
                      }}
                      style={{
                        padding: 'var(--spacing-1) var(--spacing-3)',
                        backgroundColor: 'var(--color-surface-container-high)',
                        color: 'var(--color-primary)',
                        border: '1px solid var(--color-outline-variant)',
                        borderRadius: 'var(--radius-small)',
                        fontWeight: 700,
                        fontSize: 'var(--type-label-small-size)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Reassign Class ⇄
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTeachers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: 'var(--spacing-8)',
                      textAlign: 'center',
                      color: 'var(--color-on-surface-variant)',
                      fontSize: 'var(--type-body-medium-size)',
                    }}
                  >
                    No teachers match your search &apos;{searchTerm}&apos;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal: Add New Teacher */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-4)',
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface-container-lowest)',
              borderRadius: 'var(--radius-medium)',
              border: '1px solid var(--color-outline-variant)',
              padding: 'var(--spacing-6)',
              maxWidth: '32rem',
              width: '100%',
              boxShadow: 'var(--shadow-hard)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3
                  style={{
                    fontSize: 'var(--type-title-medium-size)',
                    fontWeight: 700,
                    margin: 0,
                    color: 'var(--color-primary)',
                  }}
                >
                  ＋ Add New Teacher
                </h3>
                <p
                  style={{
                    fontSize: 'var(--type-body-small-size)',
                    color: 'var(--color-on-surface-variant)',
                    margin: 'var(--spacing-1) 0 0 0',
                  }}
                >
                  Staff member will receive credentials and class attendance permissions.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: 'var(--color-on-surface-variant)',
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTeacher} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--type-label-small-size)', fontWeight: 700, marginBottom: 'var(--spacing-1)' }}>
                  Full Name &amp; Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Olumide Bakare or Mrs. Kehinde Adeleke"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-2) var(--spacing-3)',
                    borderRadius: 'var(--radius-small)',
                    border: '1px solid var(--color-outline)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-on-surface)',
                    fontSize: 'var(--type-body-medium-size)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--type-label-small-size)', fontWeight: 700, marginBottom: 'var(--spacing-1)' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="teacher.name@schoolfix.internal"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-2) var(--spacing-3)',
                      borderRadius: 'var(--radius-small)',
                      border: '1px solid var(--color-outline)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-on-surface)',
                      fontSize: 'var(--type-body-medium-size)',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--type-label-small-size)', fontWeight: 700, marginBottom: 'var(--spacing-1)' }}>
                    Nigerian Phone Number *
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="080XXXXXXXX"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-2) var(--spacing-3)',
                      borderRadius: 'var(--radius-small)',
                      border: '1px solid var(--color-outline)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-on-surface)',
                      fontSize: 'var(--type-body-medium-size)',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--type-label-small-size)', fontWeight: 700, marginBottom: 'var(--spacing-1)' }}>
                  Subjects Taught
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics & Basic Science"
                  value={newSubjects}
                  onChange={(e) => setNewSubjects(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-2) var(--spacing-3)',
                    borderRadius: 'var(--radius-small)',
                    border: '1px solid var(--color-outline)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-on-surface)',
                    fontSize: 'var(--type-body-medium-size)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--type-label-small-size)', fontWeight: 700, marginBottom: 'var(--spacing-1)' }}>
                  Assign Form Class Arm (RBAC Attendance Gate)
                </label>
                <select
                  value={newClassArm}
                  onChange={(e) => setNewClassArm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-2) var(--spacing-3)',
                    borderRadius: 'var(--radius-small)',
                    border: '1px solid var(--color-outline)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-on-surface)',
                    fontSize: 'var(--type-body-medium-size)',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">-- Unassigned (Subject Teacher Only) --</option>
                  {availableClassArms.map((arm) => (
                    <option key={arm} value={arm}>
                      {arm}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', marginTop: '0.25rem', display: 'block' }}>
                  Teachers can only take daily attendance and enter continuous assessments for their assigned class arm.
                </span>
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'flex-end', marginTop: 'var(--spacing-2)' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: 'var(--spacing-2) var(--spacing-4)',
                    backgroundColor: 'var(--color-surface-container)',
                    color: 'var(--color-on-surface)',
                    border: '1px solid var(--color-outline-variant)',
                    borderRadius: 'var(--radius-small)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: 'var(--spacing-2) var(--spacing-5)',
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                    border: 'none',
                    borderRadius: 'var(--radius-small)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Save &amp; Invite Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal: Reassign Class Arm */}
      {reassignTeacher && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-4)',
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface-container-lowest)',
              borderRadius: 'var(--radius-medium)',
              border: '1px solid var(--color-outline-variant)',
              padding: 'var(--spacing-6)',
              maxWidth: '30rem',
              width: '100%',
              boxShadow: 'var(--shadow-hard)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3
                style={{
                  fontSize: 'var(--type-title-medium-size)',
                  fontWeight: 700,
                  margin: 0,
                  color: 'var(--color-primary)',
                }}
              >
                Reassign Class Arm ⇄
              </h3>
              <button
                onClick={() => setReassignTeacher(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: 'var(--color-on-surface-variant)',
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)', margin: 0 }}>
              Updating class assignment for <strong>{reassignTeacher.fullName}</strong> ({reassignTeacher.staffId}).
            </p>

            <form onSubmit={handleReassignClass} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--type-label-small-size)', fontWeight: 700, marginBottom: 'var(--spacing-1)' }}>
                  Selected Class Arm
                </label>
                <select
                  value={targetClassArm}
                  onChange={(e) => setTargetClassArm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-2) var(--spacing-3)',
                    borderRadius: 'var(--radius-small)',
                    border: '1px solid var(--color-outline)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-on-surface)',
                    fontSize: 'var(--type-body-medium-size)',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">-- Set to Unassigned (Subject Teacher Only) --</option>
                  {availableClassArms.map((arm) => (
                    <option key={arm} value={arm}>
                      {arm} {reassignTeacher.assignedClassArm === arm ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  padding: 'var(--spacing-3)',
                  backgroundColor: 'var(--color-surface-container)',
                  borderRadius: 'var(--radius-small)',
                  fontSize: '0.8rem',
                  color: 'var(--color-on-surface-variant)',
                }}
              >
                🔒 <strong>RBAC Isolation:</strong> When reassigned, {reassignTeacher.fullName} will immediately gain write permissions
                for attendance &amp; continuous assessment in {targetClassArm || 'no class arm'}, and lose write access to previously assigned arms.
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setReassignTeacher(null)}
                  style={{
                    padding: 'var(--spacing-2) var(--spacing-4)',
                    backgroundColor: 'var(--color-surface-container)',
                    color: 'var(--color-on-surface)',
                    border: '1px solid var(--color-outline-variant)',
                    borderRadius: 'var(--radius-small)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: 'var(--spacing-2) var(--spacing-5)',
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                    border: 'none',
                    borderRadius: 'var(--radius-small)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
