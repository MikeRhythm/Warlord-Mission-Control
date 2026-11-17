import os
import re
import json
import shutil
import tempfile
from datetime import datetime, timezone
from playwright.sync_api import sync_playwright

BASE_DIR = r"C:\Warlord_Inc\Warlord_WASP\MCNC"
DATA_DIR = os.path.join(BASE_DIR, "Data")
STATE_FILE = os.path.join(DATA_DIR, "State", "active_bounty_state.json")
RAW_FEED_FILE = os.path.join(DATA_DIR, "State", "raw_bounties_feed.json")
WINNER_FILE = os.path.join(DATA_DIR, "WarRoom_Incoming", "gate1_bounty_candidate.json")

CHROME_USER_DATA = r"C:\Warlord_Inc\Warlord_WASP\MCNC\Data\Chrome_Orion_Profile"
CHROME_PROFILE = "Default"

TARGETS = [
    {"platform": "Whop", "url": "https://whop.com/content-rewards/"},
    {"platform": "Vyro", "url": "https://app.vyro.com/campaigns"}
]

def ensure_directories():
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    os.makedirs(os.path.dirname(WINNER_FILE), exist_ok=True)

def clone_chrome_profile():
    temp_dir = tempfile.mkdtemp(prefix="warlord_chrome_")
    src_profile = os.path.join(CHROME_USER_DATA, CHROME_PROFILE)
    dst_profile = os.path.join(temp_dir, CHROME_PROFILE)
    os.makedirs(dst_profile, exist_ok=True)

    local_state_src = os.path.join(CHROME_USER_DATA, "Local State")
    if os.path.exists(local_state_src):
        shutil.copy2(local_state_src, os.path.join(temp_dir, "Local State"))

    for item in ["Network", "Local Storage", "Session Storage", "IndexedDB", "Preferences"]:
        s = os.path.join(src_profile, item)
        d = os.path.join(dst_profile, item)
        if os.path.isdir(s):
            shutil.copytree(s, d, dirs_exist_ok=True)
        elif os.path.isfile(s):
            shutil.copy2(s, d)

    return temp_dir

def parse_currency(text):
    if not text:
        return 0.0
    match = re.search(r"\$\s*([\d,]+(?:\.\d+)?)", text)
    if match:
        return float(match.group(1).replace(",", ""))
    return 0.0

def parse_rpm(text):
    if not text:
        return 0.0
    match = re.search(r"\$\s*([\d.]+)\s*(?:/|per)\s*(?:1k|1,000|k)", text, re.IGNORECASE)
    if match:
        return float(match.group(1))
    return parse_currency(text)

def scrape_bounties(temp_profile_dir):
    raw_bounties = []
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=temp_profile_dir,
            channel="chrome",
            headless=False,
            args=["--disable-blink-features=AutomationControlled", "--no-sandbox"]
        )
        page = context.new_page()

        for target in TARGETS:
            platform = target["platform"]
            url = target["url"]
            print(f"[ORION] Scanning {platform} -> {url}")
            try:
                page.goto(url, wait_until="networkidle", timeout=45000)
                page.wait_for_timeout(4000)

                cards = page.evaluate("""() => {
                    const results = [];
                    const anchors = Array.from(document.querySelectorAll('a[href]'));
                    for (const a of anchors) {
                        const text = (a.innerText || '').trim();
                        const href = a.href || '';
                        if ((text.includes('$') && (text.toLowerCase().includes('1k') || text.toLowerCase().includes('views') || text.toLowerCase().includes('budget') || text.toLowerCase().includes('pool'))) && text.length > 20) {
                            results.push({ text, href });
                        }
                    }
                    return results;
                }""")

                seen_urls = set()
                for idx, card in enumerate(cards):
                    href = card["href"]
                    if href in seen_urls:
                        continue
                    seen_urls.add(href)
                    lines = [line.strip() for line in card["text"].split("\n") if line.strip()]
                    title = lines[0] if lines else f"{platform}_Campaign_{idx+1}"
                    full_blob = " | ".join(lines)

                    rpm = parse_rpm(full_blob)
                    pool = parse_currency(full_blob)
                    if pool == rpm:
                        pool = 1000.0

                    if rpm > 0:
                        raw_bounties.append({
                            "campaign_id": f"{platform.upper()}_{abs(hash(href)) % 1000000}",
                            "platform": platform,
                            "title": title[:120],
                            "url": href,
                            "rpm_usd": rpm,
                            "remaining_pool_usd": pool,
                            "raw_summary": full_blob[:500],
                            "scraped_at": datetime.now(timezone.utc).isoformat()
                        })
            except Exception as e:
                print(f"[ORION WARN] Failed scanning {platform}: {e}")

        context.close()
    return raw_bounties

def tess_score_bounties(bounties):
    scored = []
    for b in bounties:
        if b["remaining_pool_usd"] < 250:
            continue

        fee_multiplier = 0.90 if b["platform"] == "Whop" else 1.00
        net_rpm = round(b["rpm_usd"] * fee_multiplier, 3)
        pool_stability = min(b["remaining_pool_usd"] / 2500.0, 2.0)
        telemetry_score = round((net_rpm * 10.0) * (0.6 + 0.4 * pool_stability), 2)

        b["net_rpm_usd"] = net_rpm
        b["tess_telemetry_score"] = telemetry_score
        scored.append(b)

    scored.sort(key=lambda x: x["tess_telemetry_score"], reverse=True)
    return scored

def main():
    ensure_directories()
    temp_dir = None
    try:
        os.makedirs(CHROME_USER_DATA, exist_ok=True); temp_dir = CHROME_USER_DATA
        bounties = scrape_bounties(temp_dir)
        with open(RAW_FEED_FILE, "w", encoding="utf-8") as f:
            json.dump(bounties, f, indent=2)

        ranked = tess_score_bounties(bounties)
        if not ranked:
            print("[TESS] Zero viable bounties cleared Gate 1 thresholds.")
            return

        winner = ranked[0]
        gate1_payload = {
            "coordinate": "110 (10)",
            "status": "PENDING_APPROVAL",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "winner": winner,
            "runner_ups": ranked[1:4]
        }

        with open(WINNER_FILE, "w", encoding="utf-8") as f:
            json.dump(gate1_payload, f, indent=2)

        state_payload = {
            "status": "PENDING_APPROVAL",
            "campaign_id": winner["campaign_id"],
            "platform": winner["platform"],
            "title": winner["title"],
            "url": winner["url"],
            "net_rpm_usd": winner["net_rpm_usd"],
            "remaining_pool_usd": winner["remaining_pool_usd"],
            "expires_at": None,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(state_payload, f, indent=2)

        print(f"[TESS LOCKED] Winner: {winner['title']} ({winner['platform']}) | Net RPM: ${winner['net_rpm_usd']} | Score: {winner['tess_telemetry_score']}")
    finally:
        if temp_dir and os.path.exists(temp_dir):
            pass

if __name__ == "__main__":
    main()

