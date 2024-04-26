// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer"

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Sorosplits Documentation",
  tagline: "Documentation for Sorosplits smart contracts and platform.",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://docs.sorosplits.xyz",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  // organizationName: "findolor", // Usually your GitHub org/user name.
  // projectName: "sorosplits", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.js",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
        blog: false,
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Sorosplits",
        logo: {
          alt: "Sorosplits Logo",
          src: "img/logo.jpg",
        },
        items: [
          // {
          //   type: 'docSidebar',
          //   sidebarId: 'docSidebar',
          //   position: 'left',
          //   label: 'Tutorial',
          // },
          {
            href: "https://sorosplits.xyz",
            label: "Platform",
            position: "right",
          },
          {
            href: "https://github.com/orgs/Sorosplits/repositories",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "light",
        /* links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/Sorosplits/repositories',
              },
            ],
          },
        ], */
        copyright: `Copyright © ${new Date().getFullYear()} Sorosplits`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ["rust"],
      },
      colorMode: {
        defaultMode: "light",
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
    }),
}

export default config
