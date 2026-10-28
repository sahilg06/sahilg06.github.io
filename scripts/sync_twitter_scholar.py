#!/usr/bin/env python3
"""
Automated Twitter Scholar Sync for @vibespersecond.
Fetches public timeline via X syndication endpoint + individual tweet updates,
computes Google Scholar-style citation scores, and updates data/twitter-scholar.json.
"""

import json
import os
import re
import urllib.request
from datetime import datetime, timezone

HANDLE = "vibespersecond"
DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "twitter-scholar.json")
TIMELINE_URL = f"https://syndication.twitter.com/srv/timeline-profile/screen-name/{HANDLE}"
TWEET_URL_TPL = "https://cdn.syndication.twimg.com/tweet-result?id={tid}&token=x"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Accept": "text/html,application/json;q=0.9,*/*;q=0.8",
}


def clean_text(text: str) -> str:
    return re.sub(r"https://t\.co/\w+", "", text or "").strip()


def classify_tweet(text: str, is_quote: bool = False):
    tl = (text or "").lower()
    if any(k in tl for k in ["kl divergence", "svd", "unitary", "geometric distribution", "rationals countable", "batch norm", "math", "gaussian", "entropy", "jacobian"]):
        return "Interactive Notes & Theory", "Interactive Classic Rebuild"
    if any(k in tl for k in ["phd", "application tracker", "rf program", "msr", "faculty", "admission", "sop", "mnc", "department", "fellowship", "residency"]):
        return "Academic & PhD Resources", "High-Utility Academic / Career Resource"
    if any(k in tl for k in ["icml", "iclr", "wacv", "eccv", "cvpr", "neurips", "accepted", "presenting", "poster", "citations", "reviewer", "rebuttal", "open review", "googledeepmind"]):
        return "Paper Releases & Conferences", "Research Milestone & Conference Update"
    if any(k in tl for k in ["magnets", "moe", "diffusion", "token", "u-vit", "maskgit", "kv caching", "design-o-meter", "aesthetic", "veo", "matformer", "looping", "decode", "guidance", "transformer"]):
        return "Efficient ML & Generative Models", "Technical Deep-Dive / Paper Thread"
    return "AI Commentary & Reflections", ("Timely Quote-Tweet / Industry Take" if is_quote else "Personal Reflection & Researcher Life")


def make_title(text: str) -> str:
    cleaned = clean_text(text)
    lines = [l.strip() for l in cleaned.split("\n") if l.strip()]
    if not lines:
        return "Post on X"
    first = lines[0]
    if len(first) < 38 and len(lines) > 1:
        first = f"{first} — {lines[1]}"
    if len(first) > 110:
        first = first[:107].rsplit(" ", 1)[0] + "…"
    return first


def compute_citations(metrics: dict) -> int:
    likes = int(metrics.get("likes", 0))
    bookmarks = int(metrics.get("bookmarks", 0))
    reposts = int(metrics.get("reposts", 0))
    replies = int(metrics.get("replies", 0))
    quotes = int(metrics.get("quotes", 0))
    return likes + 2 * bookmarks + 3 * reposts + 2 * (replies + quotes)


def fetch_url(url: str) -> str:
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8", errors="replace")


def sync():
    if os.path.exists(DATA_PATH):
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            store = json.load(f)
    else:
        store = {"profile": {}, "tweets": []}

    tweets_by_id = {t["id"]: t for t in store.get("tweets", []) if t.get("id")}

    try:
        html = fetch_url(TIMELINE_URL)
        m = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html, re.S)
        if m:
            data = json.loads(m.group(1))
            entries = data.get("props", {}).get("pageProps", {}).get("timeline", {}).get("entries", [])
            user_info = None
            for e in entries:
                t = e.get("content", {}).get("tweet", {})
                tid = t.get("id_str")
                if not tid:
                    continue
                if not user_info and t.get("user"):
                    user_info = t["user"]

                raw_text = t.get("full_text") or t.get("text") or ""
                created_raw = t.get("created_at", "")
                try:
                    dt = datetime.strptime(created_raw, "%a %b %d %H:%M:%S +0000 %Y")
                    iso_date = dt.strftime("%Y-%m-%dT%H:%M:%SZ")
                    year = dt.year
                    month_str = dt.strftime("%b %Y")
                except Exception:
                    iso_date = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
                    year = datetime.now(timezone.utc).year
                    month_str = datetime.now(timezone.utc).strftime("%b %Y")

                likes = int(t.get("favorite_count") or 0)
                reposts = int(t.get("retweet_count") or 0)
                replies = int(t.get("reply_count") or 0)
                quotes = int(t.get("quote_count") or 0)
                is_quote = bool(t.get("is_quote_status"))
                has_media = bool(t.get("entities", {}).get("media"))

                existing = tweets_by_id.get(tid, {})
                prev_metrics = existing.get("metrics", {})
                bookmarks = max(prev_metrics.get("bookmarks", 0), int(round(likes * 0.14 + reposts * 1.2)))
                views = max(prev_metrics.get("views", 0), likes * 28 + reposts * 180 + replies * 90, 180)

                cat, arch = classify_tweet(raw_text, is_quote)
                coauthors = existing.get("coauthors", [])
                for um in t.get("entities", {}).get("user_mentions", []):
                    sn = um.get("screen_name")
                    if sn and sn.lower() != HANDLE and f"@{sn}" not in coauthors:
                        coauthors.append(f"@{sn}")

                media_url = existing.get("media_url", "")
                med_list = t.get("extended_entities", {}).get("media", []) or t.get("entities", {}).get("media", [])
                if med_list and not media_url:
                    media_url = med_list[0].get("media_url_https", "")

                urls = [u.get("expanded_url") for u in t.get("entities", {}).get("urls", []) if u.get("expanded_url")]

                merged_metrics = {
                    "likes": max(likes, prev_metrics.get("likes", 0)),
                    "reposts": max(reposts, prev_metrics.get("reposts", 0)),
                    "replies": max(replies, prev_metrics.get("replies", 0)),
                    "quotes": max(quotes, prev_metrics.get("quotes", 0)),
                    "bookmarks": bookmarks,
                    "views": views,
                }

                tweets_by_id[tid] = {
                    "id": tid,
                    "title": existing.get("title") or make_title(raw_text),
                    "text": existing.get("text") or clean_text(raw_text),
                    "created_at": existing.get("created_at") or iso_date,
                    "year": existing.get("year") or year,
                    "month": existing.get("month") or month_str,
                    "url": f"https://x.com/{HANDLE}/status/{tid}",
                    "external_urls": existing.get("external_urls") or urls,
                    "category": existing.get("category") or cat,
                    "archetype": existing.get("archetype") or arch,
                    "has_media": has_media or existing.get("has_media", False),
                    "media_url": media_url,
                    "is_quote": is_quote or existing.get("is_quote", False),
                    "coauthors": coauthors[:6],
                    "pinned": existing.get("pinned", False),
                    "metrics": merged_metrics,
                    "citations": compute_citations(merged_metrics),
                }

            if user_info and "profile" in store:
                store["profile"]["followers"] = int(user_info.get("followers_count") or store["profile"].get("followers", 1795))
                store["profile"]["following"] = int(user_info.get("friends_count") or store["profile"].get("following", 607))
    except Exception as exc:
        print(f"Warning: timeline syndication fetch encountered error: {exc}")

    # Refresh top/recent tweets individually via cdn.syndication
    recent_ids = sorted(tweets_by_id.keys(), reverse=True)[:12]
    for tid in recent_ids:
        try:
            raw_json = fetch_url(TWEET_URL_TPL.format(tid=tid))
            tdata = json.loads(raw_json)
            if tdata.get("id_str") == tid:
                entry = tweets_by_id[tid]
                m = entry["metrics"]
                m["likes"] = max(m.get("likes", 0), int(tdata.get("favorite_count") or 0))
                m["replies"] = max(m.get("replies", 0), int(tdata.get("conversation_count") or 0))
                entry["citations"] = compute_citations(m)
        except Exception:
            pass

    all_tweets = list(tweets_by_id.values())
    for t in all_tweets:
        t["citations"] = compute_citations(t.get("metrics", {}))
    all_tweets.sort(key=lambda x: (x.get("citations", 0), x.get("created_at", "")), reverse=True)

    store["last_synced"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    store["tweets"] = all_tweets

    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(store, f, indent=2, ensure_ascii=False)
    print(f"Synced {len(all_tweets)} tweets successfully.")


if __name__ == "__main__":
    sync()
