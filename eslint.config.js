import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // dist 为构建产物；src/data/ 的复制素材均为 md/json/yaml/png——eslint 只
  // 检查 ts/tsx，其中入库的 schema.ts/sample.check.ts 照常受辖，无需豁免。
  // dist is a build product; the synced src/data/ materials are md/json/yaml/png
  // which eslint never touches, while committed schema.ts/sample.check.ts stay covered.
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    // 构建侧配置文件运行在 Node 而非浏览器：补 node 全局（tokens 读取用 process/fs）。
    // Build-side config files run under Node, not the browser: add node globals.
    files: ['vite.config.ts', 'tailwind.config.js', 'scripts/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
);
