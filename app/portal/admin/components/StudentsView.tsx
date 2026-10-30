// app/portal/admin/components/StudentsView.tsx
// SchoolFix Administrator Student Enrolment Register & Clearance State
'use client';

import React, { useState } from 'react';

interface Student {
  admissionNo: string;
  fullName: string;
  classArm: string;
  parentName: string;
  parentPhone: string;
  expectedFee: number;
  paidFee: number;
  balance: number;
  status: 'CLEARED' | 'RESTRICTED';
}

export default function StudentsView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Student State
  const [newAdmissionNo, setNewAdmissionNo] = useState('SF-2026-152');
  const [newName, setNewName] = useState('');
  const [newClassArm, setNewClassArm] = useState('Primary 4 Blue');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('080');

  const [students, setStudents] = useState<Student[]>([
    {
      admissionNo: 'SF-2024-089',
      fullName: 'Amara Michael',
      classArm: 'Primary 4 Blue',
      parentName: 'Mr. Biodun Michael',
      parentPhone: '08031234567',
      expectedFee: 185000,
      paidFee: 185000,
      balance: 0,
      status: 'CLEARED',
    },
    {
      admissionNo: 'SF-2023-114',
      fullName: 'Chukwudi Obi',
      classArm: 'JSS 2 Gold',
      parentName: 'Dr. Ngozi Obi',
      parentPhone: '08029876543',
      expectedFee: 235000,
      paidFee: 160000,
      balance: 75000,
      status: 'RESTRICTED',
    },
    {
      admissionNo: 'SF-2024-042',
      fullName: 'Fatima Bello',
      classArm: 'Nursery 2 Diamond',
      parentName: 'Alhaji Bello',
      parentPhone: '08181112233',
      expectedFee: 140000,
      paidFee: 50000,
      balance: 90000,
      status: 'RESTRICTED',
    },
    {
      admissionNo: 'SF-2022-005',
      fullName: 'Zainab Balogun',
      classArm: 'SSS 1 Ruby',
      parentName: 'Mrs. Balogun',
      parentPhone: '07034445566',
      expectedFee: 255000,
      paidFee: 255000,
      balance: 0,
      status: 'CLEARED',
    },
    {
      admissionNo: 'SF-2024-101',
      fullName: 'David Adeleke',
      classArm: 'Primary 1 Gold',
      parentName: 'Pastor Adeleke',
      parentPhone: '08056667788',
      expectedFee: 185000,
      paidFee: 185000,
      balance: 0,
      status: 'CLEARED',
    },
  ]);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const newStudent: Student = {
      admissionNo: newAdmissionNo,
      fullName: newName,
      classArm: newClassArm,
      parentName: newParentName || 'Parent Guardian',
      parentPhone: newParentPhone,
      expectedFee: 185000,
      paidFee: 0,
      balance: 185000,
      status: 'RESTRICTED',
    };
    setStudents([newStudent, ...students]);
    setNewName('');
    setNewParentName('');
    setShowAddModal(false);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === 'ALL' || s.classArm === classFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
      {/* Top Header & Actions */}
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
            Student Enrolment Register
          </h1>
          <p style={{ margin: 'var(--spacing-1) 0 0 0', fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)' }}>
            Total {students.length} active students enrolled · PRD § 6.3 Fee clearance status monitored
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          <button
            onClick={() => setShowAddModal(true)}
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
            + Enrol New Student
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-3)',
          flexWrap: 'wrap',
          backgroundColor: 'var(--color-surface-container-lowest)',
          padding: 'var(--spacing-3)',
          borderRadius: 'var(--radius-small)',
          border: '1px solid var(--color-outline-variant)',
        }}
      >
        <input
          type="text"
          placeholder="Search student by name or admission number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '15rem',
            padding: 'var(--spacing-2) var(--spacing-3)',
            borderRadius: 'var(--radius-small)',
            border: '1px solid var(--color-outline)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-on-surface)',
            fontSize: 'var(--type-body-small-size)',
          }}
        />

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          style={{
            padding: 'var(--spacing-2) var(--spacing-3)',
            borderRadius: 'var(--radius-small)',
            border: '1px solid var(--color-outline)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-on-surface)',
            fontSize: 'var(--type-body-small-size)',
            cursor: 'pointer',
          }}
        >
          <option value="ALL">All Class Arms</option>
          <option value="Nursery 2 Diamond">Nursery 2 Diamond</option>
          <option value="Primary 1 Gold">Primary 1 Gold</option>
          <option value="Primary 4 Blue">Primary 4 Blue</option>
          <option value="JSS 2 Gold">JSS 2 Gold</option>
          <option value="SSS 1 Ruby">SSS 1 Ruby</option>
        </select>
      </div>

      {/* Students Data Table */}
      <div
        style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          borderRadius: 'var(--radius-medium)',
          border: '1px solid var(--color-outline-variant)',
          boxShadow: 'var(--shadow-soft)',
          overflowX: 'auto',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--type-body-small-size)' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-container)', borderBottom: '1px solid var(--color-outline-variant)' }}>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Admission No</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Student Full Name</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Class Arm</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Parent / Guardian</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Tuition Balance</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Clearance Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr
                key={student.admissionNo}
                style={{ borderBottom: '1px solid var(--color-outline-variant)', transition: 'background-color 0.15s ease' }}
              >
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontFamily: 'monospace', fontWeight: 600 }}>
                  {student.admissionNo}
                </td>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600, color: 'var(--color-on-surface)' }}>
                  {student.fullName}
                </td>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>{student.classArm}</td>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                  <div>{student.parentName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>{student.parentPhone}</div>
                </td>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  {student.balance === 0 ? (
                    <span style={{ color: 'var(--color-success)' }}>₦0 (Settled)</span>
                  ) : (
                    <span style={{ color: 'var(--color-error)' }}>₦{student.balance.toLocaleString()}</span>
                  )}
                </td>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.125rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor:
                        student.status === 'CLEARED'
                          ? 'var(--color-success-container)'
                          : 'var(--color-error-container)',
                      color:
                        student.status === 'CLEARED'
                          ? 'var(--color-on-success-container)'
                          : 'var(--color-on-error-container)',
                    }}
                  >
                    {student.status === 'CLEARED' ? 'Cleared (Report Card Unlocked)' : 'Gated (Arrears Due)'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
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
                Enrol New Student
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--type-label-small-size)', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Admission Number
                </label>
                <input
                  type="text"
                  value={newAdmissionNo}
                  onChange={(e) => setNewAdmissionNo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-2)',
                    borderRadius: 'var(--radius-small)',
                    border: '1px solid var(--color-outline)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-on-surface)',
                    fontFamily: 'monospace',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--type-label-small-size)', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Student Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Oluwaseun Adeleke"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
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
                  Class Arm
                </label>
                <select
                  value={newClassArm}
                  onChange={(e) => setNewClassArm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-2)',
                    borderRadius: 'var(--radius-small)',
                    border: '1px solid var(--color-outline)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-on-surface)',
                  }}
                >
                  <option value="Primary 1 Gold">Primary 1 Gold</option>
                  <option value="Primary 4 Blue">Primary 4 Blue</option>
                  <option value="JSS 2 Gold">JSS 2 Gold</option>
                  <option value="SSS 1 Ruby">SSS 1 Ruby</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--type-label-small-size)', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chief Adeleke"
                  value={newParentName}
                  onChange={(e) => setNewParentName(e.target.value)}
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
                  onClick={() => setShowAddModal(false)}
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
                  Register Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
