import Link from "next/link";
import { getChannels, getChannelData, formatTime } from "@/lib/data";

export const revalidate = 300;

export default function Home() {
  const channels = getChannels();

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <header className="mb-12">
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          新闻追踪
        </h1>
        <p
          className="mt-2 text-sm leading-relaxed"
          style={{ color: "var(--text-tertiary)" }}
        >
          多源聚合 · AI 摘要 · 自动更新
        </p>
      </header>

      {channels.length === 0 ? (
        <div
          className="rounded-xl border px-6 py-16 text-center"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          <p style={{ color: "var(--text-tertiary)" }}>
            暂无追踪频道
          </p>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            通过 Bot 发送「我想跟进 XXX 新闻」来创建频道
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {channels.map((ch) => (
            <ChannelCard key={ch.id} channel={ch} />
          ))}
        </div>
      )}

      <footer
        className="mt-16 border-t pt-6 text-center text-xs"
        style={{
          borderColor: "var(--border)",
          color: "var(--text-tertiary)",
        }}
      >
        由 AI 自动抓取与整理 · 数据来源：Tavily / Grok / Twitter
      </footer>
    </main>
  );
}

function ChannelCard({
  channel,
}: {
  channel: { id: string; name: string; description: string; last_updated: string; item_count: number };
}) {
  const data = getChannelData(channel.id);
  const previewItems = data?.items?.slice(0, 3) || [];

  return (
    <Link href={`/channel/${channel.id}`} className="block group">
      <article
        className="rounded-xl border px-5 py-4 transition-shadow hover:shadow-md"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2
              className="font-medium group-hover:underline"
              style={{ color: "var(--text-primary)" }}
            >
              {channel.name}
            </h2>
            <p
              className="mt-0.5 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {channel.description}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span
              className="text-xs"
              style={{ color: "var(--text-tertiary)" }}
            >
              {formatTime(channel.last_updated)}
            </span>
            <div
              className="mt-0.5 text-xs"
              style={{ color: "var(--text-tertiary)" }}
            >
              {channel.item_count} 条
            </div>
          </div>
        </div>

        {previewItems.length > 0 && (
          <div
            className="mt-3 space-y-1 border-t pt-3"
            style={{ borderColor: "var(--border)" }}
          >
            {previewItems.map((item, i) => (
              <div key={i} className="flex items-baseline gap-2 text-sm">
                <span
                  className="shrink-0 text-xs font-medium tabular-nums"
                  style={{ color: "var(--accent)" }}
                >
                  {item.importance}
                </span>
                <span
                  className="truncate"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </article>
    </Link>
  );
}
