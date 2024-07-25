import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  integrations: [tailwind(), react()],
  output: 'server',
  adapter: vercel(),
  vite: {
    define: {
      'import.meta.env.PUBLIC_STRAPI_URL': JSON.stringify(process.env.PUBLIC_STRAPI_URL),
    },
  },
});