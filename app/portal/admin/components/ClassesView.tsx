// app/portal/admin/components/ClassesView.tsx
// SchoolFix Administrator Class Structure & Teacher Assignment Management
'use client';

import React, { useState } from 'react';

interface ClassArm {
  id: string;
  name: string;
  section: 'Nursery' | 'Primary' | 'Junior Secondary' | 'Senior Secondary';
  teacher: string;
  enrolled: number;
  capacity: number;
  attendanceToday: string;
}

export default function ClassesView() {
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [showAddArmModal, setShowAddArmModal] = useState(false);

  const [newArmName, setNewArmName] = useState('Primary 5 Emerald');
  const [newSection, setNewSection] = useState<'Nursery' | 'Primary' | 'Junior Secondary' | 'Senior Secondary'>('Primary');
  const [newTeacher, setNewTeacher] = useState('Unassigned');

  const [classArms, setClassArms] = useState<ClassArm[]>([
    {
      id: 'ARM-01',
      name: 'Nursery 2 Diamond',
      section: 'Nursery',
      teacher: 'Mrs. Folake Badmus',
      enrolled: 22,
      capacity: 25,
      attendanceToday: '95.4%',
    },
    {
      id: 'ARM-02',
      name: 'Primary 1 Gold',
      section: 'Primary',
      teacher: 'Mr. Emmanuel Okafor',
      enrolled: 28,
      capacity: 30,
      attendanceToday: '96.4%',
    },
    {
      id: 'ARM-03',
      name: 'Primary 4 Blue',
      section: 'Primary',
      teacher: 'Mr. Ibrahim Danladi',
      enrolled: 31,
      capacity: 35,
      attendanceToday: '96.8%',
    },
    {
      id: 'ARM-04',
      name: 'JSS 2 Gold',
      section: 'Junior Secondary',
      teacher: 'Mrs. Zainab Balogun',
      enrolled: 33,
      capacity: 35,
      attendanceToday: '93.9%',
    },
    {
      id: 'ARM-05',
      name: 'SSS 1 Ruby',
      section: 'Senior Secondary',
      teacher: 'Dr. Kelechi Okafor',
      enrolled: 34,
      capacity: 35,
      attendanceToday: '97.1%',
    },
    {
      id: 'ARM-06',
      name: 'JSS 1 Diamond',
      section: 'Junior Secondary',
      teacher: 'Unassigned',
      enrolled: 29,
      capacity: 35,
      attendanceToday: '93.1%',
    },
  ]);

  const handleAddArm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArmName) return;
    const newArm: ClassArm = {
      id: `ARM-${Date.now().toString().slice(-4)}`,
      name: newArmName,
      section: newSection,
      teacher: newTeacher,
      enrolled: 0,
      capacity: 35,
      attendanceToday: '—',
    };
    setClassArms([...classArms, newArm]);
    setNewArmName('');
    setShowAddArmModal(false);
  };

  const filteredArms = classArms.filter((arm) => {
    if (sectionFilter === 'ALL') return true;
    return arm.section === sectionFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-3)' }}>
        <div>
          <h1
            style={{
              fontSize: 'var(--type-headline-small-size)',
              lineHeight: 'var(--type-headline-small-line-height)',
              fontWeight: 700,
              margin: 0,
              color: 'var(--color-primary)',
            }}
          >
            Class Arms &amp; Academic Structure
          </h1>
          <p style={{ margin: 'var(--spacing-1) 0 0 0', fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)' }}>
            {classArms.length} registered class arms · Teacher RBAC Class Arm Isolation enforced
          </p>
        </div>

        <button
          onClick={() => setShowAddArmModal(true)}
          style={{
            padding: 'var(--spacing-2) var(--spacing-4)',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            border: 'none',
            borderRadius: 'var(--radius-small)',
            fontWeight: 700,
            fontSize: 'var(--type-label-medium-size)',
            cursor: 'pointer',
            minHeight: 'var(--size-touch-target)',
          }}
        >
          + Add New Class Arm
        </button>
      </div>

      {/* Section Filter Pills */}
      <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
        {(['ALL', 'Nursery', 'Primary', 'Junior Secondary', 'Senior Secondary'] as const).map((sec) => (
          <button
            key={sec}
            onClick={() => setSectionFilter(sec)}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: 'var(--radius-small)',
              border: '1px solid var(--color-outline-variant)',
              backgroundColor: sectionFilter === sec ? 'var(--color-primary)' : 'var(--color-surface-container)',
              color: sectionFilter === sec ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
            }}
          >
            {sec === 'ALL' ? 'All Sections' : sec}
          </button>
        ))}
      </div>

      {/* Class Arm Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
          gap: 'var(--spacing-4)',
        }}
      >
        {filteredArms.map((arm) => (
          <div
            key={arm.id}
            style={{
              backgroundColor: 'var(--color-surface-container-lowest)',
              borderRadius: 'var(--radius-medium)',
              border: '1px solid var(--color-outline-variant)',
              padding: 'var(--spacing-4)',
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    textTransform: 'uppercase',
                    color: 'var(--color-on-surface-variant)',
                    fontWeight: 700,
                  }}
                >
                  {arm.section}
                </span>
                <h3
                  style={{
                    fontSize: 'var(--type-title-medium-size)',
                    fontWeight: 700,
                    margin: '0.125rem 0 0 0',
                    color: 'var(--color-primary)',
                  }}
                >
                  {arm.name}
                </h3>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.125rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  backgroundColor:
                    arm.teacher === 'Unassigned'
                      ? 'var(--color-warning-container)'
                      : 'var(--color-surface-container-high)',
                  color:
                    arm.teacher === 'Unassigned'
                      ? 'var(--color-on-warning-container)'
                      : 'var(--color-on-surface)',
                }}
              >
                {arm.teacher === 'Unassigned' ? 'Needs Teacher' : 'Active'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: 'var(--type-body-small-size)' }}>
              <div>
                <span style={{ color: 'var(--color-on-surface-variant)' }}>Class Teacher: </span>
                <strong>{arm.teacher}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-on-surface-variant)' }}>Enrolment: </span>
                <strong>
                  {arm.enrolled} / {arm.capacity} students
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-on-surface-variant)' }}>Today&apos;s Attendance: </span>
                <strong style={{ color: 'var(--color-success)' }}>{arm.attendanceToday}</strong>
              </div>
            </div>

            <div
              style={{
                marginTop: 'auto',
                paddingTop: 'var(--spacing-3)',
                borderTop: '1px solid var(--color-outline-variant)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 'var(--type-label-small-size)',
              }}
            >
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Manage Roster
              </button>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-on-surface-variant)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                View Attendance
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Class Modal */}
      {showAddArmModal && (
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
              padding: 'var(--spacing-5)',
              maxWidth: '32rem',
              width: '100%',
              boxShadow: 'var(--shadow-hard)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 'var(--type-title-medium-size)', fontWeight: 700, margin: 0, color: 'var(--color-primary)' }}>
                Add New Class Arm
              </h3>
              <button onClick={() => setShowAddArmModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddArm} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--type-label-small-size)', fontWeight: 700, marginBottom: '0.25rem' }}>
                  School Section
                </label>
                <select
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value as typeof newSection)}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-2)',
                    borderRadius: 'var(--radius-small)',
                    border: '1px solid var(--color-outline)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-on-surface)',
                  }}
                >
                  <option value="Nursery">Nursery Section</option>
                  <option value="Primary">Primary Section</option>
                  <option value="Junior Secondary">Junior Secondary (JSS)</option>
                  <option value="Senior Secondary">Senior Secondary (SSS)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--type-label-small-size)', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Class Arm Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Primary 5 Emerald"
                  value={newArmName}
                  onChange={(e) => setNewArmName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-2)',
                    borderRadius: 'var(--radius-small)',
                    border: '1px solid var(--color-outline)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-on-surface)',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--type-label-small-size)', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Assigned Teacher
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mrs. Adeola Johnson (or Unassigned)"
                  value={newTeacher}
                  onChange={(e) => setNewTeacher(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-2)',
                    borderRadius: 'var(--radius-small)',
                    border: '1px solid var(--color-outline)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-on-surface)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'flex-end', marginTop: 'var(--spacing-2)' }}>
                <button
                  type="button"
                  onClick={() => setShowAddArmModal(false)}
                  style={{
                    padding: 'var(--spacing-2) var(--spacing-4)',
                    backgroundColor: 'var(--color-surface-container)',
                    borderRadius: 'var(--radius-small)',
                    border: '1px solid var(--color-outline-variant)',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: 'var(--spacing-2) var(--spacing-4)',
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                    borderRadius: 'var(--radius-small)',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Create Class Arm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
