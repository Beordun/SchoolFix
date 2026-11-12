// lib/security/rbac.ts
// SchoolFix Teacher RBAC Class-Arm Isolation Guards
//
// AGENTS.md §4.1: a classroom teacher may only read or mutate Attendance and
// Assessment records for class arms where an active TeacherClassAssignment
// exists for their userId. These helpers are fail-closed: the absence of an
// assignment is a denial, never an implicit grant.

import { prisma } from '@/lib/prisma';

/**
 * True when the actor may touch the given class arm.
 * Administrators are global; teachers require an explicit assignment row.
 */
export async function canAccessClassArm(
  userId: string,
  role: string,
  classArmId: string
): Promise<boolean> {
  if (role === 'ADMIN') return true;
  if (role !== 'TEACHER') return false;
  if (!classArmId) return false;

  const assignment = await prisma.teacherClassAssignment.findFirst({
    where: { teacherId: userId, classArmId },
    select: { id: true },
  });

  return Boolean(assignment);
}

/**
 * Returns the submitted student IDs that do NOT belong to the given class arm
 * (including IDs that do not exist). An empty array means every ID is in scope.
 */
export async function findOutOfScopeStudentIds(
  classArmId: string,
  studentIds: string[]
): Promise<string[]> {
  const unique = Array.from(new Set(studentIds.filter(Boolean)));
  if (unique.length === 0) return [];

  const rows = await prisma.student.findMany({
    where: { id: { in: unique }, classArmId },
    select: { id: true },
  });

  const inScope = new Set(rows.map((row) => row.id));
  return unique.filter((id) => !inScope.has(id));
}
