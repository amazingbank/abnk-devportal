import { useEffect, useState } from 'react';

import type { EvidenceCopy } from '@/i18n';
import type { EvidenceFile } from '@/lib/link-resolver';
import { loadEvidenceRaw } from './evidence-data';

// 内联素材卡（任务 3.6）：证据文件的展开式呈现单元，按 kind 三分支——
// 截图卡（img 走 public/evidence 直供，懒加载）、JSON 报告卡（?raw 懒加载
// 内容 + pretty-print）、文本卡（?raw 懒加载 pre 原样）。点击标题展开/收起；
// 加载失败如实展示失败态（D6：不静默吞掉）。data-material 探针锚点。
// Inline material card (task 3.6): the expandable presentation unit of one
// evidence file with three kind branches — the screenshot card (img via the
// public/evidence direct channel, lazy), the JSON report card (?raw lazy
// content, pretty-printed) and the text card (?raw lazy, verbatim in a pre).
// The title toggles expansion; load failures render the honest failure state
// (D6: nothing silently swallowed). data-material is the probe anchor.
function MaterialBody({
  file,
  copy,
}: {
  file: EvidenceFile;
  copy: EvidenceCopy;
}) {
  const [content, setContent] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const loader = file.kind === 'image' ? null : loadEvidenceRaw(file);

  useEffect(() => {
    if (!loader) return;
    let alive = true;
    setContent(null);
    setFailed(false);
    loader()
      .then((text: string) => {
        if (alive) setContent(text);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [loader]);

  if (file.kind === 'image') {
    return (
      <img
        src={file.url}
        alt={file.name}
        loading="lazy"
        className="w-full rounded-sm border border-taupe-300/60"
      />
    );
  }
  if (failed) {
    return <p className="text-sm text-brick-600">{copy.material.loadFail}</p>;
  }
  if (content === null) {
    return <p className="text-sm text-taupe-500">{copy.material.loading}</p>;
  }
  if (file.kind === 'json') {
    let pretty = content;
    try {
      pretty = JSON.stringify(JSON.parse(content), null, 2);
    } catch {
      // 非 JSON 形态：原样呈现（不虚构格式）。
      // Not JSON-shaped: shown verbatim (no invented formatting).
    }
    return (
      <pre className="overflow-x-auto border border-taupe-300 bg-ivory-50 p-4 font-mono text-[12px] leading-relaxed text-char">
        {pretty}
      </pre>
    );
  }
  return (
    <pre className="overflow-x-auto border border-taupe-300 bg-ivory-50 p-4 font-mono text-[12px] leading-relaxed text-char">
      {content}
    </pre>
  );
}

export function MaterialCard({ file, copy }: { file: EvidenceFile; copy: EvidenceCopy }) {
  const [open, setOpen] = useState(false);
  const kindLabel =
    file.kind === 'image' ? copy.material.image : file.kind === 'json' ? copy.material.json : copy.material.text;
  return (
    <div data-material={file.name} className="hairline bg-ivory-50 px-4 py-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-left"
      >
        <span className="font-mono text-[12px] text-copper-600">
          {open ? '−' : '+'} {file.name}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-taupe-500">{kindLabel}</span>
      </button>
      {open ? (
        <div className="mt-3">
          <MaterialBody file={file} copy={copy} />
          <p className="mt-2 text-right">
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] text-copper-600 transition-colors hover:text-copper-700"
            >
              {copy.material.originalLink} ↗
            </a>
          </p>
        </div>
      ) : null}
    </div>
  );
}
