const { defineConfig } = require('cypress');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');
const { createEsbuildPlugin } = require('@badeball/cypress-cucumber-preprocessor/esbuild');

module.exports = defineConfig({
  e2e: {
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);

      on(
        'file:preprocessor',
        createBundler({
          plugins: [
            createEsbuildPlugin(config),
            require('node-stdlib-browser/helpers/esbuild/plugin')(require('node-stdlib-browser'))
          ],
          define: {
            'process.env.NODE_ENV': JSON.stringify(process.env['NODE_ENV'] || 'test'),
          },
          inject: [require.resolve('node-stdlib-browser/helpers/esbuild/shim')],
        })
      );

      return config;
    },
    specPattern: 'cypress/e2e/**/*.feature',
    baseUrl: 'http://localhost:4200',
  },
});