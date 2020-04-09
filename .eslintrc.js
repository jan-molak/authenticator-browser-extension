module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:unicorn/recommended',
    ],
    rules: {
        'indent': 'off',
        '@typescript-eslint/indent': ["error", 4],
        'unicorn/filename-case': [ 'error', {
            'cases': {
                'pascalCase': true,
                'kebabCase': true
            }
        }],
    }
};
