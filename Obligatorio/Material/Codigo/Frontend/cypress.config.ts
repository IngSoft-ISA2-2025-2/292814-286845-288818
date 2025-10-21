import { defineConfig } from 'cypress'
import cucumber from 'cypress-cucumber-preprocessor'

export default defineConfig({
    e2e: {
        specPattern: "**/*.feature",
        setupNodeEvents(on, config) {
            on('file:preprocessor', cucumber())
        },
    },
});