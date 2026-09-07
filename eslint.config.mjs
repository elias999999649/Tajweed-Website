import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    // This content-first site intentionally uses plain internal anchors in server-rendered
    // educational markup so links remain crawlable without client navigation.
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
];

export default config;
