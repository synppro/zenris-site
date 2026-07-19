import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://zenris.ro',
  integrations: [sitemap()],
  i18n: {
    defaultLocale: 'ro',
    locales: ['ro', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
