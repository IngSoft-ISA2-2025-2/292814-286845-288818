import { defineConfig } from 'cypress';
import cucumber from 'cypress-cucumber-preprocessor';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.feature',
    setupNodeEvents(on, config) {
      on(
        'file:preprocessor',
        cucumber({
          typescript: require.resolve('typescript'),
        })
      );
    },
  },
});
