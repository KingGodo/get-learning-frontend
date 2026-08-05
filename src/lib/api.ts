import type { ApiError, ApiSuccess } from "./types";

const DEFAULT_API_URL = "http://localhost:4000/api/v1";

/** API base URL; rewrites localhost to the current host when testing over LAN IP. */
export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;

  if (typeof window === "undefined") {
    return configured;
  }

  try {
    const url = new URL(configured);
    const pageHost = window.location.hostname;
    const isLocalApi =
      url.hostname === "localhost" || url.hostname === "127.0.0.1";
    const isRemotePage =
      pageHost !== "localhost" && pageHost !== "127.0.0.1";

    if (isLocalApi && isRemotePage) {
      const port = url.port || "4000";
      const pathname = url.pathname.replace(/\/$/, "") || "/api/v1";
      return `${window.location.protocol}//${pageHost}:${port}${pathname}`;
    }

    return configured;
  } catch {
    return configured;
  }
}

/** API origin without the /api/v1 suffix (for uploads and static files). */
export function getApiOrigin(): string {
  return getApiBaseUrl().replace(/\/api\/v1\/?$/, "");
}

const TOKEN_KEY = "learning_hub_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiRequestError extends Error {
  status: number;
  errors?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    status: number,
    errors?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.errors = errors;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  formData?: FormData;
};

export async function api<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, formData } = options;
  const token = options.token === undefined ? getToken() : options.token;

  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!formData) headers["Content-Type"] = "application/json";

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });

  const json = (await res.json().catch(() => null)) as
    | ApiSuccess<T>
    | ApiError
    | null;

  if (!res.ok || !json || json.success === false) {
    const message =
      json && "message" in json ? json.message : "Something went wrong";
    const errors = json && "errors" in json ? json.errors : undefined;
    throw new ApiRequestError(message, res.status, errors);
  }

  return json.data;
}

export const authApi = {
  login: (email: string, password: string) =>
    api<{ token: string; user: import("./types").User }>("/auth/login", {
      method: "POST",
      body: { email, password },
      token: null,
    }),
  forgotPassword: (email: string) =>
    api<{ message: string; resetUrl?: string }>("/auth/forgot-password", {
      method: "POST",
      body: { email },
      token: null,
    }),
  resetPassword: (body: {
    token: string;
    password: string;
    confirmPassword: string;
  }) =>
    api<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body,
      token: null,
    }),
  me: () => api<import("./types").User>("/auth/me"),
  updateProfile: (body: Record<string, unknown>) =>
    api<import("./types").User>("/auth/me", {
      method: "PATCH",
      body,
    }),
  changePassword: (body: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) =>
    api<{ message: string }>("/auth/change-password", {
      method: "PATCH",
      body,
    }),
  verifyCurrentPassword: (currentPassword: string) =>
    api<{ valid: true }>("/auth/verify-password", {
      method: "POST",
      body: { currentPassword },
    }),
};

export const dashboardApi = {
  get: () => api<import("./types").Dashboard>("/dashboard"),
};

export const classesApi = {
  list: () => api<import("./types").ClassRoom[]>("/classes"),
  get: (id: string) => api<import("./types").ClassRoom>(`/classes/${id}`),
  create: (body: Record<string, unknown>) =>
    api<import("./types").ClassRoom>("/classes", { method: "POST", body }),
  join: (classCode: string) =>
    api<{ enrollment: unknown; token: string }>("/classes/join", {
      method: "POST",
      body: { classCode },
    }),
};

export const materialsApi = {
  list: (classId: string) =>
    api<import("./types").ClassMaterial[]>(`/classes/${classId}/materials`),
  create: (classId: string, formData: FormData) =>
    api<import("./types").ClassMaterial[]>(`/classes/${classId}/materials`, {
      method: "POST",
      formData,
    }),
  remove: (classId: string, id: string) =>
    api<{ id: string }>(`/classes/${classId}/materials/${id}`, {
      method: "DELETE",
    }),
};

export const subjectsApi = {
  list: () => api<import("./types").Subject[]>("/subjects"),
  schoolCatalog: () =>
    api<import("./types").Subject[]>("/subjects/school-catalog"),
  get: (id: string) => api<import("./types").SubjectDetail>(`/subjects/${id}`),
  create: (body: Record<string, unknown>) =>
    api<import("./types").Subject>("/subjects", { method: "POST", body }),
  assign: (id: string) =>
    api<import("./types").Subject>(`/subjects/${id}/assign`, {
      method: "POST",
      body: {},
    }),
  unassign: (id: string) =>
    api<{ success: boolean }>(`/subjects/${id}/assign`, { method: "DELETE" }),
  update: (id: string, body: Record<string, unknown>) =>
    api<import("./types").Subject>(`/subjects/${id}`, {
      method: "PATCH",
      body,
    }),
  remove: (id: string) =>
    api<unknown>(`/subjects/${id}`, { method: "DELETE" }),
};

export const schoolsApi = {
  list: () =>
    api<
      Array<
        import("./types").School & {
          _count: { users: number; classes: number };
          createdAt?: string;
        }
      >
    >("/schools"),
  get: (id: string) =>
    api<import("./types").AdminSchoolDetail>(`/schools/${id}`),
  me: () => api<import("./types").School>("/schools/me"),
  create: (body: Record<string, unknown>) =>
    api<{
      school: import("./types").School;
      admin: import("./types").User;
      credentials: import("./types").IssuedCredentials;
    }>("/schools", {
      method: "POST",
      body,
    }),
  update: (body: Record<string, unknown>) =>
    api<import("./types").School>("/schools/me", { method: "PATCH", body }),
};

export const usersApi = {
  list: (params?: { role?: string; q?: string }) => {
    const search = new URLSearchParams();
    if (params?.role) search.set("role", params.role);
    if (params?.q) search.set("q", params.q);
    const qs = search.toString();
    return api<import("./types").AdminUserSummary[]>(
      qs ? `/users?${qs}` : "/users",
    );
  },
  get: (id: string) => api<import("./types").AdminUserDetail>(`/users/${id}`),
  createTeacher: (body: Record<string, unknown>) =>
    api<{
      user: import("./types").User;
      teacher: import("./types").Teacher;
      credentials: import("./types").IssuedCredentials;
    }>("/users/teachers", { method: "POST", body }),
  createStudent: (body: Record<string, unknown>) =>
    api<{
      user: import("./types").User;
      student: import("./types").Student;
      credentials: import("./types").IssuedCredentials;
    }>("/users/students", { method: "POST", body }),
  resetCredentials: (id: string) =>
    api<{
      user: import("./types").User;
      credentials: import("./types").IssuedCredentials;
    }>(`/users/${id}/reset-credentials`, { method: "POST", body: {} }),
  update: (id: string, body: Record<string, unknown>) =>
    api<import("./types").User>(`/users/${id}`, {
      method: "PATCH",
      body,
    }),
  updateStatus: (id: string, status: "ACTIVE" | "INACTIVE" | "SUSPENDED") =>
    api<import("./types").User>(`/users/${id}/status`, {
      method: "PATCH",
      body: { status },
    }),
  remove: (id: string) => api<import("./types").User>(`/users/${id}`, { method: "DELETE" }),
};

export const assignmentsApi = {
  list: (classId?: string) =>
    api<import("./types").Assignment[]>(
      classId ? `/assignments?classId=${classId}` : "/assignments",
    ),
  get: (id: string) => api<import("./types").Assignment>(`/assignments/${id}`),
  create: (formData: FormData) =>
    api<import("./types").Assignment>("/assignments", {
      method: "POST",
      formData,
    }),
};

export const submissionsApi = {
  list: (assignmentId?: string) =>
    api<import("./types").Submission[]>(
      assignmentId
        ? `/submissions?assignmentId=${assignmentId}`
        : "/submissions",
    ),
  submit: (formData: FormData) =>
    api<import("./types").Submission>("/submissions", {
      method: "POST",
      formData,
    }),
  grade: (id: string, body: { score: number; feedback?: string }) =>
    api<import("./types").Submission>(`/submissions/${id}/grade`, {
      method: "PATCH",
      body,
    }),
};

export const filesApi = {
  /** Short-lived URL that works even when the Supabase bucket is private. */
  signedUrl: (url: string, mode: "preview" | "download" = "preview") =>
    api<{ url: string }>("/files/signed", {
      method: "POST",
      body: { url, mode },
    }),
};

export const notificationsApi = {
  list: () =>
    api<{
      items: import("./types").AppNotification[];
      unreadCount: number;
    }>("/notifications"),
  unreadCount: () => api<{ unreadCount: number }>("/notifications/unread-count"),
  markRead: (ids?: string[]) =>
    api<{ marked: number }>("/notifications/read", {
      method: "POST",
      body: ids ? { ids } : {},
    }),
  markOne: (id: string) =>
    api<import("./types").AppNotification>(`/notifications/${id}/read`, {
      method: "POST",
    }),
  remove: (id: string) =>
    api<{ id: string }>(`/notifications/${id}`, {
      method: "DELETE",
    }),
  clear: (ids?: string[]) =>
    api<{ deleted: number }>("/notifications/clear", {
      method: "POST",
      body: ids ? { ids } : {},
    }),
};
