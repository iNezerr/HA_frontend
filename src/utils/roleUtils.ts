// Role checking utilities to handle both lowercase and capitalized role names
// Backend returns: "Administrator", "Employer", "Applicant"
// Frontend might use: "admin", "employer", "applicant"

// Check if user is admin based on Django's superuser system
export const isAdmin = (user?: { is_superuser?: boolean; is_staff?: boolean }): boolean => {
  return user?.is_superuser === true;
};

// Legacy role-based admin check (deprecated)
export const isAdminByRole = (role?: string): boolean => {
  return role === 'admin' || role === 'Administrator';
};

export const isEmployer = (role?: string): boolean => {
  return role === 'employer' || role === 'Employer';
};

export const isApplicant = (role?: string): boolean => {
  return role === 'applicant' || role === 'Applicant';
};

export const canAccessAdmin = (user?: { is_superuser?: boolean; is_staff?: boolean }): boolean => {
  return isAdmin(user);
};

export const canAccessEmployer = (role?: string): boolean => {
  return isEmployer(role) || isAdminByRole(role);
};

export const canCreateJobs = (role?: string): boolean => {
  return isEmployer(role) || isAdminByRole(role);
};

export const canManageScholarships = (role?: string): boolean => {
  return isAdminByRole(role);
};

export const canApplyToOpportunities = (role?: string): boolean => {
  return isApplicant(role);
};

// Get normalized role name (always lowercase for consistency)
export const getNormalizedRole = (role?: string): string => {
  if (!role) return '';

  switch (role.toLowerCase()) {
    case 'administrator':
    case 'admin':
      return 'admin';
    case 'employer':
      return 'employer';
    case 'applicant':
      return 'applicant';
    default:
      return role.toLowerCase();
  }
};
