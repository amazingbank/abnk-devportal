// 语言资源注册表（同构复刻 abnk-website 的 src/i18n/resources.ts——第三次复刻）。
//
// 与 website 的差异：portal 是过程资产渲染器（D4 build-time 静态），语言包同样
// 静态 import 打进主包；D3 口径「UI 双语 + 内容 zh 全量 + en 增量 fallback」，
// 兜底语言取 zh-cn（内容主语言），与官网「国际银行 en 优先」相反。
// Locale resource registry (isomorphic copy of abnk-website resources.ts, third reuse).
// Difference: portal default locale is zh-cn (the primary content language per D3),
// the inverse of the marketing website's en-first stance.
import zhCommon from './locales/zh-cn/common.json';
import zhHome from './locales/zh-cn/home.json';
import enCommon from './locales/en-us/common.json';
import enHome from './locales/en-us/home.json';

export type Locale = 'en-us' | 'zh-cn';

/** 无前缀 URL 重定向时的兜底语言（浏览器检测结果优先）。 */
/** Fallback locale for prefix-less URL redirects (browser detection wins when available). */
export const DEFAULT_LOCALE: Locale = 'zh-cn';

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'en-us', label: 'English' },
  { code: 'zh-cn', label: '中文' },
];

/** Widens literal types from JSON imports so translated resources stay assignable. */
type Widen<T> = T extends string
  ? string
  : T extends number | boolean | null
    ? T
    : T extends readonly (infer U)[]
      ? Widen<U>[]
      : T extends object
        ? { [K in keyof T]: Widen<T[K]> }
        : T;

/** 语言包结构，以中文包（文案原始来源）推导；英文包受同一结构约束。 */
/** Locale pack shape, derived from the zh pack (source of copy truth); en is structurally bound to it. */
export type Common = Widen<typeof zhCommon>;
export type Home = Widen<typeof zhHome>;

export type Translations = { common: Common; home: Home };

// 编译期结构校验：英文包键结构必须与中文包完全一致。
// Compile-time structural check: the en pack must match the zh pack key-for-key.
const english = { common: enCommon, home: enHome } satisfies Translations;

export const RESOURCES: Record<Locale, Translations> = {
  'zh-cn': { common: zhCommon, home: zhHome },
  'en-us': english,
};
