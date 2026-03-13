import { NextRequest, NextResponse } from "next/server";

const REPO = "wysthinker/news-hub";
const BRANCH = "main";
const FILE_PATH = "data/analytics/clicks.jsonl";
const GITHUB_API = "https://api.github.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { channel_id, url, title, ts } = body;
    if (!url) {
      return NextResponse.json({ error: "missing url" }, { status: 400 });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      // Tracking silently fails if no token — non-critical
      return NextResponse.json({ ok: false, reason: "no token" });
    }

    const line =
      JSON.stringify({ channel_id, url, title, ts }) + "\n";

    // Get existing file
    const getRes = await fetch(
      `${GITHUB_API}/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
        cache: "no-store",
      }
    );

    let existing = "";
    let sha: string | undefined;

    if (getRes.ok) {
      const data = await getRes.json();
      existing = Buffer.from(data.content, "base64").toString("utf-8");
      sha = data.sha;
    }

    // Append new line
    const updated = existing + line;
    const encoded = Buffer.from(updated).toString("base64");

    const putBody: Record<string, string> = {
      message: `track: ${channel_id}`,
      content: encoded,
      branch: BRANCH,
    };
    if (sha) putBody.sha = sha;

    const putRes = await fetch(
      `${GITHUB_API}/repos/${REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(putBody),
        cache: "no-store",
      }
    );

    if (!putRes.ok) {
      const err = await putRes.text();
      console.error("[track] GitHub write failed:", err);
      return NextResponse.json({ ok: false });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[track] error:", e);
    return NextResponse.json({ ok: false });
  }
}
