"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { auditDictionary } from "../../storage/auditDictionary";
import { run as cookieAudit } from "../../utils/cookieAuditLogic";
import crawlerTypes from "../../types/crawler-types";
import cookie = crawlerTypes.cookie;
import {
  getRandomFirstLevelPagesUrl,
  getRandomSecondLevelPagesUrl,
  getRandomThirdLevelPagesUrl,
  getPrimaryPageUrl,
  getButtonUrl,
} from "../../utils/municipality/utils";
import { auditScanVariables } from "../../storage/municipality/auditScanVariables";
import { loadPageData } from "../../utils/utils";
import { primaryMenuItems } from "../../storage/municipality/menuItems";

const Audit = lighthouse.Audit;

const auditId = "municipality-legislation-cookie-domain-check";
const auditData = auditDictionary[auditId];

const accuracy = process.env["accuracy"] ?? "suggested";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const auditVariables = auditScanVariables[accuracy][auditId];

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: auditId,
      title: auditData.title,
      failureTitle: auditData.failureTitle,
      description: auditData.description,
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;
    const titleSubHeadings = [
      "Dominio del cookie",
      "Nome del cookie",
      "Valore del cookie",
    ];
    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato totale",
        subItemsHeading: { key: "inspected_page", itemType: "url" },
      },
      {
        key: "title_cookie_domain",
        itemType: "text",
        text: "",
        subItemsHeading: { key: "cookie_domain", itemType: "text" },
      },
      {
        key: "title_cookie_name",
        itemType: "text",
        text: "",
        subItemsHeading: { key: "cookie_name", itemType: "text" },
      },
      {
        key: "title_cookie_value",
        itemType: "text",
        text: "",
        subItemsHeading: { key: "cookie_value", itemType: "text" },
      },
    ];

    const randomFirstLevelPagesUrl = await getRandomFirstLevelPagesUrl(
      url,
      auditVariables.numberOfFirstLevelPageToBeScanned
    );

    const randomSecondLevelPagesUrl = await getRandomSecondLevelPagesUrl(
      url,
      auditVariables.numberOfSecondLevelPageToBeScanned
    );

    const randomServicesUrl = await getRandomThirdLevelPagesUrl(
      url,
      await getPrimaryPageUrl(url, primaryMenuItems.services.data_element),
      `[data-element="${primaryMenuItems.services.third_item_data_element}"]`,
      auditVariables.numberOfServicesToBeScanned
    );

    const randomEventsUrl = await getRandomThirdLevelPagesUrl(
      url,
      await getButtonUrl(
        await loadPageData(
          await getPrimaryPageUrl(url, primaryMenuItems.live.data_element)
        ),
        url,
        `[data-element="${primaryMenuItems.live.secondary_item_data_element[1]}"]`
      ),
      `[data-element="${primaryMenuItems.live.third_item_data_element}"]`,
      auditVariables.numberOfEventsToBeScanned
    );

    if (
      randomFirstLevelPagesUrl.length === 0 ||
      randomSecondLevelPagesUrl.length === 0 ||
      randomServicesUrl.length === 0
    ) {
      return {
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [
            {
              result: auditData.nonExecuted,
            },
          ]
        ),
      };
    }

    const pagesToBeAnalyzed = [
      url,
      ...randomFirstLevelPagesUrl,
      ...randomSecondLevelPagesUrl,
      ...randomServicesUrl,
      ...randomEventsUrl,
    ];

    const personalAreaLoginPage = await getPrimaryPageUrl(
      url,
      "personal-area-login"
    );
    if (personalAreaLoginPage !== "") {
      pagesToBeAnalyzed.push(personalAreaLoginPage);
    }

    const servicesPage = await getPrimaryPageUrl(url, "all-services");

    if (servicesPage !== "") {
      const bookingAppointmentPage = await getPrimaryPageUrl(
        servicesPage,
        "appointment-booking"
      );
      if (bookingAppointmentPage !== "") {
        pagesToBeAnalyzed.push(bookingAppointmentPage);
      }
    }

    let score = 1;
    let items: cookie[] = [];

    for (const pageToBeAnalyzed of pagesToBeAnalyzed) {
      const pageResult = await cookieAudit(pageToBeAnalyzed);
      if (pageResult.score < score) {
        score = pageResult.score;
      }

      items = [...items, ...pageResult.items];
    }

    const correctItems = [];
    const wrongItems = [];

    for (const item of items) {
      if (item.is_correct) {
        correctItems.push(item);
      } else {
        wrongItems.push(item);
      }
    }

    const results = [];
    switch (score) {
      case 1:
        results.push({
          result: auditData.greenResult,
        });
        break;
      case 0:
        results.push({
          result: auditData.redResult,
        });
        break;
    }

    results.push({});

    if (wrongItems.length > 0) {
      results.push({
        result: auditData.subItem.redResult,
        title_cookie_domain: titleSubHeadings[0],
        title_cookie_name: titleSubHeadings[1],
        title_cookie_value: titleSubHeadings[2],
      });

      for (const item of wrongItems) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }

      results.push({});
    }

    if (correctItems.length > 0) {
      results.push({
        result: auditData.subItem.greenResult,
        title_cookie_domain: titleSubHeadings[0],
        title_cookie_name: titleSubHeadings[1],
        title_cookie_value: titleSubHeadings[2],
      });

      for (const item of correctItems) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }

      results.push({});
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, results),
    };
  }
}

module.exports = LoadAudit;
