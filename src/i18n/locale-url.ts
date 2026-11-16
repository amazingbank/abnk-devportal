// URL 前缀 ↔ 语言（与 abnk-website/asdm-ai-2026 一致）。
// URL 前缀（/en-us/、/zh-cn/）是语言的唯一事实来源。
// URL prefix ↔ locale (identical to abnk-website / asdm-ai-2026):
// the URL prefix is the single source of truth for the active locale.
import type { Locale } from './resources';

const LOCALE_PREFIXES = new Set<Locale>(['en-us', 'zh-cn']);

/**
 * 从路径第一段解析语言（"/en-us/..." | "/zh-cn/..."）；
 * 无前缀或前缀非法时返回 null（reset 语义）。
 *
 * Parses the locale from the first path segment; returns null when the
 * prefix is missing or invalid (reset semantics).
 */
export function parseLocaleFromPathname(pathname: string): Locale | null {
  const first = pathname.split('/')[1] ?? '';
  return LOCALE_PREFIXES.has(first as Locale) ? (first as Locale) : null;
}

/**
 * 交换路径的语言前缀并保留其余部分（含尾斜杠），
 * 例如 "/en-us/#timeline" -> "/zh-cn/#timeline"。
 *
 * Swaps the locale prefix of a path while keeping the rest (including the
 * trailing slash), e.g. "/en-us/#timeline" -> "/zh-cn/#timeline".
 */
export function swapLocalePrefix(pathname: string, target: Locale): string {
  const rest = pathname.slice(1).split('/').slice(1).join('/');
  return `/${target}/${rest}`;
}
