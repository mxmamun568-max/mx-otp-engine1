/**
 * MX FAST OTP - 24/7 DUAL CLOUD AUTO FORWARDER & BOT ENGINE
 * Features:
 * 1. 24/7 Non-stop Live OTP Stream to Group (Voltex + STS)
 * 2. Instant /start response with WebApp & Service Buttons
 * 3. Auto-save all bot users
 * 4. Hourly High-Traffic Broadcast to Group AND All Bot Users
 */

const http = require('http');
const fs = require('fs');

// ==========================================
// 🚀 ১. RENDER PORT BINDING (Instant Live)
// ==========================================
const PORT = process.env.PORT || 10000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('MX Fast OTP 24/7 Cloud Engine & Bot Active!');
});

server.listen(PORT, () => {
    console.log(`[+] Web server bound to port ${PORT}. Render status: Live.`);
});

// ==========================================
// ⚙️ ২. CONFIG & CREDENTIALS
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

    // Links
    MINI_BOT_URL: "https://t.me/MXFastOTP1_Bot/panel",
    SHOP_BOT_URL: "https://t.me/mx_premium_shop_bot",
    NUMBER_BOT_URL: "https://t.me/MXNumberOTPBot",
    SELL_BOT_URL: "https://t.me/MXIncomeXBot",
    CHANNEL_URL: "https://t.me/mxearningzone",
    SUPPORT_URL: "https://t.me/MX_LEADER"
};

// ==========================================
// 💾 ৩. SUBSCRIBERS & CACHE PERSISTENCE
// ==========================================
const SUBSCRIBERS_FILE = './subscribers.json';
let botSubscribers = new Set();

try {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
        const saved = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, 'utf8'));
        if (Array.isArray(saved)) botSubscribers = new Set(saved);
    }
} catch (e) {}

function saveSubscribers() {
    try {
        fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify([...botSubscribers]));
    } catch (e) {}
}

const sentOtpCache = new Set();
let lastTrafficBroadcast = Date.now();
const telegramQueue = [];
let isQueueRunning = false;
let lastUpdateId = 0;

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
const S_STAR    = "\u2B50";
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
// 🤖 ৪. TELEGRAM BOT /start COMMAND HANDLER
// ==========================================
async function handleBotCommands() {
    try {
        const res = await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=20`);
        if (!res.ok) return;
        const data = await res.json();
        if (!data.ok || !Array.isArray(data.result)) return;

        for (const update of data.result) {
            lastUpdateId = update.update_id;
            const msg = update.message;
            if (!msg || !msg.text) continue;

            const chatId = msg.chat.id;
            const text = msg.text.trim();
            const userName = msg.from?.first_name || "User";

            // /start কমান্ড রিসিভ
            if (text.startsWith('/start')) {
                // ইউজার আইডি সেভ রাখা
                if (!botSubscribers.has(chatId)) {
                    botSubscribers.add(chatId);
                    saveSubscribers();
                    console.log(`[+] New user registered to bot: ${chatId} (${userName})`);
                }

                const welcomeMsg = 
`${S_BOLT} <b>স্বাগতম ${escapeHTML(userName)} — MX FAST OTP প্যানেলে!</b> ${S_BOLT}
${S_LINE}
${S_SHIELD} <b>এটি দেশের সবচেয়ে দ্রুততম এবং হাই-হিটস ওটিপি সার্ভিস।</b>

${S_FIRE} <b>আমাদের বিশেষ সুবিধাসমূহ:</b>
• Voltex ও STS ডুয়াল ক্লাউড গেটওয়ে
• প্রতি ২ সেকেন্ডে লাইভ ওটিপি রিসিভ
• ফেসবুক ও ইনস্টাগ্রাম আনলিমিটেড ক্রিয়েশন
• ১-ক্লিকে ইনস্ট্যান্ট নাম্বার চেঞ্জ
• প্রতি ঘণ্টায় লাইভ হাই-ট্র্যাফিক আপডেট

${S_ROCKET} <b>নিচের "⚡ ওপেন ওয়েব প্যানেল" বাটনে চাপ দিয়ে সরাসরি নাম্বার নিয়ে কাজ শুরু করুন!</b>
${S_LINE}`;

                const keyboard = [
                    [
                        { text: `${S_BOLT} ওপেন ওয়েব প্যানেল`, url: CONFIG.MINI_BOT_URL },
                        { text: `${S_CART} প্রক্সি ও মেইল শপ`, url: CONFIG.SHOP_BOT_URL }
                    ],
                    [
                        { text: `${S_PHONE} নাম্বার বট`, url: CONFIG.NUMBER_BOT_URL },
                        { text: `${S_MONEY} সোশ্যাল একাউন্ট সেল`, url: CONFIG.SELL_BOT_URL }
                    ],
                    [
                        { text: `${S_SPEAKER} অফিশিয়াল চ্যানেল`, url: CONFIG.CHANNEL_URL },
                        { text: `${S_SUPPORT} এডমিন সাপোর্ট`, url: CONFIG.SUPPORT_URL }
                    ]
                ];

                await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: welcomeMsg,
                        parse_mode: "HTML",
                        reply_markup: { inline_keyboard: keyboard }
                    })
                });
            }
        }
    } catch (e) {}
}

// ==========================================
// 🚦 ৫. স্মার্ট কিউ সিস্টেম (ওটিপি ডেলিভারি)
// ==========================================
function queueOtpForTelegram(item, otp, gateway) {
    const cleanNum = String(item.number || item.phone || item.range || "unknown").replace(/\D/g, "");
    const cleanOtp = String(otp || "").trim();
    const uniqueKey = `${cleanNum}_${cleanOtp}`;

    if (sentOtpCache.has(uniqueKey)) return;
    sentOtpCache.add(uniqueKey);

    if (sentOtpCache.size > 3000) {
        const oldestKey = sentOtpCache.values().next().value;
        sentOtpCache.delete(oldestKey);
    }

    telegramQueue.push({ item, otp, gateway });
    processQueue();
}

async function processQueue() {
    if (isQueueRunning) return;
    isQueueRunning = true;

    while (telegramQueue.length > 0) {
        const task = telegramQueue.shift();
        try {
            await executeTelegramSend(task);
        } catch (e) {}
        // প্রতি ওটিপির মাঝে ২.২ সেকেন্ড বিরতি
        await new Promise(r => setTimeout(r, 2200));
    }

    isQueueRunning = false;
}

async function executeTelegramSend({ item, otp, gateway }) {
    const phoneVal = item.number || item.phone || item.range || "Unknown";
    const country = getCountry(phoneVal);
    const maskedPhone = maskPhone(phoneVal);
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
        let res = await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CONFIG.TELEGRAM_GROUP_ID,
                text: htmlMsg,
                parse_mode: "HTML",
                reply_markup: { inline_keyboard: inlineKeyboard }
            })
        });

        let data = await res.json();
        if (data.ok) {
            console.log(`[+] Sent 1 clean OTP to Telegram: ${maskedPhone} -> ${otp} (${gateway})`);
        } else if (res.status === 429) {
            const retryAfter = (data.parameters?.retry_after || 5) * 1000;
            await new Promise(r => setTimeout(r, retryAfter));
        }
    } catch (e) {}
}

// ==========================================
// 🔄 ৬. ১ ঘণ্টার ট্র্যাফিক ব্রডকাস্ট (গ্রুপ + বটের সকল ইউজার)
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
            { text: `${S_BOLT} ওপেন ওয়েব প্যানেল`, url: CONFIG.MINI_BOT_URL },
            { text: `${S_PHONE} টেলিগ্রাম নাম্বার বট`, url: CONFIG.NUMBER_BOT_URL }
        ],
        [
            { text: `${S_CART} প্রক্সি ও মেইল শপ`, url: CONFIG.SHOP_BOT_URL },
            { text: `${S_MONEY} সোশ্যাল একাউন্ট সেল`, url: CONFIG.SELL_BOT_URL }
        ]
    ];

    // ১. গ্রুপে পাঠানো
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

    // ২. বটের সকল রেজিস্টার্ড ইউজারের ইনবক্সে পাঠানো
    for (const userId of botSubscribers) {
        try {
            await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: userId,
                    text: msg,
                    parse_mode: "HTML",
                    reply_markup: { inline_keyboard: keyboard }
                })
            });
            await new Promise(r => setTimeout(r, 100)); // ছোট বিরতি যাতে স্প্যাম না হয়
        } catch (e) {}
    }
}

// ==========================================
// ⚡ ৭. কনসোল + ওটিপি লাইভ স্ক্যানার
// ==========================================
async function checkServer(baseUrl, token, gatewayName) {
    try {
        const cRes = await fetch(`${baseUrl}/console?t=${Date.now()}`, {
            headers: { 'mauthapi': token },
            cache: 'no-store'
        });
        if (cRes.ok) {
            const cJson = await cRes.json();
            let hits = [];
            if (cJson.data && Array.isArray(cJson.data.hits)) hits = cJson.data.hits;
            else if (cJson.data && Array.isArray(cJson.data)) hits = cJson.data;
            else if (Array.isArray(cJson.hits)) hits = cJson.hits;

            for (let hit of hits) {
                const otp = extractOTP(hit.message);
                if (otp) {
                    queueOtpForTelegram(hit, otp, gatewayName);
                }
            }
        }
    } catch (e) {}

    try {
        const res = await fetch(`${baseUrl}/success-otp?t=${Date.now()}`, {
            headers: { 'mauthapi': token },
            cache: 'no-store'
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
                    queueOtpForTelegram(item, otp, gatewayName);
                }
            }
        }
    } catch (e) {}
}

async function updateTrafficStats() {
    let countryHits = {};
    for (let server of [{ url: CONFIG.VOLTEX_URL, token: CONFIG.VOLTEX_TOKEN }, { url: CONFIG.STS_URL, token: CONFIG.STS_TOKEN }]) {
        try {
            const res = await fetch(`${server.url}/console?t=${Date.now()}`, { headers: { 'mauthapi': server.token } });
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

// ==========================================
// 🚀 ৮. ইঞ্জিন শুরু
// ==========================================
async function startAll() {
    // আগের পুরোনো কোনো ওয়েবহুক থাকলে ডিলিট করে নেওয়া
    try {
        await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/deleteWebhook`);
    } catch (e) {}

    console.log("🚀 MX FAST OTP 24/7 Engine & Bot Live!");

    // প্রতি ২.৫ সেকেন্ডে ওটিপি স্ক্যান
    setInterval(async () => {
        await checkServer(CONFIG.VOLTEX_URL, CONFIG.VOLTEX_TOKEN, `${S_BOLT} VOLTEX`);
        await checkServer(CONFIG.STS_URL, CONFIG.STS_TOKEN, `${S_FIRE} STS`);
    }, 2500);

    // প্রতি ১ মিনিটে ১ ঘণ্টার ট্র্যাফিক চেক
    setInterval(async () => {
        await updateTrafficStats();
    }, 60000);

    // বটের মেসেজ/কমান্ড লিসেনার লুপ (২৪ ঘণ্টা চলবে)
    while (true) {
        await handleBotCommands();
        await new Promise(r => setTimeout(r, 1000));
    }
}

startAll();
