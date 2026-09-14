import type { UserRole } from "./types";

export function canManageUsers(role: UserRole | undefined) {
  return role === "ADMIN" || role === "SCHOOL_ADMIN";
}

export function canViewUsers(role: UserRole | undefined) {
  return canManageUsers(role) || role === "HEADMASTER";
}

export function canManageSchoolOps(role: UserRole | undefined) {
  return role === "ADMIN" || role === "SCHOOL_ADMIN";
}

export function canViewSchoolWide(role: UserRole | undefined) {
  return (
    role === "ADMIN" || role === "SCHOOL_ADMIN" || role === "HEADMASTER"
  );
}

export function canCreateAssignments(role: UserRole | undefined) {
  return role === "TEACHER" || role === "ADMIN" || role === "SCHOOL_ADMIN";
}

export function isParentRole(role: UserRole | undefined) {
  return role === "PARENT";
}

export function isHeadmasterRole(role: UserRole | undefined) {
  return role === "HEADMASTER";
}

export function isStudentLike(role: UserRole | undefined) {
  return role === "STUDENT" || role === "PARENT";
}
