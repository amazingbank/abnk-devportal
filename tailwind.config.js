import { readFileSync } from 'node:fs';

// design tokens 经「ABNK_WEBSITE_TAILWIND 同款 env 覆盖机制」接单一事实源
// abnk-system/channels/shared/design-tokens.json（只读复制，portal 不复制色板文字）：
// 默认取工作区平级的 abnk-system clone；布局不同时用 ABNK_DEVPORTAL_TOKENS 覆盖路径。
// 缺失即构建失败（fail-loud）——tokens 链断裂要暴露，不允许静默回退硬编码色板。
// Design tokens are consumed read-only from the single source of truth
// abnk-system/channels/shared/design-tokens.json via an env-overridable path
// (same mechanism as ABNK_WEBSITE_TAILWIND). A missing file fails the build
// loudly; silent fallback to a hardcoded palette is never allowed.
const tokensPath =
  process.env.ABNK_DEVPORTAL_TOKENS ??
  new URL('../abnk-system/channels/shared/design-tokens.json', import.meta.url).pathname;

let tokens;
try {
  tokens = JSON.parse(readFileSync(tokensPath, 'utf8'));
} catch (err) {
  console.error(
    `[tailwind.config.js] design tokens 不可读: ${tokensPath}（${err.message}）——` +
      '检查 abnk-system clone 与 ABNK_DEVPORTAL_TOKENS 路径，详见 README 两仓并排前置',
  );
  process.exit(1);
}

// 字体名含空格（如 "Oxanium Variable"）必须加引号才生成合法 CSS font-family 列表。
// Font names containing spaces must be quoted to form a valid CSS font-family list.
const quote = (stack) => stack.map((name) => `"${name}"`);

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: tokens.colors,
      fontFamily: {
        sans: quote(tokens.fonts.sans),
        serif: quote(tokens.fonts.serif),
        mono: quote(tokens.fonts.mono),
      },
      letterSpacing: {
        eyebrow: tokens.eyebrow,
      },
      maxWidth: {
        page: tokens.pageMaxWidth,
      },
    },
  },
  plugins: [],
};
