let navigateFn: ((path: string, options?: { replace?: boolean }) => void) | null = null;

export const setNavigate = (fn: typeof navigateFn) => {
  navigateFn = fn;
};

export const navigateToLogin = () => {
  if (navigateFn) {
    navigateFn("/login", { replace: true });
  } else {
    // fallback for non-React environments (tests, SSR)
    window.location.href = "/login";
  }
};

// export const navigateToLogin = () => {
//   if (navigateFn) navigateFn("/login", { replace: true });
// };
