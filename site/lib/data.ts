import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "..", "data");

export interface ChannelIndex {
  id: string;
  name: string;
  description: string;
  last_updated: string;
  item_count: number;
}

export interface NewsItem {
  title: string;
  summary: string;
  source: string;
  source_type: string;
  url: string;
  timestamp: string;
  importance: number;
  tags: string[];
  batch_time?: string;
}

export interface BatchGroup {
  batch_time: string;
  label: string;
  items: NewsItem[];
  isLatest: boolean;
}

export interface ChannelData {
  channel_id: string;
  channel_name: string;
  generated_at: string;
  digest: string;
  items: NewsItem[];
}

export function getChannels(): ChannelIndex[] {
  const indexPath = path.join(DATA_DIR, "index.json");
  if (!fs.existsSync(indexPath)) return [];
  const data = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
  return data.channels || [];
}

export function getChannelData(id: string): ChannelData | null {
  const latestPath = path.join(DATA_DIR, id, "latest.json");
  if (!fs.existsSync(latestPath)) return null;
  return JSON.parse(fs.readFileSync(latestPath, "utf-8"));
}

export function getArchiveList(id: string): string[] {
  const archiveDir = path.join(DATA_DIR, id, "archive");
  if (!fs.existsSync(archiveDir)) return [];
  return fs
    .readdirSync(archiveDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))
    .sort()
    .reverse();
}

export function getArchiveData(
  id: string,
  archiveId: string
): ChannelData | null {
  const filePath = path.join(DATA_DIR, id, "archive", `${archiveId}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function groupByBatch(data: ChannelData): BatchGroup[] {
  const latestBatchTime = data.generated_at;

  // Group items by batch_time
  const groups = new Map<string, NewsItem[]>();
  for (const item of data.items) {
    const bt = item.batch_time || latestBatchTime;
    if (!groups.has(bt)) groups.set(bt, []);
    groups.get(bt)!.push(item);
  }

  // Sort each group by importance desc
  for (const items of groups.values()) {
    items.sort((a, b) => b.importance - a.importance);
  }

  // Sort batch groups by time desc (newest first)
  const sorted = [...groups.entries()].sort(
    (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
  );

  return sorted.map(([bt, items], idx) => ({
    batch_time: bt,
    label: idx === 0 ? "最新更新" : `更新于 ${formatTime(bt)}`,
    items,
    isLatest: idx === 0,
  }));
}

export function formatTime(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "刚刚";
    if (diffMin < 60) return `${diffMin}分钟前`;
    if (diffHour < 24) return `${diffHour}小时前`;
    if (diffDay < 7) return `${diffDay}天前`;

    return d.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoStr;
  }
}
