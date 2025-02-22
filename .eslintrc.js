// .eslintrc.js at the repository root
module.exports = {
    parser: '@typescript-eslint/parser', // or 'babel-eslint', depending on your project
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      project: './tsconfig.json', // for rules requiring type information
    },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      // Add other configs if needed
    ],
    rules: {
      // Custom rules go here
    },
    // Optionally customize file matching using 'overrides'
    // if the client/server differ (React vs. Node) 
    // overrides: [
    //   {
    //     files: ['client/**/*.ts', 'client/**/*.tsx'],
    //     // client-specific rules
    //   },
    //   {
    //     files: ['server/**/*.ts'],
    //     // server-specific rules
    //   }
    // ],
  };
  