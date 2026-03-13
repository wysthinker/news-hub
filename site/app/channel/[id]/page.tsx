import Link from "next/link";
import {
  getChannels,
  getChannelData,
  getArchiveList,
  groupByDate,
  itemId,
  formatTime,
} from "@/lib/data";
import type { NewsItem, DateGroup } from "@/lib/data";

export const revalidate = 300;

export function generateStaticParams() {
  return getChannels().map((ch) => ({ id: ch.id }));
}

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = getChannelData(id);
  const archives = getArchiveList(id);

  if (!data) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-12">
        <Link
          href="/"
          className="text-sm hover:underline"
          style={{ color: "var(--text-tertiary)" }}
        >
          &larr; 返回
        </Link>
        <div
          className="mt-8 rounded-xl border px-6 py-16 text-center"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          <p style={{ color: "var(--text-tertiary)" }}>
            频道暂无数据
          </p>
        </div>
      </main>
    );
  }

  const dateGroups = groupByDate(data);

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <Link
        href="/"
        className="text-sm hover:underline"
        style={{ color: "var(--text-tertiary)" }}
      >
        &larr; 返回
      </Link>

      <header className="mt-6 mb-8">
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {data.channel_name}
        </h1>
        <p
          className="mt-1 text-xs"
          style={{ color: "var(--text-tertiary)" }}
        >
          更新于 {formatTime(data.generated_at)} · {data.items.length} 条
        </p>
      </header>

      {/* 形势综述 */}
      {data.digest && (
        <section
          className="mb-8 rounded-xl border px-5 py-4"
          style={{
            background: "var(--accent-soft)",
            borderColor: "var(--border)",
          }}
        >
          <h2
            className="mb-2 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--accent)" }}
          >
            形势综述
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          >
            {data.digest}
          </p>
        </section>
      )}

      {/* 按新闻日期分组 */}
      {dateGroups.map((group) => (
        <DateSection key={group.date} group={group} channelId={id} />
      ))}

      {/* 历史存档 */}
      {archives.length > 1 && (
        <section
          className="mt-12 border-t pt-6"
          style={{ borderColor: "var(--border)" }}
        >
          <h2
            className="mb-3 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--text-tertiary)" }}
          >
            历史记录
          </h2>
          <div className="flex flex-wrap gap-2">
            {archives.slice(0, 20).map((a) => (
              <span
                key={a}
                className="rounded-md border px-2.5 py-1 text-xs"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                {a.replace("_", " ")}
              </span>
            ))}
          </div>
        </section>
      )}

      <footer
        className="mt-12 border-t pt-6 text-center text-xs"
        style={{
          borderColor: "var(--border)",
          color: "var(--text-tertiary)",
        }}
      >
        数据来源：Tavily / Grok / Twitter · AI 自动摘要
      </footer>
    </main>
  );
}

function DateSection({
  group,
  channelId,
}: {
  group: DateGroup;
  channelId: string;
}) {
  const hasNew = group.items.some((it) => it.isNew);

  if (group.isRecent) {
    return (
      <section className="mb-8">
        <h2
          className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider"
          style={{ color: hasNew ? "var(--accent)" : "var(--text-secondary)" }}
        >
          {hasNew && (
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: "var(--accent)" }}
            />
          )}
          {group.label}
          <span style={{ color: "var(--text-tertiary)" }}>
            · {group.items.length} 条
          </span>
        </h2>
        <div className="space-y-3">
          {group.items.map((item, i) => (
            <NewsCard key={i} item={item} channelId={channelId} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <details className="mb-8 group">
      <summary
        className="mb-3 flex cursor-pointer items-center gap-2 text-xs font-medium uppercase tracking-wider list-none"
        style={{ color: "var(--text-tertiary)" }}
      >
        <span className="transition-transform group-open:rotate-90">&#9654;</span>
        {group.label}
        <span>· {group.items.length} 条</span>
      </summary>
      <div className="space-y-3">
        {group.items.map((item, i) => (
          <NewsCard key={i} item={item} channelId={channelId} />
        ))}
      </div>
    </details>
  );
}

function NewsCard({
  item,
  channelId,
}: {
  item: NewsItem & { isNew?: boolean };
  channelId: string;
}) {
  const detailHref = item.url
    ? `/channel/${channelId}/item/${itemId(item.url)}`
    : undefined;

  return (
    <article
      className="rounded-xl border px-5 py-4"
      style={{
        background: "var(--bg-card)",
        borderColor: item.isNew ? "var(--accent)" : "var(--border)",
        borderWidth: item.isNew ? "1.5px" : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className="font-medium leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {item.isNew && (
            <span
              className="mr-1.5 inline-block rounded px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase leading-none"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              NEW
            </span>
          )}
          {detailHref ? (
            <Link href={detailHref} className="hover:underline">
              {item.title}
            </Link>
          ) : (
            item.title
          )}
        </h3>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums"
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

      <p
        className="mt-2 text-sm leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        {item.summary}
      </p>

      <div className="mt-3 flex items-center gap-3 text-xs">
        <span style={{ color: "var(--text-tertiary)" }}>
          {item.source}
        </span>
        <span style={{ color: "var(--text-tertiary)" }}>&middot;</span>
        <span style={{ color: "var(--text-tertiary)" }}>
          {formatTime(item.timestamp)}
        </span>
        {item.tags?.length > 0 && (
          <>
            <span style={{ color: "var(--text-tertiary)" }}>
              &middot;
            </span>
            <span style={{ color: "var(--text-tertiary)" }}>
              {item.tags.join(" ")}
            </span>
          </>
        )}
        {detailHref && (
          <>
            <span style={{ color: "var(--text-tertiary)" }}>&middot;</span>
            <Link
              href={detailHref}
              className="hover:underline"
              style={{ color: "var(--accent)" }}
            >
              详情 &rarr;
            </Link>
          </>
        )}
      </div>
    </article>
  );
}
