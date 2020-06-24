import NextI18Next from "next-i18next";

export const i18n = new NextI18Next({
  defaultLanguage: "en",
  otherLanguages: ["de"],
  localePath: "src/frontend/public/static/locales",
  localeSubpaths: {
    de: "de",
  },
});

export const useTranslation = i18n.useTranslation;
export const Link = i18n.Link;
export const Router = i18n.Router;
export const appWithTranslation = i18n.appWithTranslation;

if (process.env.NODE_ENV !== "production") {
  const { applyClientHMR } = require("i18next-hmr");
  applyClientHMR(i18n.i18n);
}
