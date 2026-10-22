/**
 * MX FAST OTP - 24/7 DUAL CLOUD AUTO FORWARDER ENGINE
 * Ultra-Stable Rate-Limited & Anti-Duplicate Edition
 */

const https = require('https');
const http = require('http');

// ==========================================
// ⚙️ [CONFIG & CREDENTIALS]
// ==========================================
const CONFIG = {
    TELEGRAM_BOT_TOKEN: "8858726595:AAEGt6vzteA-ALY_y4GfBWP-sz7UJ4v0K5Q",
    TELEGRAM_GROUP_ID: "-1004366096144",
    
    // Server 1: Voltex Cloud
    VOLTEX_URL: "https://api.2oo9.cloud/MXS47FLFX0U/tnevs/@public/api",
    VOLTEX_TOKEN: "MWMFJUUNQRI",

    // Server 2: STS Cloud
    STS_URL: "https://api.2oo9.cloud/MXS47FLFX0U/tness/@public/api",
    STS_TOKEN: "MSWJDU9FTB1",

    // Bot & Shop Links
    MINI_BOT_URL: "https://t.me/MXFastOTP1_Bot/panel",
    SHOP_BOT_URL: "https://t.me/mx_premium_shop_bot",
    NUMBER_BOT_URL: "https://t.me/MXNumberOTPBot",
    SELL_BOT_URL: "https://t.me/MXIncomeXBot",
    CHANNEL_URL: "https://t.me/mxearningzone",
    SUPPORT_URL: "https://t.me/MX_LEADER"
};

// Memory cache to prevent duplicate forwards
const sentOtpCache = new Set();
let isFirstRun = true; // স্টার্টআপে পুরোনো কোড গ্রুপে স্প্যাম হওয়া বন্ধ করার জন্য
let lastTrafficBroadcast = Date.now();

// Safe Symbols
const S_BOLT    = "\u26A1";
const S_PHONE   = "\uD83D\uDCF1";
const S_GLOBE   = "\uD83C\uDF0D";
const S_TAG     = "\uD83C\uDFF7\uFE0F";
const S_KEY     = "\uD83D\uDD11";
const S_GATEWAY = "\uD83C\uDF10";
const S_CLOCK   = "\u23F0";
const S_SMS     = "\uD83D\uDCE9";
const S_SHIELD  = "\uD83D\uDEE1\uFE0F";
const S_ROCKET  = "\uD83D\uDE80";
const S_CART    = "\uD83D\uDED2";
const S_MONEY   = "\uD83D\uDCB0";
const S_SPEAKER = "\uD83D\uDCE2";
const S_SUPPORT = "\uD83D\uDC68\u200D\uD83D\uDCBB";
const S_FIRE    = "\uD83D\uDD25";
const S_LINE    = "━━━━━━━━━━━━━━━━━━━━━━";

const countryPrefixes = {
    "237": "Cameroon \uD83C\uDDE8\uD83C\uDDF2",
    "261": "Madagascar \uD83C\uDDF2\uD83C\uDDEC",
    "229": "Benin \uD83C\uDDE7\uD83C\uDDEF",
    "224": "Guinea \uD83C\uDDEC\uD83C\uDDF3",
    "225": "Ivory Coast \uD83C\uDDE8\uD83C\uDDEE",
    "374": "Armenia \uD83C\uDDE6\uD83C\uDDF2",
    "32": "Belgium \uD83C\uDDE7\uD83C\uDDEA",
    "880": "Bangladesh \uD83C\uDDE7\uD83C\uDDE9",
    "91": "India \uD83C\uDDEE\uD83C\uDDF3",
    "92": "Pakistan \uD83C\uDDF5\uD83C\uDDF0",
    "380": "Ukraine \uD83C\uDDFA\uD83C\uDDE6",
    "20": "Egypt \uD83C\uDDEA\uD83C\uDDEC",
    "234": "Nigeria \uD83C\uDDF3\uD83C\uDDEC",
    "233": "Ghana \uD83C\uDDEC\uD83C\uDDED",
    "228": "Togo \uD83C\uDDF9\uD83C\uDDEC",
    "226": "Burkina Faso \uD83C\uDDE7\uD83C\uDDEB",
    "223": "Mali \uD83C\uDDF2\uD83C\uDDF1",
    "221": "Senegal \uD83C\uDDF8\uD83C\uDDF3",
    "212": "Morocco \uD83C\uDDF2\uD83C\uDDE6",
    "213": "Algeria \uD83C\uDDE9\uD83C\uDDFF",
    "1": "USA / Canada \uD83C\uDDFA\uD83C\uDDF8",
    "7": "Russia \uD83C\uDDF7\uD83C\uDDFA",
    "44": "United Kingdom \uD83C\uDDEC\uD83C\uDDE7"
};

const sortedPrefixes = Object.keys(countryPrefixes).sort((a, b) => b.length - a.length);

function getCountry(num) {
    if (!num) return `Global Route ${S_GLOBE}`;
    const clean = String(num).replace(/\D/g, '');
    for (let p of sortedPrefixes) {
        if (clean.startsWith(p)) return countryPrefixes[p];
    }
    return `Global Route ${S_GLOBE}`;
}

function maskPhone(num) {
    if (!num) return "Unknown";
    let str = String(num).trim();
    let digits = str.replace(/\D/g, '');
    let hasPlus = str.startsWith('+');
    if (digits.length <= 6) return str;
    let prefix = digits.slice(0, 5);
    let suffix = digits.slice(-3);
    return (hasPlus ? '+' : '') + `${prefix}***MX***${suffix}`;
}

function extractOTP(sms) {
    if (!sms) return null;
    let m = sms.match(/\b\d{4,8}\b/);
    if (m) return m[0];
    let sm = sms.match(/\b\d{3}[\s-]\d{3}\b/);
    if (sm) return sm[0].replace(/[\s-]/g, "");
    return null;
}

function getAppDetails(sms) {
    const s = String(sms).toLowerCase();
    if (s.includes('facebook') || s.includes('fb')) return 'FACEBOOK';
    if (s.includes('instagram') || s.includes('ig') || s.includes('insta')) return 'INSTAGRAM';
    if (s.includes('whatsapp') || s.includes('wa')) return 'WHATSAPP';
    if (s.includes('telegram') || s.includes('tg')) return 'TELEGRAM';
    return 'SERVICE OTP';
}

function escapeHTML(str) {
    return String(str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ==========================================
// 🚀 টেলিগ্রাম মেসেজ ডেলিভারি (Instant Cache Lock)
// ==========================================
async function sendToTelegram(item, otp, gateway) {
    const cleanNum = (item.number || "unknown").replace(/\D/g, "");
    const uniqueKey = `${cleanNum}_${otp}`;

    // ডুপ্লিকেট রোধ: সাথে সাথে ক্যাশে ঢুকিয়ে দেওয়া যাতে ২য় বার কল না হয়
    if (sentOtpCache.has(uniqueKey)) return;
    sentOtpCache.add(uniqueKey);

    // স্টার্টআপের সময় পুরোনো কোড টেলিগ্রামে যাবে না
    if (isFirstRun) return;

    const country = getCountry(item.number);
    const maskedPhone = maskPhone(item.number);
    const appName = getAppDetails(item.message);
    const timeStr = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const htmlMsg = 
`${S_BOLT} <b>MX FAST OTP - NEW OTP RECEIVED</b> ${S_BOLT}
${S_LINE}
${S_PHONE} <b>Phone:</b> <code>${maskedPhone}</code>
${S_GLOBE} <b>Country:</b> <b>${country}</b>
${S_TAG} <b>Service:</b> <b>${appName}</b>
${S_KEY} <b>OTP Code:</b> <code>${otp}</code>
${S_GATEWAY} <b>Gateway:</b> <b>${gateway}</b>
${S_CLOCK} <b>Time:</b> ${timeStr}

${S_SMS} <b>SMS Content:</b>
<i>${escapeHTML(item.message || "N/A")}</i>
${S_LINE}
<i>${S_SHIELD} 24/7 Verified Cloud Engine</i>`;

    const inlineKeyboard = [
        [
            { text: `${S_ROCKET} Open Mini Bot`, url: CONFIG.MINI_BOT_URL },
            { text: `${S_CART} Proxy & Mail Shop`, url: CONFIG.SHOP_BOT_URL }
        ],
        [
            { text: `${S_PHONE} Number Bot`, url: CONFIG.NUMBER_BOT_URL },
            { text: `${S_MONEY} Account Sell Bot`, url: CONFIG.SELL_BOT_URL }
        ],
        [
            { text: `${S_SPEAKER} Official Channel`, url: CONFIG.CHANNEL_URL },
            { text: `${S_SUPPORT} Support Leader`, url: CONFIG.SUPPORT_URL }
        ]
    ];

    try {
        await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CONFIG.TELEGRAM_GROUP_ID,
                text: htmlMsg,
                parse_mode: "HTML",
                reply_markup: { inline_keyboard: inlineKeyboard }
            })
        });
        console.log(`[+] Sent to Telegram: ${maskedPhone} -> ${otp}`);
    } catch (e) {
        console.error("[-] Telegram Send Error:", e.message);
    }
}

// ==========================================
// 🔄 ১ ঘণ্টার অটোমেটিক ট্র্যাফিক নোটিশ ব্রডকাস্ট
// ==========================================
async function broadcastHourlyTraffic(topRanges) {
    let rankList = "";
    const medals = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49", "\u2B50", "\u2B50"];
    topRanges.slice(0, 5).forEach(([country, hits], i) => {
        rankList += `${medals[i]} <b>${i + 1}. ${country}</b> — <code>${hits} Hits</code> (${S_FIRE} হাই ট্র্যাফিক)\n`;
    });

    if (!rankList) rankList = `• Cameroon ও Guinea-তে ${S_FIRE} হাই ট্র্যাফিক চলছে!`;

    const msg = 
`${S_FIRE} <b>MX FAST OTP - ১ ঘণ্টার হাই ট্র্যাফিক এলার্ট!</b> ${S_FIRE}
${S_LINE}
📊 <b>গত ১ ঘণ্টায় সবচেয়ে বেশি হিট চলা কান্ট্রি:</b>

${rankList}
${S_ROCKET} <b>পরামর্শ:</b> উপরের দেশগুলোতে এখন উরাধুরা ওটিপি ও কোড আসতেছে! দ্রুত প্যানেল বা বট থেকে নাম্বার নিয়ে কাজ করে নিন!
${S_LINE}
<i>${S_SHIELD} MX Fast OTP Automated 24/7 Cloud System</i>`;

    const keyboard = [
        [
            { text: `${S_BOLT} ওপেন মিনি বট প্যানেল`, url: CONFIG.MINI_BOT_URL },
            { text: `${S_PHONE} টেলিগ্রাম নাম্বার বট`, url: CONFIG.NUMBER_BOT_URL }
        ],
        [
            { text: `${S_CART} প্রক্সি ও মেইল শপ`, url: CONFIG.SHOP_BOT_URL },
            { text: `${S_MONEY} সোশ্যাল একাউন্ট সেল`, url: CONFIG.SELL_BOT_URL }
        ]
    ];

    try {
        await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CONFIG.TELEGRAM_GROUP_ID,
                text: msg,
                parse_mode: "HTML",
                reply_markup: { inline_keyboard: keyboard }
            })
        });
        console.log("[+] Hourly Traffic Alert Sent to Group!");
    } catch (e) {}
}

// ==========================================
// ⚡ MAIN CLOUD WORKER (VOLTEX + STS)
// ==========================================
async function checkServer(baseUrl, token, gatewayName) {
    try {
        const res = await fetch(`${baseUrl}/success-otp?t=${Date.now()}`, {
            headers: { 'mauthapi': token }
        });
        if (res.ok) {
            const json = await res.json();
            let otps = [];
            if (json.data && Array.isArray(json.data.otps)) otps = json.data.otps;
            else if (json.data && Array.isArray(json.data)) otps = json.data;
            else if (Array.isArray(json.otps)) otps = json.otps;

            for (let item of otps) {
                const otp = extractOTP(item.message);
                if (otp) {
                    await sendToTelegram(item, otp, gatewayName);
                }
            }
        }
    } catch (e) {}

    try {
        const cRes = await fetch(`${baseUrl}/console?t=${Date.now()}`, {
            headers: { 'mauthapi': token }
        });
        if (cRes.ok) {
            const cJson = await cRes.json();
            let hits = [];
            if (cJson.data && Array.isArray(cJson.data.hits)) hits = cJson.data.hits;
            else if (cJson.data && Array.isArray(cJson.data)) hits = cJson.data;

            for (let hit of hits) {
                if (hit.number && hit.message) {
                    const otp = extractOTP(hit.message);
                    if (otp) {
                        await sendToTelegram(hit, otp, gatewayName);
                    }
                }
            }
        }
    } catch (e) {}
}

async function updateTrafficStats() {
    let countryHits = {};
    for (let server of [{ url: CONFIG.VOLTEX_URL, token: CONFIG.VOLTEX_TOKEN }, { url: CONFIG.STS_URL, token: CONFIG.STS_TOKEN }]) {
        try {
            const res = await fetch(`${server.url}/console`, { headers: { 'mauthapi': server.token } });
            if (res.ok) {
                const json = await res.json();
                const hits = json.data?.hits || [];
                for (let h of hits) {
                    const country = getCountry(h.range || h.number);
                    countryHits[country] = (countryHits[country] || 0) + 1;
                }
            }
        } catch (e) {}
    }

    const sorted = Object.entries(countryHits).sort((a, b) => b[1] - a[1]);
    const now = Date.now();
    if (now - lastTrafficBroadcast >= 3600000) {
        lastTrafficBroadcast = now;
        await broadcastHourlyTraffic(sorted);
    }
}

console.log("🚀 MX FAST OTP 24/7 Cloud Server Started Successfully!");

// প্রথমবার সার্ভার চালু হলে পুরোনো কোডগুলো ক্যাশে ঢুকিয়ে নেবে (যাতে ডাবল স্প্যাম না হয়)
async function startEngine() {
    await checkServer(CONFIG.VOLTEX_URL, CONFIG.VOLTEX_TOKEN, `${S_BOLT} VOLTEX`);
    await checkServer(CONFIG.STS_URL, CONFIG.STS_TOKEN, `${S_FIRE} STS`);
    isFirstRun = false; // এরপর থেকে আসা সব কোড গ্রুপে যাবে

    // প্রতি ৩ সেকেন্ড পর পর চেক হবে
    setInterval(async () => {
        await checkServer(CONFIG.VOLTEX_URL, CONFIG.VOLTEX_TOKEN, `${S_BOLT} VOLTEX`);
        await checkServer(CONFIG.STS_URL, CONFIG.STS_TOKEN, `${S_FIRE} STS`);
    }, 3000);

    // প্রতি ১ মিনিটে ট্র্যাফিক নোটিশ কাউন্ট চেক
    setInterval(async () => {
        await updateTrafficStats();
    }, 60000);
}

startEngine();

// ক্লাউড পোর্ট লিসেনার
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('MX Fast OTP 24/7 Cloud Engine Active!');
}).listen(process.env.PORT || 10000);
