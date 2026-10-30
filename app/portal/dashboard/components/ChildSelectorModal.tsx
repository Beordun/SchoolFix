// app/portal/dashboard/components/ChildSelectorModal.tsx
'use client';

import React, { useState } from 'react';
import { ChildProfile } from '../types';

interface ChildSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  childrenList: ChildProfile[];
  selectedChildId: string;
  onSelectChild: (id: string) => void;
  onLinkChild: (admissionNum: string, code: string, method: 'SELF' | 'ASSISTED') => void;
}

export default function ChildSelectorModal({
  isOpen,
  onClose,
  childrenList,
  selectedChildId,
  onSelectChild,
  onLinkChild,
}: ChildSelectorModalProps) {
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkMethod, setLinkMethod] = useState<'SELF' | 'ASSISTED'>('SELF');
  const [admissionNum, setAdmissionNum] = useState('');
  const [linkCode, setLinkCode] = useState('');
  const [linkNotice, setLinkNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admissionNum.trim()) return;

    onLinkChild(admissionNum.trim(), linkCode.trim(), linkMethod);
    setLinkNotice(
      linkMethod === 'SELF'
        ? `Child profile with admission number ${admissionNum} successfully linked!`
        : `Linking request for ${admissionNum} submitted to school administration for verification.`
    );
    setAdmissionNum('');
    setLinkCode('');
    setTimeout(() => {
      setLinkNotice(null);
      setShowLinkForm(false);
    }, 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="child-selector-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--spacing-medium)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-on-surface)',
          borderRadius: 'var(--radius-large)',
          border: '1px solid var(--color-outline-variant)',
          boxShadow: 'var(--shadow-hard)',
          width: '100%',
          maxWidth: '30rem',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 'var(--spacing-medium)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-medium)',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2
              id="child-selector-title"
              className="type-title-large"
              style={{
                margin: 0,
                color: 'var(--color-primary)',
                fontWeight: 'bold',
              }}
            >
              Switch Child
            </h2>
            <p
              className="type-body-small"
              style={{
                margin: '0.25rem 0 0 0',
                color: 'var(--color-on-surface-variant)',
              }}
            >
              Select an enrolled student to view their records
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              minWidth: 'var(--size-touch-target)',
              minHeight: 'var(--size-touch-target)',
              backgroundColor: 'var(--color-surface-container-high)',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-on-surface)',
              cursor: 'pointer',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {linkNotice && (
          <div
            className="type-body-small"
            style={{
              padding: 'var(--spacing-small)',
              backgroundColor: 'var(--color-success-container)',
              color: 'var(--color-on-success-container)',
              borderRadius: 'var(--radius-small)',
            }}
          >
            ✅ {linkNotice}
          </div>
        )}

        {!showLinkForm ? (
          <>
            {/* List of Linked Children */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {childrenList.map((child) => {
                const isSelected = child.id === selectedChildId;
                return (
                  <button
                    key={child.id}
                    onClick={() => {
                      onSelectChild(child.id);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--spacing-small) var(--spacing-medium)',
                      minHeight: 'var(--size-touch-target)',
                      backgroundColor: isSelected
                        ? 'var(--color-primary-container)'
                        : 'var(--color-surface-container-low)',
                      border: isSelected
                        ? '2px solid var(--color-primary)'
                        : '1px solid var(--color-outline-variant)',
                      borderRadius: 'var(--radius-medium)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        className="type-title-small"
                        style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: isSelected
                            ? 'var(--color-primary)'
                            : 'var(--color-surface-container-high)',
                          color: isSelected
                            ? 'var(--color-on-primary)'
                            : 'var(--color-on-surface)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                        }}
                      >
                        {child.fullName.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div
                          className="type-title-small"
                          style={{
                            fontWeight: 'bold',
                            color: isSelected
                              ? 'var(--color-on-primary-container)'
                              : 'var(--color-on-surface)',
                          }}
                        >
                          {child.fullName}
                        </div>
                        <div
                          className="type-body-small"
                          style={{
                            color: 'var(--color-on-surface-variant)',
                          }}
                        >
                          {child.classArm} • {child.admissionNum}
                        </div>
                      </div>
                    </div>
                    <div>
                      {isSelected ? (
                        <span
                          className="type-label-small"
                          style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-on-primary)',
                            padding: '0.25rem 0.625rem',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: 'bold',
                          }}
                        >
                          Active
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-on-surface-variant)', fontSize: '1.25rem' }}>
                          →
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Trigger to Link Another Child */}
            <button
              onClick={() => setShowLinkForm(true)}
              className="type-label-medium"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                minHeight: 'var(--size-touch-target)',
                padding: 'var(--spacing-small) var(--spacing-medium)',
                backgroundColor: 'transparent',
                color: 'var(--color-primary)',
                border: '1px dashed var(--color-primary)',
                borderRadius: 'var(--radius-medium)',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              <span>➕</span> Link Another Child
            </button>
          </>
        ) : (
          /* Link Child Form (PRD Section 1 Finalised Decisions) */
          <form onSubmit={handleLinkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setLinkMethod('SELF')}
                className="type-label-small"
                style={{
                  flex: 1,
                  minHeight: '2.5rem',
                  backgroundColor: linkMethod === 'SELF' ? 'var(--color-primary)' : 'var(--color-surface-container)',
                  color: linkMethod === 'SELF' ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
                  border: 'none',
                  borderRadius: 'var(--radius-small)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Self-Service (PIN)
              </button>
              <button
                type="button"
                onClick={() => setLinkMethod('ASSISTED')}
                className="type-label-small"
                style={{
                  flex: 1,
                  minHeight: '2.5rem',
                  backgroundColor: linkMethod === 'ASSISTED' ? 'var(--color-primary)' : 'var(--color-surface-container)',
                  color: linkMethod === 'ASSISTED' ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
                  border: 'none',
                  borderRadius: 'var(--radius-small)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                School-Assisted
              </button>
            </div>

            <div>
              <label
                htmlFor="admissionNum"
                className="type-body-small"
                style={{
                  display: 'block',
                  fontWeight: 'bold',
                  marginBottom: '0.25rem',
                }}
              >
                Student Admission Number
              </label>
              <input
                id="admissionNum"
                type="text"
                placeholder="e.g. SF-2026-0142"
                value={admissionNum}
                onChange={(e) => setAdmissionNum(e.target.value)}
                required
                className="type-body-medium"
                style={{
                  width: '100%',
                  minHeight: 'var(--size-touch-target)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-outline)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-on-surface)',
                }}
              />
            </div>

            {linkMethod === 'SELF' ? (
              <div>
                <label
                  htmlFor="linkCode"
                  className="type-body-small"
                  style={{
                    display: 'block',
                    fontWeight: 'bold',
                    marginBottom: '0.25rem',
                  }}
                >
                  School-Issued Verification Code
                </label>
                <input
                  id="linkCode"
                  type="text"
                  placeholder="e.g. 6-digit linking PIN"
                  value={linkCode}
                  onChange={(e) => setLinkCode(e.target.value)}
                  required
                  className="type-body-medium"
                  style={{
                    width: '100%',
                    minHeight: 'var(--size-touch-target)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-small)',
                    border: '1px solid var(--color-outline)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-on-surface)',
                  }}
                />
              </div>
            ) : (
              <p
                className="type-body-small"
                style={{
                  color: 'var(--color-on-surface-variant)',
                  backgroundColor: 'var(--color-surface-container-low)',
                  padding: 'var(--spacing-small)',
                  borderRadius: 'var(--radius-small)',
                  margin: 0,
                }}
              >
                ℹ️ School-assisted linking submits this admission ID to the bursary and administrative office. Once school records match your verified parent phone number and identity, the student will automatically appear under your account.
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowLinkForm(false)}
                className="type-label-medium"
                style={{
                  flex: 1,
                  minHeight: 'var(--size-touch-target)',
                  backgroundColor: 'var(--color-surface-container-high)',
                  color: 'var(--color-on-surface)',
                  border: '1px solid var(--color-outline-variant)',
                  borderRadius: 'var(--radius-small)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Back
              </button>
              <button
                type="submit"
                className="type-label-medium"
                style={{
                  flex: 1,
                  minHeight: 'var(--size-touch-target)',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-small)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {linkMethod === 'SELF' ? 'Verify & Link Child' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
