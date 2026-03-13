import Link from "next/link";
import {
  getChannels,
  getChannelData,
  getItemById,
  itemId,
  formatTime,
} from "@/lib/data";
import { TrackView } from "./track";

export const revalidate = 300;

export function generateStaticParams() {
  const params: { id: string; itemId: string }[] = [];
  for (const ch of getChannels()) {
    const data = getChannelData(ch.id);
    if (!data) continue;
    for (const it of data.items) {
      if (it.url) params.push({ id: ch.id, itemId: itemId(it.url) });
    }
  }
  return params;
}

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const { id, itemId: iid } = await params;
  const result = getItemById(id, iid);
  const data = getChannelData(id);

  if (!result || !data) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-12">
        <Link
          href={`/channel/${id}`}
          className="text-sm hover:underline"
          style={{ color: "var(--text-tertiary)" }}
        >
          &larr; 返回频道
        </Link>
        <div
          className="mt-8 rounded-xl border px-6 py-16 text-center"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <p style={{ color: "var(--text-tertiary)" }}>新闻不存在或已过期</p>
        </div>
      </main>
    );
  }

  const { item } = result;
  const content = item.detail_content || item.summary;

  // Find related items from same batch (exclude self)
  const related = data.items
    .filter((it) => it.url !== item.url && it.batch_time === item.batch_time)
    .slice(0, 3);

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <TrackView channelId={id} itemUrl={item.url} itemTitle={item.title} />

      <Link
        href={`/channel/${id}`}
        className="text-sm hover:underline"
        style={{ color: "var(--text-tertiary)" }}
      >
        &larr; 返回频道
      </Link>

      <article className="mt-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <h1
            className="text-xl font-semibold leading-snug"
            style={{ color: "var(--text-primary)" }}
          >
            {item.title}
          </h1>
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums"
            style={{
              background:
                item.importance >= 7
                  ? "var(--accent-soft)"
                  : "var(--bg-secondary)",
              color:
                item.importance >= 7
                  ? "var(--accent)"
                  : "var(--text-tertiary)",
            }}
          >
            {item.importance}
          </span>
        </div>

        {/* Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span
            className="font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            {item.source}
          </span>
          <span style={{ color: "var(--text-tertiary)" }}>&middot;</span>
          <span style={{ color: "var(--text-tertiary)" }}>
            {formatTime(item.timestamp)}
          </span>
          {item.tags?.length > 0 && (
            <>
              <span style={{ color: "var(--text-tertiary)" }}>&middot;</span>
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border px-2 py-0.5"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-tertiary)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </>
          )}
        </div>

        {/* Content */}
        <div
          className="mt-6 rounded-xl border px-5 py-5"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          {content.split("\n").map((para, i) => (
            <p
              key={i}
              className="text-sm leading-relaxed [&:not(:first-child)]:mt-3"
              style={{ color: "var(--text-secondary)" }}
            >
              {para}
            </p>
          ))}
        </div>

        {/* Read original */}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-80"
            style={{
              borderColor: "var(--accent)",
              color: "var(--accent)",
            }}
          >
            阅读原文
            <span className="text-xs">&nearr;</span>
          </a>
        )}
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section
          className="mt-10 border-t pt-6"
          style={{ borderColor: "var(--border)" }}
        >
          <h2
            className="mb-3 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--text-tertiary)" }}
          >
            同批次相关
          </h2>
          <div className="space-y-2">
            {related.map((r) => (
              <Link
                key={r.url}
                href={`/channel/${id}/item/${itemId(r.url)}`}
                className="flex items-baseline gap-2 rounded-lg border px-4 py-3 text-sm transition-shadow hover:shadow-sm"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border)",
                }}
              >
                <span
                  className="shrink-0 text-xs font-semibold tabular-nums"
                  style={{ color: "var(--accent)" }}
                >
                  {r.importance}
                </span>
                <span
                  className="line-clamp-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {r.title}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer
        className="mt-10 border-t pt-6 text-center text-xs"
        style={{
          borderColor: "var(--border)",
          color: "var(--text-tertiary)",
        }}
      >
        数据来源：{item.source_type} · AI 自动摘要
      </footer>
    </main>
  );
}
