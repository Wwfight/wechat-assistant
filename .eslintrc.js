// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    "sourceType": "module"
  },
  env: {
    browser: false,
    node: true,
    es6: true
  },
  // https://github.com/standard/standard/blob/master/docs/RULES-en.md
  'extends': [
    "eslint:recommended",
    "plugin:vue/recommended"
  ],
  plugins:[
    "vue"
  ],
  // add your custom rules here
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'vue/name-property-casing': ['error', 'kebab-case'],
    'vue/component-name-in-template-casing': ['error', 'kebab-case'],
    'vue/max-attributes-per-line': 'off',
    'vue/require-default-prop': 'off',
    "vue/attributes-order": ["warn"]
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        indent: 'off',
        'vue/script-indent': ['error', 2, { baseIndent: 1 }]
      }
    }
  ],
  globals: {
    App: true,
    Page: true,
    wx: true,
    getApp: true,
    getPage: true,
    requirePlugin: true
  }
}
