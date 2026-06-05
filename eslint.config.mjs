import nextConfig from 'eslint-config-next/core-web-vitals'

// eslint-config-next/core-web-vitals already registers:
//   [0] react, react-hooks, import, jsx-a11y, @next/next
//   [1] @typescript-eslint
// Rule overrides must be split across two config objects so each
// config object only references plugins it declares.

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...nextConfig,
  // Overrides that touch plugins from nextConfig[0]
  {
    plugins: nextConfig[0].plugins,
    rules: {
      '@next/next/no-img-element': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
    },
  },
  // Overrides that touch plugins from nextConfig[1]
  {
    plugins: nextConfig[1].plugins,
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/ban-ts-comment': 'warn',
    },
  },
]

export default config
