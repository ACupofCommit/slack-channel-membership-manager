const _ = require('lodash')

module.exports = api => {
  api.cache(true)

  return {
    presets: [
      ["@babel/env", {
        targets: { node: 'current' }
      }],
      ["@babel/typescript", {
        isTSX: true,
        allExtensions: true,
      }],
    ],
    plugins: [
      '@babel/plugin-transform-runtime',
      '@babel/plugin-proposal-optional-chaining',
    ]
  }
}
