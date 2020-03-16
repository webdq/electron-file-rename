module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  globals: {
    __static: true
  },
  plugins: ['html', 'vue'],
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'vue/no-parsing-error': [2, { 'x-invalid-end-tag': false }],
    // allow async-await
    'generator-star-spacing': 'off',
    // 关闭检测未使用的变量
    'no-unused-vars': 'off',
    'prettier/prettier': 'off'
  }
};
