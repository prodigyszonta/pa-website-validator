import {
  schoolAuditsFolder,
  commonGatherersFolder,
  schoolInformativeAuditsFolder,
  commonInformativeAuditsFolder,
} from "../configFolderingConstants.js";

import {
  groups,
  accessibilityAudits,
  bestPracticeAudits,
  seoAudits,
  pwaAudits,
} from "../commonAuditsParts.js";

const customModelComplianceAudits = [
  {
    id: "school-ux-ui-consistency-fonts-check",
    weight: 100,
    group: "user-experience",
  },
  {
    id: "school-ux-ui-consistency-bootstrap-italia-double-check",
    weight: 99,
    group: "user-experience",
  },
  {
    id: "school-ux-ui-consistency-theme-version-check",
    weight: 98,
    group: "user-experience",
  },
  {
    id: "school-menu-structure-match-model",
    weight: 97,
    group: "user-experience",
  },
  {
    id: "school-menu-scuola-second-level-structure-match-model",
    weight: 96,
    group: "user-experience",
  },
  {
    id: "school-legislation-privacy-is-present",
    weight: 95,
    group: "legislation",
  },
  {
    id: "school-legislation-accessibility-declaration-is-present",
    weight: 94,
    group: "legislation",
  },
  {
    id: "school-informative-cookie-domain-check",
    weight: 93,
    group: "legislation",
  },
  {
    id: "school-informative-security",
    weight: 92,
    group: "security",
  },
];

const customReccomendationsAudits = [
  {
    id: "school-controlled-vocabularies",
    weight: 91,
    group: "user-experience",
  },
  {
    id: "school-servizi-structure-match-model",
    weight: 90,
    group: "user-experience",
  },
  { id: "school-informative-reuse", weight: 89, group: "legislation" },
  {
    id: "school-license-and-attribution",
    weight: 88,
    group: "legislation",
  },
  {
    id: "school-informative-cloud-infrastructure",
    weight: 87,
    group: "legislation",
  },
];

const customAdditionalAudits = [
  {
    id: "common-informative-ip-location",
    weight: 86,
    group: "security",
  },
];

export default {
  extends: "lighthouse:default",
  settings: {
    onlyCategories: [
      "modelCompliance",
      "recommendations",
      "additionalTests",
      "performance",
    ],
  },

  passes: [
    {
      gatherers: [
        commonGatherersFolder + "/bootstrapItaliaCheckGatherer.js",
        commonGatherersFolder + "/bootstrapItaliaSelectorCheckGatherer.js",
        commonGatherersFolder + "/originGatherer.js",
        commonGatherersFolder + "/hostnameGatherer.js",
      ],
    },
  ],

  audits: [
    schoolAuditsFolder + "/fontsCheckAudit.js",
    schoolAuditsFolder + "/themeVersionCheckAudit.js",

    schoolAuditsFolder + "/accessibilityDeclarationIsPresentAudit.js",
    schoolAuditsFolder + "/privacyAudit.js",

    schoolAuditsFolder + "/menuAudit.js",
    schoolAuditsFolder + "/menuScuolaSecondLevelAudit.js",
    schoolAuditsFolder + "/serviziAudit.js",
    schoolAuditsFolder + "/controlledVocabulariesAudit.js",
    schoolAuditsFolder + "/licenseAndAttributionAudit.js",

    schoolInformativeAuditsFolder + "/reuseAudit.js",
    schoolInformativeAuditsFolder + "/cloudInfrastructureAudit.js",
    schoolInformativeAuditsFolder + "/cookieDomainCheckAudit.js",
    schoolInformativeAuditsFolder + "/securityAudit.js",

    schoolAuditsFolder + "/bootstrapItaliaDoubleCheckAudit.js",

    commonInformativeAuditsFolder + "/ipLocationAudit.js",
  ],

  groups: groups,

  categories: {
    modelCompliance: {
      title: "Criteri di conformità",
      description:
        "Vengono mostrati i risultati degli audit relativi ai [criteri di conformità del Pacchetto Scuola Online](https://docs.italia.it/italia/designers-italia/design-scuole-docs/it/versione-corrente/conformita-modello-scuola.html). NB: il superamento degli audit non implica il superamento dei corrispondenti criteri di conformità.",
      auditRefs: [...customModelComplianceAudits],
    },

    recommendations: {
      title: "Raccomandazioni progettuali",
      description:
        "Vengono mostrati i risultati degli audit relativi ad alcune delle [raccomandazioni progettuali del Pacchetto Scuola Online](https://docs.italia.it/italia/designers-italia/design-scuole-docs/it/versione-corrente/conformita-modello-scuola.html#raccomandazioni).",
      auditRefs: [...customReccomendationsAudits],
    },

    additionalTests: {
      title: "Test aggiuntivi",
      description:
        "Vengono mostrati i risultati di test aggiuntivi utili a facilitare le attività di sviluppo e garantire un buon risultato.",
      auditRefs: [
        ...customAdditionalAudits,
        ...accessibilityAudits,
        ...bestPracticeAudits,
        ...seoAudits,
        ...pwaAudits,
      ],
    },

    performance: {
      title:
        'Raccomandazione progettuale "R.SC.3.1 - Velocità e tempi di risposta"',
      description:
        "CONDIZIONI DI SUCCESSO: il sito presenta livelli di prestazioni (media pesata di 6 metriche standard) pari o superiori a 50; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs)",
    },
  },
};
