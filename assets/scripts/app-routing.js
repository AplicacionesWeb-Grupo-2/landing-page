/**
 * Shared routing from the landing page to the ColdTrace Vue application.
 */

(() => {
  const DEFAULT_APP_BASE_URL = 'https://coldtrace-frontend-web.vercel.app';
  const ROUTE_PATHS = Object.freeze({
    'sign-in': '/identity-access/sign-in',
    'sign-up': '/identity-access/sign-up',
  });

  const configuredBaseUrl = String(window.COLDTRACE_APP_URL || DEFAULT_APP_BASE_URL)
    .trim()
    .replace(/\/+$/, '');

  function routeUrl(routeName, query = {}) {
    const routePath = ROUTE_PATHS[routeName];
    if (!routePath) {
      throw new Error(`Unknown ColdTrace app route: ${routeName}`);
    }

    const url = new URL(routePath.replace(/^\/+/, ''), `${configuredBaseUrl}/`);

    if (routeName === 'sign-up') {
      const selectedPlan = new URLSearchParams(window.location.search).get('plan');
      if (selectedPlan) {
        url.searchParams.set('plan', selectedPlan);
      }
    }

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });

    return url.toString();
  }

  const appRoutes = Object.freeze({
    url: routeUrl,
    signIn: (query) => routeUrl('sign-in', query),
    signUp: (query) => routeUrl('sign-up', query),
  });

  window.ColdTraceAppRoutes = appRoutes;

  function connectAppRoutes() {
    document.querySelectorAll('[data-app-route]').forEach((element) => {
      const routeName = element.getAttribute('data-app-route');
      const targetUrl = routeUrl(routeName);

      if (element instanceof HTMLFormElement) {
        element.action = targetUrl;
        element.addEventListener('submit', (event) => {
          event.preventDefault();
          window.location.assign(routeUrl(routeName));
        });
        return;
      }

      element.setAttribute('href', targetUrl);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', connectAppRoutes);
  } else {
    connectAppRoutes();
  }
})();
