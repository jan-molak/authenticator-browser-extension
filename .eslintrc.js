module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint',
        'simple-import-sort',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:unicorn/recommended',
    ],
    rules: {
        'indent': 'off',
        '@typescript-eslint/indent': ['error', 4],
        
        'quotes': 'off',
        '@typescript-eslint/quotes': ['error', 'single', { 'allowTemplateLiterals': true }],

        'simple-import-sort/imports': 'error',

        'unicorn/empty-brace-spaces': 'off',
        
        'unicorn/filename-case': [ 'error', {
            'cases': {
                'pascalCase': true,
                'kebabCase': true
            }
        }],
    }
};
