// Admin authentication utilities
export const isAdminAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false
  return localStorage.getItem("adminToken") === "admin-authenticated"
}

export const getAdminUsername = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("adminUsername")
}

export const logoutAdmin = (): void => {
  localStorage.removeItem("adminToken")
  localStorage.removeItem("adminUsername")
}
