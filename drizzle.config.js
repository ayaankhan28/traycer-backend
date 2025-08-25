import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/config/schema.js',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './database.sqlite'
  }
});
