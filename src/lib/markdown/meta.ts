// front-matter 元信息剥离（任务 3.6 公共化——3.3 起沉淀在 decisions-data，六
// 页面文档渲染共用后上提至渲染管线）：原文正文由页头结构化呈现索引元数据，
// front-matter 头不重复渲染。非 front-matter 开头的原文原样返回。
// Front-matter stripping (public-ized in task 3.6 — it lived in
// decisions-data since 3.3 and moved up into the render pipeline once all
// six document pages share it): the page header renders index metadata
// structurally, so the front-matter block is never rendered twice. Originals
// not starting with a front-matter block return unchanged.
export function stripMetaHeader(raw: string): string {
  if (!raw.startsWith('---')) return raw;
  const lines = raw.split('\n');
  const end = lines.indexOf('---', 1);
  return end > 0 ? lines.slice(end + 1).join('\n') : raw;
}
