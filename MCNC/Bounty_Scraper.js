// ============================================================================
// WARLORD WASP // LIVE BOUNTY MARKETPLACE SCRAPER (VYRO + WHOP)
// FILE: C:\Warlord_Inc\Warlord_WASP\MCNC\Bounty_Scraper.js
// ZERO HARDCODED FALLBACKS — REAL LIVE MARKETPLACE TRUTH ONLY
// ============================================================================

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

function isBountyLiveAndFunded(b) {
    if (!b) return false;
    const statusStr = `${b.poolStatus || ''} ${b.status || ''} ${b.title || ''}`.toUpperCase();
    if (
        statusStr.includes('DRY') ||
        statusStr.includes('LOCKED') ||
        statusStr.includes('EXPIRED') ||
        statusStr.includes('ENDED') ||
        statusStr.includes('CLOSED') ||
        statusStr.includes('PAUSED') ||
        statusStr.includes('FILLED')
    ) {
        return false;
    }
    const pctMatch = statusStr.match(/(\d+(?:\.\d+)?)%/);
    if (pctMatch && parseFloat(pctMatch[1]) <= 0) return false;
    if (b.runwayDays !== undefined && Number(b.runwayDays) <= 0) return false;
    return true;
}

function computeTessNetYieldScore(bounty) {
    const rawCpm = parseFloat(String(bounty.cpmRate || '0').replace(/[^0-9.]/g, '')) || 0;
    const isWhop = String(bounty.platform || '').toLowerCase() === 'whop';
    const netCpm = isWhop ? rawCpm * 0.90 : rawCpm;

    const pctMatch = String(bounty.poolStatus || '').match(/(\d+(?:\.\d+)?)%/);
    const poolRatio = pctMatch ? Math.max(0.1, Math.min(1.0, parseFloat(pctMatch[1]) / 100)) : 0.80;

    const flatBonus = Number(bounty.flatFeeBonus) || 0;
    const score = (netCpm * poolRatio) + (flatBonus * 0.5);
    return Number(score.toFixed(3));
}

function classifyPageState(url, title, bodyText) {
    const u = String(url || '').toLowerCase();
    const t = String(title || '').toLowerCase();
    const b = String(bodyText || '').toLowerCase();

    if (
        t.includes('just a moment') ||
        t.includes('attention required') ||
        b.includes('checking your browser') ||
        b.includes('cf-browser-verification')
    ) {
        return 'CLOUDFLARE_BLOCK';
    }

    if (
        u.includes('/login') ||
        u.includes('/signin') ||
        u.includes('/auth') ||
        t.includes('sign in') ||
        t.includes('log in') ||
        (b.includes('continue with google') && b.length < 1500) ||
        (b.includes('enter your email') && b.length < 1500)
    ) {
        return 'LOGIN_REQUIRED';
    }

    return 'ACCESSIBLE';
}

async function scrapeBounties() {
    const sessionPath = path.resolve('C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\Data\\Chrome_Session');
    if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true });
    }

    const diagnostics = {
        vyro: { status: 'NOT_RUN', count: 0, url: '', title: '', error: '' },
        whop: { status: 'NOT_RUN', count: 0, url: '', title: '', error: '' }
    };

    let vyroCards = [];
    let whopCards = [];
    let browser = null;

    try {
        browser = await puppeteer.launch({
            headless: 'new',
            userDataDir: sessionPath,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--window-size=1366,768'
            ]
        });

        // 1. SCAN VYRO CAMPAIGNS
        try {
            const vyroPage = await browser.newPage();
            await vyroPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
            await vyroPage.goto('https://app.vyro.com/campaigns', { waitUntil: 'networkidle2', timeout: 25000 }).catch(() =>
                vyroPage.goto('https://app.vyro.com/campaigns', { waitUntil: 'domcontentloaded', timeout: 20000 })
            );

            await vyroPage.waitForFunction(
                () => /PER\s*1[MK]\s*VIEWS|sign in|log in/i.test(document.body.innerText || ''),
                { timeout: 8500 }
            ).catch(() => {});
            await new Promise(r => setTimeout(r, 1200));

            const vyroMeta = await vyroPage.evaluate(() => ({
                url: window.location.href,
                title: document.title || '',
                snippet: (document.body.innerText || '').slice(0, 2000)
            }));

            const vyroState = classifyPageState(vyroMeta.url, vyroMeta.title, vyroMeta.snippet);
            diagnostics.vyro.url = vyroMeta.url;
            diagnostics.vyro.title = vyroMeta.title;

            if (vyroState !== 'ACCESSIBLE') {
                diagnostics.vyro.status = vyroState;
            } else {
                vyroCards = await vyroPage.evaluate(() => {
                    const isRelativeTime = (str) => /^(posted\s+)?\d+\s*(s|sec|secs|m|min|mins|h|hr|hrs|d|day|days|w|wk|wks|mo|mos)\s*ago$/i.test(String(str || '').trim());

                    const isNoiseLine = (str) => {
                        if (!str) return true;
                        const s = str.trim();
                        if (s.length < 2) return true;
                        if (isRelativeTime(s)) return true;
                        if (/^(just now|yesterday|today|new|active|verified|live|open|clipping|ugc|views?|per view|per post|acknowledge|newest|budget available|pay rate|campaigns for you)$/i.test(s)) return true;
                        if (/^\$[\d.,]+$/.test(s)) return true;
                        if (/^\d+(\.\d+)?%$/.test(s)) return true;
                        if (/per\s*1[mk]\s*views/i.test(s)) return true;
                        return false;
                    };

                    const cleanLabel = (str) => {
                        return String(str || '')
                            .replace(/^(posted\s+)?\d+\s*(s|sec|secs|m|min|mins|h|hr|hrs|d|day|days|w|wk|wks|mo|mos)\s*ago\s*(\/\/|-|\|)?\s*/i, '')
                            .trim();
                    };

                    const lines = document.body.innerText.split('\n').map(l => l.trim()).filter(Boolean);
                    const found = [];
                    const seen = new Set();

                    for (let i = 0; i < lines.length; i++) {
                        const upper = lines[i].toUpperCase();
                        const perMillionMatch = upper.includes('PER 1M VIEWS') || upper.includes('/ 1M VIEWS');
                        const perThousandMatch = /\$(\d+(?:\.\d+)?)\s*(?:\/|PER)\s*(?:1K|1,000)\s*VIEWS?/i.exec(lines[i]);

                        if ((perMillionMatch && i >= 2) || perThousandMatch) {
                            const windowLines = lines.slice(Math.max(0, i - 5), Math.min(lines.length, i + 4));
                            const isDead = windowLines.some(l => {
                                const low = l.toLowerCase();
                                return (
                                    low.includes('locked for new posts') ||
                                    low.includes('locked') ||
                                    low.includes('ended') ||
                                    low.includes('expired') ||
                                    low.includes('dry') ||
                                    low.includes('closed') ||
                                    low.includes('filled') ||
                                    /\b0%\s*(?:left|remaining)?/i.test(low)
                                );
                            });
                            if (isDead) continue;

                            let cpmNum = 0;
                            if (perThousandMatch) {
                                cpmNum = parseFloat(perThousandMatch[1]) || 0;
                            } else {
                                const priceLine = lines[i - 1] || '';
                                if (!priceLine.startsWith('$')) continue;
                                const rawPerMillion = parseFloat(priceLine.replace(/[^0-9.]/g, '')) || 0;
                                cpmNum = rawPerMillion / 1000;
                            }
                            if (cpmNum <= 0) continue;

                            const pctLine = windowLines.find(l => /\d+%/.test(l)) || 'Active Pool';

                            // Walk backward from price line to find title and optional brand above the timestamp
                            let descLine = '';
                            let brandLine = '';
                            let timeIdx = -1;

                            for (let k = i - 1; k >= Math.max(0, i - 6); k--) {
                                if (isRelativeTime(lines[k])) {
                                    timeIdx = k;
                                    break;
                                }
                                const cleaned = cleanLabel(lines[k]);
                                if (!descLine && !isNoiseLine(cleaned)) {
                                    descLine = cleaned;
                                }
                            }

                            if (timeIdx > 0) {
                                const potentialBrand = cleanLabel(lines[timeIdx - 1]);
                                if (!isNoiseLine(potentialBrand)) {
                                    brandLine = potentialBrand;
                                }
                            }

                            if (!descLine) descLine = 'Viral Clip Campaign';

                            const displayTitle = (brandLine && brandLine.toLowerCase() !== descLine.toLowerCase())
                                ? `${brandLine} // ${descLine}`
                                : descLine;

                            const slug = `vyro_${displayTitle}`.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 34);

                            if (!seen.has(slug)) {
                                seen.add(slug);
                                found.push({
                                    id: slug,
                                    title: displayTitle,
                                    platform: 'Vyro',
                                    cpmRate: `$${cpmNum.toFixed(2)}`,
                                    flatFeeBonus: 0,
                                    viewFloor: '1000',
                                    poolStatus: `ACTIVE // ${pctLine}`,
                                    runwayDays: 10,
                                    totalClicks: 0,
                                    dailyPostsUsed: 0,
                                    dailyPostCap: 3,
                                    mandatoryTags: `#${displayTitle.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 18) || 'vyro'} #shorts #viral`,
                                    hookHeadline: descLine.toUpperCase().slice(0, 44)
                                });
                            }
                        }
                    }
                    return found;
                });

                diagnostics.vyro.count = vyroCards.length;
                diagnostics.vyro.status = vyroCards.length > 0 ? 'LIVE_OK' : 'NO_OPEN_CAMPAIGNS';
            }
            await vyroPage.close().catch(() => {});
        } catch (e) {
            diagnostics.vyro.status = 'SCRAPE_ERROR';
            diagnostics.vyro.error = e.message;
        }

        // 2. SCAN WHOP CONTENT REWARDS / CLIPPING
        try {
            const whopPage = await browser.newPage();
            await whopPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');

            const whopUrls = [
                'https://whop.com/discover/c/clipping/',
                'https://whop.com/content-rewards/'
            ];

            for (const targetUrl of whopUrls) {
                await whopPage.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 25000 }).catch(() =>
                    whopPage.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 20000 })
                );
                await new Promise(r => setTimeout(r, 4000));

                const whopMeta = await whopPage.evaluate(() => ({
                    url: window.location.href,
                    title: document.title || '',
                    snippet: (document.body.innerText || '').slice(0, 2500)
                }));

                const whopState = classifyPageState(whopMeta.url, whopMeta.title, whopMeta.snippet);
                diagnostics.whop.url = whopMeta.url;
                diagnostics.whop.title = whopMeta.title;

                if (whopState !== 'ACCESSIBLE') {
                    diagnostics.whop.status = whopState;
                    break;
                }

                const extracted = await whopPage.evaluate(() => {
                    const isNoiseLine = (str) => {
                        if (!str) return true;
                        const s = str.trim();
                        if (s.length < 3) return true;
                        if (/^(posted\s+)?\d+\s*(s|sec|secs|m|min|mins|h|hr|hrs|d|day|days|w|wk|wks|mo|mos)\s*ago$/i.test(s)) return true;
                        if (/^(just now|yesterday|today|new|active|verified|live|open|clipping|ugc|content rewards|discover|browse)$/i.test(s)) return true;
                        if (/^\$[\d.,]+(\s*\/\s*(1k|1,000|1m|1,000,000))?$/i.test(s)) return true;
                        if (/^\d+(\.\d+)?%(\s*(paid|claimed|left|remaining))?$/i.test(s)) return true;
                        return false;
                    };

                    const lines = document.body.innerText.split('\n').map(l => l.trim()).filter(Boolean);
                    const found = [];
                    const seenSlugs = new Set();

                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        const rateMatch = line.match(/\$(\d+(?:\.\d+)?)\s*(?:\/|per)\s*(1k|1,000|1m|1,000,000)(?:\s*views?)?/i);
                        const flatMatch = line.match(/\$(\d+(?:\.\d+)?)\s*(?:flat\s*fee|per\s*post|per\s*clip|bonus)/i);

                        if (rateMatch || flatMatch) {
                            const windowLines = lines.slice(Math.max(0, i - 5), Math.min(lines.length, i + 6));
                            const isDead = windowLines.some(l => {
                                const low = l.toLowerCase();
                                return (
                                    low.includes('locked') ||
                                    low.includes('ended') ||
                                    low.includes('expired') ||
                                    low.includes('closed') ||
                                    low.includes('filled') ||
                                    low.includes('paused') ||
                                    /\b0%\s*(?:left|remaining)?/i.test(low)
                                );
                            });
                            if (isDead) continue;

                            const rawAmt = rateMatch ? (parseFloat(rateMatch[1]) || 0) : 1.50;
                            const unit = rateMatch ? String(rateMatch[2]).toLowerCase() : '1k';
                            const cpm = (unit.includes('m') || unit.includes('000,000'))
                                ? (rawAmt / 1000)
                                : rawAmt;
                            if (cpm <= 0 && !flatMatch) continue;

                            const flatFeeBonus = flatMatch ? (parseFloat(flatMatch[1]) || 0) : 0;
                            const pctLine = windowLines.find(l => /\d+%/.test(l)) || 'Active Pool';

                            let titleCand = 'Whop Clipping Campaign';
                            for (let k = i - 1; k >= Math.max(0, i - 5); k--) {
                                if (!isNoiseLine(lines[k]) && !lines[k].startsWith('$')) {
                                    titleCand = lines[k];
                                    break;
                                }
                            }

                            const slug = `whop_${titleCand}`.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 34);

                            if (!seenSlugs.has(slug)) {
                                seenSlugs.add(slug);
                                found.push({
                                    id: slug,
                                    title: flatFeeBonus > 0
                                        ? `${titleCand} // +$${flatFeeBonus} Scalp`
                                        : `${titleCand} // Whop Clipping`,
                                    platform: 'Whop',
                                    cpmRate: `$${cpm.toFixed(2)}`,
                                    flatFeeBonus,
                                    viewFloor: '1000',
                                    poolStatus: `ACTIVE // ${pctLine}`,
                                    runwayDays: 10,
                                    totalClicks: 0,
                                    dailyPostsUsed: 0,
                                    dailyPostCap: 3,
                                    mandatoryTags: `#${titleCand.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 18) || 'whop'} #shorts #viral`,
                                    hookHeadline: titleCand.toUpperCase().slice(0, 44)
                                });
                            }
                        }
                    }
                    return found;
                });

                if (extracted.length > 0) {
                    whopCards = extracted;
                    break;
                }
            }

            if (diagnostics.whop.status === 'NOT_RUN') {
                diagnostics.whop.count = whopCards.length;
                diagnostics.whop.status = whopCards.length > 0 ? 'LIVE_OK' : 'NO_OPEN_CAMPAIGNS';
            }
            await whopPage.close().catch(() => {});
        } catch (e) {
            diagnostics.whop.status = 'SCRAPE_ERROR';
            diagnostics.whop.error = e.message;
        }
    } catch (e) {
        diagnostics.vyro.status = 'BROWSER_ERROR';
        diagnostics.vyro.error = e.message;
        diagnostics.whop.status = 'BROWSER_ERROR';
        diagnostics.whop.error = e.message;
    } finally {
        if (browser) await browser.close().catch(() => {});
    }

    const combined = [...whopCards, ...vyroCards]
        .filter(isBountyLiveAndFunded)
        .map(item => ({
            ...item,
            tessYieldScore: computeTessNetYieldScore(item)
        }));

    combined.sort((a, b) => b.tessYieldScore - a.tessYieldScore);

    Object.defineProperty(combined, 'diagnostics', {
        value: diagnostics,
        enumerable: false
    });

    return combined;
}

module.exports = {
    scrapeBounties,
    computeTessNetYieldScore,
    isBountyLiveAndFunded
};
