export const EFFECTIVE_DATE = "25 October 2026";

export type LegalDocId = "privacy" | "terms" | "health" | "notices";

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export type LegalDoc = {
  id: LegalDocId;
  title: string;
  summary: string;
  sections: LegalSection[];
};

export const LEGAL_DOCS: LegalDoc[] = [
  {
    id: "privacy",
    title: "Privacy Policy",
    summary: "What stays on this device, and the one request the app makes to load fonts.",
    sections: [
      {
        heading: "This policy",
        paragraphs: [
          `This policy describes Caltek, the calorie journal in this browser, as of ${EFFECTIVE_DATE}. Caltek is software that runs on your device. It does not create an account and it does not operate a cloud service for your journal.`,
        ],
      },
      {
        heading: "Information stored on your device",
        paragraphs: [
          "Caltek saves a profile and a food log in this browser’s local storage, under the key caltek.v1. The profile can include the name you type, the female or male term used by the energy equation, age, height, weight, activity, goal, macro split, unit preference, and an optional calorie target. Each log entry can include the food name, meal, portion, calories, protein, carbohydrates, fat, and the date.",
          "That information is written by the app in your browser. It is not uploaded to a Caltek server, because there is no Caltek server. Other people cannot see it unless they can use this browser profile, a backup of it, or a device you have shared.",
        ],
      },
      {
        heading: "What Caltek does not do",
        paragraphs: [
          "Caltek does not sell personal information. It does not show ads. It does not use analytics, tracking pixels, or advertising cookies. It does not ask you to sign in.",
        ],
      },
      {
        heading: "Fonts",
        paragraphs: [
          "The page loads the Cormorant Garamond and Outfit typefaces from Google Fonts (fonts.googleapis.com and fonts.gstatic.com). Your browser contacts Google to download those font files. That request can include your IP address and ordinary browser details. Your journal entries are not included in that request. If the fonts cannot be loaded, the app falls back to fonts already on your device.",
        ],
      },
      {
        heading: "How long it is kept",
        paragraphs: [
          "The journal remains in local storage until you erase it, clear this site’s data in the browser, or remove the browser profile. Erase journal, on the Model screen, deletes the caltek.v1 entry in local storage. Caltek does not keep a separate copy.",
        ],
      },
      {
        heading: "Children",
        paragraphs: [
          "Caltek is not directed to children under 13, and it should not be used to record a child’s information. Do not enter information about another person unless you have a right to do so.",
        ],
      },
      {
        heading: "Changes",
        paragraphs: [
          "If this policy changes, the updated text and date appear in the app. The copy you are reading is the one that applies to this version.",
        ],
      },
    ],
  },
  {
    id: "terms",
    title: "Terms of Use",
    summary: "The rules for using Caltek as a personal journal.",
    sections: [
      {
        heading: "Agreement",
        paragraphs: [
          `These terms govern your use of Caltek as of ${EFFECTIVE_DATE}. By using the app, including by saving a profile or logging food, you agree to these terms, the Privacy Policy, and the Health & Nutrition Disclaimer.`,
          "If you do not agree, do not use Caltek. You can close the page without saving anything.",
        ],
      },
      {
        heading: "What you may do",
        paragraphs: [
          "You may use Caltek for your own personal nutrition tracking. The app is provided as software on your device. There is no subscription, no account, and no promise of a particular feature in a future version.",
        ],
      },
      {
        heading: "Your entries",
        paragraphs: [
          "You are responsible for the names, portions, and numbers you enter, including custom foods. Caltek does not review them. Do not use the journal to store information you are not allowed to store.",
        ],
      },
      {
        heading: "Estimates",
        paragraphs: [
          "Targets, calories, and macros are estimates. They can be wrong for your body and for the food in front of you. Read the Health & Nutrition Disclaimer before you rely on a number.",
        ],
      },
      {
        heading: "Acceptable use",
        paragraphs: [
          "Do not use Caltek to break the law, to harm someone, or to misrepresent the app as a medical device or a clinical service. Do not attempt to interfere with the app on a device you are not allowed to use.",
        ],
      },
      {
        heading: "No warranty",
        paragraphs: [
          "Caltek is provided as is and as available. To the fullest extent the law allows, there is no warranty of accuracy, fitness for a particular purpose, or uninterrupted operation. Font files, the browser, and local storage are outside Caltek’s control and can fail or change.",
        ],
      },
      {
        heading: "Liability",
        paragraphs: [
          "To the fullest extent the law allows, no one who provided this copy of Caltek is liable for indirect, incidental, special, or consequential damages, or for lost data, lost profits, or decisions you make from the journal. This does not limit liability that the law says cannot be limited, including rights you have as a consumer where you live.",
        ],
      },
      {
        heading: "Law",
        paragraphs: [
          "These terms do not choose a courthouse for you. Mandatory rights in the place where you use the app still apply. If a provision cannot be enforced, the rest of the terms stay in effect.",
        ],
      },
    ],
  },
  {
    id: "health",
    title: "Health & Nutrition Disclaimer",
    summary: "Caltek is a journal of estimates, not medical care.",
    sections: [
      {
        heading: "Not medical care",
        paragraphs: [
          "Caltek is not a medical device and it is not a doctor, dietitian, or other clinician. Nothing in the app is medical advice, diagnosis, or treatment, and nothing in it creates a clinician–patient relationship.",
          "Do not use Caltek to decide whether to start, stop, or change medication, a prescribed diet, or any other care. If you have a medical condition, are pregnant, or are recovering from an illness or an eating disorder, talk with a qualified clinician before you follow a calorie target.",
        ],
      },
      {
        heading: "How the numbers are made",
        paragraphs: [
          "The energy model uses the Mifflin–St Jeor equation, an activity factor, and a cut, maintain, or build adjustment. That equation was built for groups of adults. It uses the female and male terms from the original paper. It does not know your muscle, medications, hormones, or health history. A custom calorie target is whatever number you type.",
          "The food table uses rounded, typical values for common servings. A described plate is matched to that table and scaled by the portion the parser understood. A match can be the wrong food. A gram weight can be the wrong serving. Restaurant meals, recipes, and packaged foods vary. Custom entries use only the numbers you supply.",
        ],
      },
      {
        heading: "Safety",
        paragraphs: [
          "A calorie target can be too low or too high for you. Caltek will not stop you from logging an aggressive goal. If you feel faint, ill, or distressed about food, stop using the target and seek medical care.",
          "In an emergency, contact local emergency services. Do not wait on this app.",
        ],
      },
    ],
  },
  {
    id: "notices",
    title: "Notices",
    summary: "Copyright for this journal, and the software and fonts it uses.",
    sections: [
      {
        heading: "Caltek",
        paragraphs: [
          `© ${EFFECTIVE_DATE.slice(-4)} Caltek. The journal interface, energy-model wiring, and food-table compilation in this copy are part of the Caltek app. These notices do not grant anyone else the right to present the app as their own product.`,
        ],
      },
      {
        heading: "React",
        paragraphs: [
          "This app includes React and React DOM, copyright Meta Platforms, Inc. and affiliates. They are used under the MIT License. You may obtain a copy of that license at https://github.com/facebook/react/blob/main/LICENSE. The license includes the following permission notice:",
          "Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, and to permit persons to whom the software is furnished to do so, subject to the conditions in the MIT License. The software is provided as is, without warranty of any kind.",
        ],
      },
      {
        heading: "Fonts",
        paragraphs: [
          "Cormorant Garamond was designed by Christian Thalmann and is licensed under the SIL Open Font License, version 1.1. Outfit was designed by Rodrigo Fuenzalida and is licensed under the SIL Open Font License, version 1.1. Caltek loads both families from Google Fonts. The font files remain under their own license. The names Cormorant Garamond and Outfit are not trademarks of Caltek.",
        ],
      },
      {
        heading: "Build tools",
        paragraphs: [
          "The development copy of this project uses Vite, TypeScript, and related tooling. Those tools are not a service you sign into when you use the journal. Their licenses apply to those tools, not to your food log.",
        ],
      },
    ],
  },
];

export function legalDoc(id: LegalDocId) {
  return LEGAL_DOCS.find((doc) => doc.id === id) ?? LEGAL_DOCS[0];
}
