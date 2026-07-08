/**
 * Pricing plans - renders the public catalog from the ColdTrace backend.
 */

(() => {
  const DEFAULT_API_BASE_URL = 'https://coldtrace-platform-3kti2ylcba-uc.a.run.app/api/v1';
  const DEFAULT_APP_BASE_URL = 'https://coldtrace-frontend-web.vercel.app';
  const SIGN_UP_PATH = '/identity-access/sign-up';
  const PLAN_ORDER = ['base', 'operations', 'compliance-ai'];

  const apiBaseUrl = (window.COLDTRACE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
  const appBaseUrl = (window.COLDTRACE_APP_URL || DEFAULT_APP_BASE_URL).replace(/\/+$/, '');

  const fallbackPlans = [
    {
      id: 1,
      code: 'base',
      displayName: 'Base',
      description: 'For small teams validating cold-chain monitoring.',
      monthlyPriceCents: 0,
      currency: 'PEN',
      recommended: false,
      recommendedLabel: null,
      visible: true,
      usageLimits: {
        maxLocations: 1,
        maxAssets: 2,
        maxIotDevices: 3,
        maxUsers: 3,
        historyRetentionDays: 7,
      },
      featureFlags: {
        allowsExports: false,
        allowsMaintenance: false,
        allowsAiGuidance: false,
        allowsAiReportSummary: false,
      },
      includedFeatures: ['Basic monitoring', 'In-app alerts', 'Incident list', 'Basic daily log'],
    },
    {
      id: 2,
      code: 'operations',
      displayName: 'Operations',
      description: 'For SMEs with recurring cold-chain monitoring and operational reporting.',
      monthlyPriceCents: 14900,
      currency: 'PEN',
      recommended: true,
      recommendedLabel: 'Recommended',
      visible: true,
      usageLimits: {
        maxLocations: 3,
        maxAssets: 20,
        maxIotDevices: 50,
        maxUsers: 10,
        historyRetentionDays: 365,
      },
      featureFlags: {
        allowsExports: true,
        allowsMaintenance: true,
        allowsAiGuidance: false,
        allowsAiReportSummary: false,
      },
      includedFeatures: [
        'Email alerts',
        'Operational reports',
        'Maintenance scheduling',
        'CSV exports',
        'Full incident lifecycle',
      ],
    },
    {
      id: 3,
      code: 'compliance-ai',
      displayName: 'Compliance AI',
      description: 'For multi-site quality teams that need compliance evidence and AI guidance.',
      monthlyPriceCents: 39900,
      currency: 'PEN',
      recommended: false,
      recommendedLabel: null,
      visible: true,
      usageLimits: {
        maxLocations: 10,
        maxAssets: 100,
        maxIotDevices: 250,
        maxUsers: 30,
        historyRetentionDays: 730,
      },
      featureFlags: {
        allowsExports: true,
        allowsMaintenance: true,
        allowsAiGuidance: true,
        allowsAiReportSummary: true,
      },
      includedFeatures: [
        'Advanced compliance reports',
        'AI incident guidance',
        'AI report summaries',
        'Priority support',
        'Expanded exports',
      ],
    },
  ];

  const localizedPlanCopy = {
    'es-419': {
      base: {
        displayName: 'Base',
        description: 'Para equipos pequenos que validan monitoreo de cadena de frio.',
        includedFeatures: ['Monitoreo basico', 'Alertas en la app', 'Lista de incidentes', 'Bitacora diaria basica'],
      },
      operations: {
        displayName: 'Operations',
        description: 'Para pymes con monitoreo recurrente y reportes operativos.',
        recommendedLabel: 'Recomendado',
        includedFeatures: [
          'Alertas por correo',
          'Reportes operativos',
          'Programacion de mantenimiento',
          'Exportaciones CSV',
          'Ciclo completo de incidentes',
        ],
      },
      'compliance-ai': {
        displayName: 'Compliance AI',
        description: 'Para equipos de calidad multisede que necesitan evidencia e IA de cumplimiento.',
        includedFeatures: [
          'Reportes avanzados de cumplimiento',
          'Guia de incidentes con IA',
          'Resumenes de reportes con IA',
          'Soporte prioritario',
          'Exportaciones ampliadas',
        ],
      },
    },
  };

  const labelsByLocale = {
    'en-US': {
      fallback:
        'Plan data is temporarily unavailable. Showing the current ColdTrace catalog fallback.',
      included: 'Included',
      limits: 'Limits',
      features: 'Included features',
      differences: 'Feature differences',
      month: '/mo',
      free: 'Free',
      unlimited: 'Unlimited',
      days: 'days',
      cta: 'Choose plan',
      ctaFree: 'Start free',
      locations: 'Locations',
      assets: 'Assets',
      iotDevices: 'IoT devices',
      users: 'Users',
      historyRetention: 'History retention',
      exports: 'CSV/PDF exports',
      maintenance: 'Maintenance scheduling',
      aiGuidance: 'AI incident guidance',
      aiReportSummary: 'AI report summaries',
    },
    'es-419': {
      fallback:
        'Los datos de planes no estan disponibles temporalmente. Mostramos el catalogo actual de ColdTrace.',
      included: 'Incluido',
      limits: 'Limites',
      features: 'Funciones incluidas',
      differences: 'Diferencias de funciones',
      month: '/mes',
      free: 'Gratis',
      unlimited: 'Ilimitado',
      days: 'dias',
      cta: 'Elegir plan',
      ctaFree: 'Empezar gratis',
      locations: 'Sedes',
      assets: 'Activos',
      iotDevices: 'Dispositivos IoT',
      users: 'Usuarios',
      historyRetention: 'Retencion historica',
      exports: 'Exportaciones CSV/PDF',
      maintenance: 'Programacion de mantenimiento',
      aiGuidance: 'Guia de incidentes con IA',
      aiReportSummary: 'Resumenes de reportes con IA',
    },
  };

  const state = {
    grid: null,
    status: null,
    plans: [],
    usingFallback: false,
  };

  function read(source, keys, fallbackValue = undefined) {
    if (!source || typeof source !== 'object') return fallbackValue;

    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        return source[key];
      }
    }

    return fallbackValue;
  }

  function toNumber(value, fallbackValue = 0) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallbackValue;
  }

  function normalizePlan(plan) {
    const usageLimits = read(plan, ['usageLimits', 'UsageLimits', 'usage_limits'], {});
    const featureFlags = read(plan, ['featureFlags', 'FeatureFlags', 'feature_flags'], {});
    const includedFeatures = read(plan, ['includedFeatures', 'IncludedFeatures', 'included_features'], []);

    return {
      id: toNumber(read(plan, ['id', 'Id']), 0),
      code: String(read(plan, ['code', 'Code'], '')).toLowerCase(),
      displayName: String(read(plan, ['displayName', 'DisplayName'], '')),
      description: String(read(plan, ['description', 'Description'], '')),
      monthlyPriceCents: toNumber(read(plan, ['monthlyPriceCents', 'MonthlyPriceCents'], 0)),
      currency: String(read(plan, ['currency', 'Currency'], 'PEN')),
      recommended: Boolean(read(plan, ['recommended', 'Recommended'], false)),
      recommendedLabel: read(plan, ['recommendedLabel', 'RecommendedLabel'], null),
      visible: read(plan, ['visible', 'Visible'], true) !== false,
      usageLimits: {
        maxLocations: read(usageLimits, ['maxLocations', 'MaxLocations'], null),
        maxAssets: read(usageLimits, ['maxAssets', 'MaxAssets'], null),
        maxIotDevices: read(usageLimits, ['maxIotDevices', 'MaxIotDevices'], null),
        maxUsers: read(usageLimits, ['maxUsers', 'MaxUsers'], null),
        historyRetentionDays: read(usageLimits, ['historyRetentionDays', 'HistoryRetentionDays'], null),
      },
      featureFlags: {
        allowsExports: Boolean(read(featureFlags, ['allowsExports', 'AllowsExports'], false)),
        allowsMaintenance: Boolean(read(featureFlags, ['allowsMaintenance', 'AllowsMaintenance'], false)),
        allowsAiGuidance: Boolean(read(featureFlags, ['allowsAiGuidance', 'AllowsAiGuidance'], false)),
        allowsAiReportSummary: Boolean(read(featureFlags, ['allowsAiReportSummary', 'AllowsAiReportSummary'], false)),
      },
      includedFeatures: Array.isArray(includedFeatures) ? includedFeatures.map(String) : [],
    };
  }

  function currentLocale() {
    const locale = document.documentElement.lang || localStorage.getItem('locale') || 'en-US';
    return locale.startsWith('es') ? 'es-419' : 'en-US';
  }

  function labels() {
    return labelsByLocale[currentLocale()] || labelsByLocale['en-US'];
  }

  function planWithLocalizedCopy(plan) {
    const locale = currentLocale();
    const copy = localizedPlanCopy[locale]?.[plan.code];

    if (!copy) return plan;

    return {
      ...plan,
      displayName: copy.displayName || plan.displayName,
      description: copy.description || plan.description,
      recommendedLabel: copy.recommendedLabel || plan.recommendedLabel,
      includedFeatures: copy.includedFeatures || plan.includedFeatures,
    };
  }

  function sortPlans(plans) {
    return [...plans].sort((firstPlan, secondPlan) => {
      const firstIndex = PLAN_ORDER.indexOf(firstPlan.code);
      const secondIndex = PLAN_ORDER.indexOf(secondPlan.code);
      return (firstIndex === -1 ? 99 : firstIndex) - (secondIndex === -1 ? 99 : secondIndex);
    });
  }

  function formatNumber(value) {
    return new Intl.NumberFormat(currentLocale()).format(Number(value));
  }

  function formatPrice(plan) {
    if (plan.monthlyPriceCents <= 0) {
      return labels().free;
    }

    const amount = plan.monthlyPriceCents / 100;

    if (plan.currency.toUpperCase() === 'PEN') {
      return `S/ ${formatNumber(amount)}`;
    }

    return new Intl.NumberFormat(currentLocale(), {
      style: 'currency',
      currency: plan.currency,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatLimit(value, isDays = false) {
    if (value === null || value === undefined) {
      return labels().unlimited;
    }

    const normalizedValue = toNumber(value, null);
    if (normalizedValue === null) {
      return labels().unlimited;
    }

    return isDays
      ? `${formatNumber(normalizedValue)} ${labels().days}`
      : formatNumber(normalizedValue);
  }

  function signUpUrl(planCode) {
    const query = new URLSearchParams({ plan: planCode });
    return `${appBaseUrl}${SIGN_UP_PATH}?${query.toString()}`;
  }

  function appendTextElement(parent, tagName, className, textContent) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = textContent;
    parent.appendChild(element);
    return element;
  }

  function renderLimit(parent, label, value, isDays = false) {
    const item = document.createElement('li');
    item.className = 'pricing-card__limit';

    appendTextElement(item, 'span', '', label);
    appendTextElement(item, 'strong', '', formatLimit(value, isDays));

    parent.appendChild(item);
  }

  function renderFlag(parent, label, isEnabled) {
    const item = document.createElement('li');
    item.className = 'pricing-card__flag';

    const icon = appendTextElement(item, 'span', 'pricing-card__icon', isEnabled ? '+' : '-');
    if (!isEnabled) icon.classList.add('pricing-card__icon--off');
    appendTextElement(item, 'span', '', label);

    parent.appendChild(item);
  }

  function renderFeature(parent, feature) {
    const item = document.createElement('li');
    item.className = 'pricing-card__feature';
    appendTextElement(item, 'span', 'pricing-card__icon', '+');
    appendTextElement(item, 'span', '', feature);
    parent.appendChild(item);
  }

  function renderPlanCard(plan) {
    const translatedPlan = planWithLocalizedCopy(plan);
    const card = document.createElement('article');
    card.className = 'pricing-card';
    if (translatedPlan.recommended) card.classList.add('pricing-card--recommended');

    if (translatedPlan.recommendedLabel) {
      appendTextElement(card, 'span', 'pricing-card__badge', translatedPlan.recommendedLabel);
    }

    appendTextElement(card, 'h3', 'pricing-card__name', translatedPlan.displayName);
    appendTextElement(card, 'p', 'pricing-card__description', translatedPlan.description);

    const price = document.createElement('div');
    price.className = 'pricing-card__price';
    appendTextElement(price, 'span', 'pricing-card__amount', formatPrice(translatedPlan));
    if (translatedPlan.monthlyPriceCents > 0) {
      appendTextElement(price, 'span', 'pricing-card__period', labels().month);
    }
    card.appendChild(price);

    appendTextElement(card, 'h4', 'pricing-card__section-title', labels().limits);
    const limits = document.createElement('ul');
    limits.className = 'pricing-card__limits';
    renderLimit(limits, labels().locations, translatedPlan.usageLimits.maxLocations);
    renderLimit(limits, labels().assets, translatedPlan.usageLimits.maxAssets);
    renderLimit(limits, labels().iotDevices, translatedPlan.usageLimits.maxIotDevices);
    renderLimit(limits, labels().users, translatedPlan.usageLimits.maxUsers);
    renderLimit(limits, labels().historyRetention, translatedPlan.usageLimits.historyRetentionDays, true);
    card.appendChild(limits);

    appendTextElement(card, 'h4', 'pricing-card__section-title', labels().differences);
    const flags = document.createElement('ul');
    flags.className = 'pricing-card__flags';
    renderFlag(flags, labels().exports, translatedPlan.featureFlags.allowsExports);
    renderFlag(flags, labels().maintenance, translatedPlan.featureFlags.allowsMaintenance);
    renderFlag(flags, labels().aiGuidance, translatedPlan.featureFlags.allowsAiGuidance);
    renderFlag(flags, labels().aiReportSummary, translatedPlan.featureFlags.allowsAiReportSummary);
    card.appendChild(flags);

    appendTextElement(card, 'h4', 'pricing-card__section-title', labels().features);
    const features = document.createElement('ul');
    features.className = 'pricing-card__features';
    translatedPlan.includedFeatures.forEach((feature) => renderFeature(features, feature));
    card.appendChild(features);

    const cta = document.createElement('a');
    cta.className = 'btn btn--primary pricing-card__cta';
    cta.href = signUpUrl(translatedPlan.code);
    cta.textContent = translatedPlan.monthlyPriceCents <= 0 ? labels().ctaFree : labels().cta;
    card.appendChild(cta);

    return card;
  }

  function renderPlans() {
    if (!state.grid || !state.status) return;

    state.grid.replaceChildren(...state.plans.map(renderPlanCard));
    state.status.hidden = !state.usingFallback;
    state.status.textContent = state.usingFallback ? labels().fallback : '';
  }

  async function fetchPlans() {
    const response = await fetch(`${apiBaseUrl}/subscription-plans`, {
      headers: { Accept: 'application/json' },
      credentials: 'omit',
    });

    if (!response.ok) {
      throw new Error(`Subscription plans request failed with ${response.status}`);
    }

    const payload = await response.json();
    if (!Array.isArray(payload) || payload.length === 0) {
      throw new Error('Subscription plans response was empty');
    }

    return sortPlans(payload.map(normalizePlan).filter((plan) => plan.visible && plan.code));
  }

  async function loadPlans() {
    try {
      state.plans = await fetchPlans();
      state.usingFallback = false;
    } catch (error) {
      console.warn(error);
      state.plans = sortPlans(fallbackPlans.map(normalizePlan));
      state.usingFallback = true;
    }

    renderPlans();
  }

  document.addEventListener('DOMContentLoaded', () => {
    state.grid = document.querySelector('[data-pricing-grid]');
    state.status = document.querySelector('[data-pricing-status]');

    if (!state.grid || !state.status) return;

    window.addEventListener('coldtrace:localechange', renderPlans);
    loadPlans();
  });
})();
