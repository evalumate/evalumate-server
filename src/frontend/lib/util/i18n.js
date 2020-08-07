const NextI18Next = require("next-i18next").default;
const path = require("path");

const i18n = new NextI18Next({
  defaultLanguage: "en",
  otherLanguages: ["de"],
  localePath: path.resolve("./public/static/locales"),
  localeSubpaths: {
    de: "de",
  },
});

module.exports = i18n;

if (process.env.NODE_ENV !== "production") {
  require("i18next-hmr").applyClientHMR(i18n.i18n);
}
