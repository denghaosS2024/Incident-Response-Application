module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': 'ts-jest', // Add support for TypeScript
    },
    testMatch: ['<rootDir>/server/test/**/*.spec.ts'], // Match all .spec.ts files
};