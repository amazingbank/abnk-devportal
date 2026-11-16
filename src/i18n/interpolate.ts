/**
 * 将模板字符串中的 `{param}` 占位符替换为给定参数。
 *
 * 示例：interpolate('阶段 {no}', { no: '01' }) → '阶段 01'
 * 未知占位符原样保留，多余参数被忽略。（与 abnk-website/asdm-ai-2026 一致）
 *
 * Replace `{param}` placeholders in a template string with the given values.
 * Unknown placeholders stay as-is; extra params are ignored.
 * (Identical to abnk-website / asdm-ai-2026.)
 */
export function interpolate(
  template: string,
  params: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match,
  );
}
