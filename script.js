// ==============================
// 🧠 FakeShield AI Engine v2
// Author: Рейімбаев Әділет ИС 25-3
// ==============================

// ---------- ХРАНИЛИЩЕ ----------
function getAIData() {
    return JSON.parse(localStorage.getItem("fake_ai_db")) || {
        fake: [],
        real: []
    };
}

function saveAIData(data) {
    localStorage.setItem("fake_ai_db", JSON.stringify(data));
}

// ---------- ОБУЧЕНИЕ ----------
function trainAI(text, label) {
    const data = getAIData();

    if (label === "fake") {
        data.fake.push(text);
    } else {
        data.real.push(text);
    }

    saveAIData(data);
}

// ---------- СХОЖЕСТЬ ----------
function similarity(a, b) {
    const wordsA = a.split(/\s+/);
    const wordsB = b.split(/\s+/);

    let matches = 0;

    wordsA.forEach(w => {
        if (wordsB.includes(w)) matches++;
    });

    return matches / Math.max(wordsA.length, 1);
}

// ---------- AI ПРЕДСКАЗАНИЕ ----------
function aiPredict(text) {
    const data = getAIData();
    let score = 0;

    data.fake.forEach(example => {
        score += similarity(text, example) * 50;
    });

    data.real.forEach(example => {
        score -= similarity(text, example) * 35;
    });

    return score;
}

// ---------- СЛОВАРИ ----------
const redFlags = [
    "тегін","ұтыс","акция","шұғыл","таратыңыз",
    "бәріне","ақша","сенсация","жасырын","жеңіл ақша"
];

const goodSigns = [
    "зерттеу","ресми","дереккөз","статистика",
    "министрлік","мәлімдеді","аналитика"
];

// ---------- ПОДСЧЕТ СЛОВ ----------
function countOccurrences(text, word) {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    const matches = text.match(regex);
    return matches ? matches.length : 0;
}

// ---------- АНАЛИЗ ----------
function analyzeText(rawText) {
    const text = rawText.toLowerCase();
    let score = 0;

    let redCount = 0;
    let goodCount = 0;

    // 🔴 плохие слова
    redFlags.forEach(word => {
        const count = countOccurrences(text, word);
        redCount += count;
        score += count * 20;
    });

    // 🟢 хорошие слова
    goodSigns.forEach(word => {
        const count = countOccurrences(text, word);
        goodCount += count;
        score -= count * 12;
    });

    // 💣 смешанные сигналы
    if (redCount > 0 && goodCount > 0) {
        score += 25;
    }

    // 🌐 ссылки
    if (text.includes("http://")) score += 25;
    if (text.includes(".tk") || text.includes(".xyz") || text.includes(".ga")) score += 20;

    // 🔊 CAPS
    if (rawText === rawText.toUpperCase() && rawText.length > 10) {
        score += 25;
    }

    // ❗ восклицания
    const exclam = (text.match(/!/g) || []).length;
    score += Math.min(exclam * 5, 25);

    // 🔁 повторы
    const words = text.split(/\s+/).filter(w => w.length > 0);
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
        redCount,
        goodCount,
        aiScore: Math.round(aiScore)
    };
}

// ---------- UI ----------
function showResult(data) {
    const resultBlock = document.getElementById("resultBlock");
    const resultText = document.getElementById("resultText");

    let result = { text: "", color: "" };

    if (data.risk >= 60) {
        result = {
            text: `❌ Қауіп жоғары (${data.risk}%)`,
            color: "#ef4444"
        };
    } else if (data.risk >= 30) {
        result = {
            text: `⚠️ Күмәнді (${data.risk}%)`,
            color: "#eab308"
        };
    } else {
        result = {
            text: `✅ Сенімді (${data.risk}%)`,
            color: "#22c55e"
        };
    }

    result.text += `<br><small>
    Фейк сөздер: ${data.redCount} |
    Сенімді: ${data.goodCount} |
    AI: ${data.aiScore}
    </small>`;

    resultBlock.style.display = "block";
    resultBlock.style.borderColor = result.color;
    resultBlock.style.background = result.color + "1A";
    resultText.innerHTML = `<strong>${result.text}</strong>`;

    setTimeout(() => {
        resultBlock.classList.add("active");
    }, 50);

    resultBlock.scrollIntoView({ behavior: "smooth" });
}

// ---------- ОСНОВНАЯ ----------
function checkFake() {
    const input = document.getElementById("userInput").value;

    if (input.trim() === "") {
        alert("Мәтінді енгізіңіз!");
        return;
    }

    document.body.classList.add("analyzing");

    setTimeout(() => {
        const data = analyzeText(input);

        document.body.classList.remove("analyzing");

        showResult(data);
    }, 500);
}

// ---------- ОБУЧЕНИЕ КНОПКИ ----------
function trainCurrent(label) {
    const text = document.getElementById("userInput").value.toLowerCase();

    if (!text.trim()) {
        alert("Мәтін жоқ");
        return;
    }

    trainAI(text, label);

    alert("AI сақталды 🧠");
        }  
