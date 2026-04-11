// ==============================
// FakeShield AI Engine (Final)
// Author: Рейімбаев Әділет
// ==============================

// ---------- STORAGE ----------
const getAIData = () =>
    JSON.parse(localStorage.getItem("fake_ai_db")) || {
        fake: [],
        real: [],
        neutral: []
    };

const saveAIData = data =>
    localStorage.setItem("fake_ai_db", JSON.stringify(data));

// ---------- TRAIN ----------
function trainAI(text, label) {
    const data = getAIData();
    (data[label] || data.neutral).push(text);
    saveAIData(data);
}

// ---------- SIMILARITY ----------
const sim = (a, b) => {
    const A = a.split(/\s+/);
    const B = b.split(/\s+/);
    return A.filter(w => B.includes(w)).length / Math.max(A.length, 1);
};

// ---------- AI ----------
function aiPredict(text) {
    const { fake, real, neutral } = getAIData();

    let score =
        fake.reduce((s, e) => s + sim(text, e) * 50, 0) -
        real.reduce((s, e) => s + sim(text, e) * 35, 0);

    neutral.forEach(e => score *= (1 - sim(text, e) * 0.5));

    return score;
}

// ---------- WORDS ----------
const redFlags = [
    "тегін","ұтыс","акция","шұғыл",
    "таратыңыз","бәріне","ақша",
    "сенсация","жасырын"
];

const goodSigns = [
    "зерттеу","ресми","дереккөз",
    "статистика","министрлік","мәлімдеді"
];

// ---------- ANALYZE ----------
function analyzeText(raw) {
    const text = raw.toLowerCase();

    const count = arr =>
        arr.reduce((s, w) => s + (text.includes(w) ? 1 : 0), 0);

    let score =
        count(redFlags) * 20 -
        count(goodSigns) * 12;

    if (count(redFlags) && count(goodSigns)) score += 20;

    if (/http:\/\//.test(text)) score += 25;
    if (/\.(tk|xyz|ga)/.test(text)) score += 20;

    if (raw === raw.toUpperCase() && raw.length > 10) score += 25;

    const ex = (text.match(/!/g) || []).length;
    score += Math.min(ex * 5, 25);

    const words = text.split(/\s+/);
    const unique = new Set(words);
    if (words.length / unique.size > 1.5) score += 15;
    if (words.length < 5) score += 10;

    const aiScore = aiPredict(text);
    score += aiScore;

    return {
        risk: Math.min(Math.max(score, 0), 100),
        ai: Math.round(aiScore),
        red: count(redFlags),
        good: count(goodSigns)
    };
}

// ---------- UI ----------
function showResult({ risk, ai, red, good }) {
    const block = document.getElementById("resultBlock");
    const text = document.getElementById("resultText");

    const state =
        risk >= 60 ? ["❌ Қауіп жоғары", "#ef4444"] :
        risk >= 30 ? ["⚠️ Күмәнді", "#eab308"] :
                     ["✅ Сенімді", "#22c55e"];

    text.innerHTML = `
        <strong>${state[0]} (${risk}%)</strong><br>
        <small>Фейк: ${red} | Сенімді: ${good} | AI: ${ai}</small>
    `;

    block.style.display = "block";
    block.style.borderColor = state[1];
    block.style.background = state[1] + "1A";

    setTimeout(() => block.classList.add("active"), 50);
    block.scrollIntoView({ behavior: "smooth" });
}

// ---------- MAIN ----------
function checkFake() {
    const inputEl = document.getElementById("userInput");
    const text = inputEl.value.trim();

    if (!text) return alert("Мәтінді енгізіңіз!");

    document.body.classList.add("analyzing");

    setTimeout(() => {
        const data = analyzeText(text);

        document.body.classList.remove("analyzing");
        showResult(data);

        // 🧹 автоочистка
        inputEl.value = "";
    }, 400);
}

// ---------- TRAIN BUTTON ----------
function trainCurrent(label) {
    const text = document.getElementById("userInput").value.toLowerCase();

    if (!text.trim()) return alert("Мәтін жоқ");

    trainAI(text, label);
    alert("AI үйренді 🧠");
            }
