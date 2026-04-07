function checkFake() {
    const text = document.getElementById("userInput").value.toLowerCase();
    const resultBlock = document.getElementById("resultBlock");
    const resultText = document.getElementById("resultText");

    if (text.trim() === "") {
        alert("Мәтінді енгізіңіз!");
        return;
    }

    let score = 0;

    // 🔴 Фейк-маркеры
    const redFlags = ["тегін", "ұтыс", "акция", "шұғыл", "таратыңыз", "бәріне жібер", "ақша береді", "сенсация", "жасырын", "шындықты жасырып"];
    
    // 🟢 Достоверные маркеры
    const goodSigns = ["зерттеу", "ресми", "дереккөз", "статистика", "білім", "жүйе", "даму", "жаңарту", "министрлік", "мәлімдеді"];

    // Анализ слов
    redFlags.forEach(word => { if (text.includes(word)) score += 30; });
    goodSigns.forEach(word => { if (text.includes(word)) score -= 15; });

    // Проверка на ссылки (фейки часто используют http вместо https или странные домены)
    if (text.includes("http://") || text.includes(".tk") || text.includes(".ga")) score += 25;

    // CAPS LOCK и знаки препинания
    if (text === text.toUpperCase() && text.length > 10) score += 25;
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 2) score += 15;

    // Ограничение score от 0 до 100 для наглядности
    let riskLevel = Math.min(Math.max(score, 0), 100);

    // Определение вердикта
    let result = { text: "✅ Сенімді ақпарат. Күмәнді ештеңе табылмады.", color: "#22c55e" };

    if (riskLevel >= 60) {
        result = { text: `❌ Қауіп жоғары (${riskLevel}%): Бұл анық фейк немесе спам!`, color: "#ef4444" };
    } else if (riskLevel >= 30) {
        result = { text: `⚠️ Күмәнді (${riskLevel}%): Ақпаратты ресми дереккөздерден тексеріңіз.`, color: "#eab308" };
    } else {
        result.text = `✅ Сенімді (${riskLevel}%): Мәтін адекватты көрінеді.`;
    }

    // Применяем стили и выводим
    resultBlock.style.display = "block";
    resultBlock.style.borderColor = result.color;
    resultBlock.style.background = result.color + "1A";
    resultText.innerHTML = `<strong>${result.text}</strong>`;

    resultBlock.scrollIntoView({ behavior: "smooth" });
}
/* 
   Author:Рейімбаев Әділет ис 25-3
   Project: FakeShield 2026 
*/
