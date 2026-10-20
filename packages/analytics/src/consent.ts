import { type AnalyticsEnvironment, createAnalytics, type Surface } from './index';

export function mountAnalyticsConsent(
  parent: HTMLElement,
  env: AnalyticsEnvironment,
  surface: Surface,
) {
  const analytics = createAnalytics(env, surface, {
    origin: location.origin,
    privacySignal: () =>
      navigator.doNotTrack === '1' ||
      (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true,
    fetch: (...args) => fetch(...args),
    uuid: () => crypto.randomUUID(),
  });
  if (!analytics.configured) return { analytics, dispose: () => {} };
  const section = document.createElement('section');
  section.setAttribute('aria-label', 'Optional analytics');
  const description = document.createElement('p');
  description.textContent =
    'Optional analytics sends basic screen and supported dish interactions to PostHog. No names, account details or page addresses are included. PostHog receives your connection IP. Your choice lasts until you leave or reload this page.';
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Allow optional analytics';
  button.setAttribute('aria-pressed', 'false');
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.textContent = 'Optional analytics is off.';
  button.addEventListener('click', () => {
    const enable = button.getAttribute('aria-pressed') !== 'true';
    analytics.setConsent(enable);
    const active = analytics.allowed();
    button.setAttribute('aria-pressed', String(active));
    button.textContent = active ? 'Turn off optional analytics' : 'Allow optional analytics';
    status.textContent = active
      ? 'Optional analytics is on for this page.'
      : 'Optional analytics is off. Browser privacy preferences are respected.';
    if (active) void analytics.captureShellView();
  });
  section.append(description, button, status);
  parent.append(section);
  return {
    analytics,
    dispose: () => {
      analytics.setConsent(false);
      section.remove();
    },
  };
}
