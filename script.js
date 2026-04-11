// ==============================
// FakeShield AI Engine (Balanced)
// Author: Рейімбаев Әділет
// ==============================

// ---------- STORAGE ----------
function getAIData() {
    const raw = localStorage.getItem("fake_ai_db");
    if (!raw) {
        return { fake: [], real: [], neutral: [] };
    }
    try {
        const parsed = JSON.parse(raw);
        return {
            fake: parsed.fake || [],
            real: parsed.real || [],
            neutral: parsed.neutral || []
        };
    } catch (e) {
        return { fake: [], real: [], neutral: [] };
    }
}

function saveAIData(data) {
    localStorage.setItem("fake_ai_db", JSON.stringify(data));
}

// ---------- TRAIN ----------
function trainAI(text, label) {
    const data = getAIData();

    if (label === "fake") {
        data.fake.push(text);
    } else if (label === "real") {
        data.real.push(text);
    } else {
        data.neutral.push(text);
    }

    saveAIData(data);
}

// ---------- TEXT HELPERS ----------
function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]+/gu, " ")
        .split(/\s+/)
        .filter(Boolean);
}

function countOccurrences(text, word) {
    const re = new RegExp(`\\b${word}\\b`, "g");
    const m = text.match(re);
    return m ? m.length : 0;
}

// простая схожесть по словам
function similarity(a, b) {
    const A = tokenize(a);
    const B = new Set(tokenize(b));

    if (A.length === 0) return 0;

    let matches = 0;
    for (let w of A) {
        if (B.has(w)) matches++;
    }
    return matches / A.length;
}

// ---------- AI ----------
function aiPredict(text) {
    const data = getAIData();

    let score = 0;

    // фейки увеличивают риск
    for (let ex of data.fake) {
        score += similarity(text, ex) * 45;
    }

    // норм тексты уменьшают риск
    for (let ex of data.real) {
        score -= similarity(text, ex) * 30;
    }

    // нейтральные тянут к нулю
    for (let ex of data.neutral) {
        const s = similarity(text, ex);
        score *= (1 - s * 0.4);
    }

    return score;
}

// ---------- DICTIONARIES ----------
const redFlags = [
    "тегін", "ұтыс", "акция", "шұғыл",
    "таратыңыз", "бәріне", "ақша",
    "сенсация", "жасырын"
];

const goodSigns = [
    "зерттеу", "ресми", "дереккөз",
    "статистика", "министрлік", "мәлімдеді"
];

// ---------- ANALYSIS ----------
function analyzeText(rawText) {
    const text = rawText.toLowerCase();

    let score = 0;
    let redCount = 0;
    let goodCount = 0;

    // 🔴 красные слова
    for (let w of redFlags) {
        const c = countOccurrences(text, w);
        if (c > 0) {
            redCount += c;
            score += c * 20;
        }
    }

    // 🟢 хорошие слова
    for (let w of goodSigns) {
        const c = countOccurrences(text, w);
        if (c > 0) {
            goodCount += c;
            score -= c * 12;
        }
    }

    // 💣 смешанные сигналы
    if (redCount > 0 && goodCount > 0) {
        score += 20;
    }

    // 🌐 ссылки
    if (text.includes("http://")) score += 25;
    if (/\.(tk|xyz|ga)/.test(text)) score += 20;

    // 🔊 CAPS
    if (rawText === rawText.toUpperCase() && rawText.length > 10) {
        score += 25;
    }

    // ❗ !
    const exclam = (text.match(/!/g) || []).length;
    score += Math.min(exclam * 5, 25);

    // 🔁 повторы
    const words = tokenize(text);
    const unique = new Set(words);
    if (words.length > 0) {
        const ratio = words.length / unique.size;
        if (ratio > 1.5) score += 15;
    }

    // ✂️ короткий текст
    if (words.length < 5) score += 10;

    // 🤖 AI
    const aiScore = aiPredict(text);
    score += aiScore;

    // нормализация
    const risk = Math.min(Math.max(score, 0), 100);

    return {
        risk,
        ai: Math.round(aiScore),
        red: redCount,
        good: goodCount
    };
}

// ---------- UI ----------
function showResult(data) {
    const block = document.getElementById("resultBlock");
    const text = document.getElementById("resultText");

    let title = "";
    let color = "";

    if (data.risk >= 60) {
        title = "❌ Қауіп жоғары";
        color = "#ef4444";
    } else if (data.risk >= 30) {
        title = "⚠️ Күмәнді";
        color = "#eab308";
    } else {
        title = "✅ Сенімді";
        color = "#22c55e";
    }

    text.innerHTML = `
        <strong>${title} (${data.risk}%)</strong><br>
        <small>Фейк: ${data.red} | Сенімді: ${data.good} | AI: ${data.ai}</small>
    `;

    block.style.display = "block";
    block.style.borderColor = color;
    block.style.background = color + "1A";

    setTimeout(() => {
        block.classList.add("active");
    }, 50);

    block.scrollIntoView({ behavior: "smooth" });
}

// ---------- MAIN ----------
function checkFake() {
    const inputEl = document.getElementById("userInput");
    const raw = inputEl.value.trim();

    if (!raw) {
        alert("Мәтінді енгізіңіз!");
        return;
    }

    document.body.classList.add("analyzing");

    setTimeout(() => {
        const data = analyzeText(raw);

        document.body.classList.remove("analyzing");
        showResult(data);

        // 🧹 очистка
        inputEl.value = "";
    }, 400);
}

// ---------- TRAIN BUTTON ----------
function trainCurrent(label) {
    const el = document.getElementById("userInput");
    const text = el.value.toLowerCase().trim();

    if (!text) {
        alert("Мәтін жоқ");
        return;
    }

    trainAI(text, label);
    alert("AI үйренді 🧠");
    }
