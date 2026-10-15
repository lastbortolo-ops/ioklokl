const q = (selector) => document.querySelector(selector);

let currentUrl = "";

q("#go").onclick = async () => {
  const url = q("#url").value.trim();

  if (!url) {
    q("#status").textContent = "Inserisci un link completo.";
    return;
  }

  q("#status").textContent = "Registrazione della fonte in corso...";
  q("#result").classList.add("hidden");

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: url
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Errore durante la registrazione.");
    }

    currentUrl = url;

    if (data.mode === "manual-text") {
      showManualForm(data);
      q("#status").textContent =
        "Fonte registrata. Completa titolo, artista e testo.";
      return;
    }

    showAnalysis(data);
    q("#status").textContent = "Analisi completata.";
  } catch (error) {
    q("#status").textContent = error.message;
  }
};

function showManualForm(data) {
  q("#result").innerHTML = `
    <div class="panel">
      <div class="eyebrow">FONTE REGISTRATA</div>

      <h2>Completa la canzone</h2>

      <p class="insight">
        ${escapeHtml(data.message)}
      </p>

      <div class="manual-form">
        <label>
          Titolo della canzone
          <input
            id="songTitle"
            type="text"
            placeholder="Es. Vai in Africa, Celestino"
          >
        </label>

        <label>
          Artista
          <input
            id="songArtist"
            type="text"
            placeholder="Es. Francesco De Gregori"
          >
        </label>

        <label>
          Testo da analizzare
          <textarea
            id="songText"
            rows="15"
            placeholder="Incolla qui il testo che sei autorizzato ad analizzare..."
          ></textarea>
        </label>

        <button id="analyseText" class="analyse-text-button">
          Analizza il testo
        </button>

        <div id="manualStatus"></div>
      </div>
    </div>
  `;

  q("#result").classList.remove("hidden");

  q("#analyseText").onclick = () => {
    analyseManualText();
  };
}

function analyseManualText() {
  const title = q("#songTitle").value.trim();
  const artist = q("#songArtist").value.trim();
  const text = q("#songText").value.trim();

  if (!title) {
    q("#manualStatus").textContent =
      "Inserisci il titolo della canzone.";
    return;
  }

  if (!artist) {
    q("#manualStatus").textContent =
      "Inserisci il nome dell'artista.";
    return;
  }

  if (text.length < 100) {
    q("#manualStatus").textContent =
      "Il testo è troppo breve. Inserisci almeno 100 caratteri.";
    return;
  }

  q("#manualStatus").textContent = "Analisi del testo in corso...";

  const analysis = analyseText(text);

  const result = {
    title: title,
    artist: artist,
    source: getHostname(currentUrl),
    rights: "Da verificare",
    themes: analysis.themes,
    keywords: analysis.keywords,
    candidates: analysis.candidates,
    fit: analysis.fit,
    insight: createInsight(analysis.themes)
  };

  saveAnalysis(result);
  showAnalysis(result);

  q("#status").textContent =
    "Analisi completata e salvata nel browser.";
}

function analyseText(text) {
  const lowerText = text.toLowerCase();

  const stopwords = new Set([
    "che",
    "non",
    "per",
    "con",
    "una",
    "uno",
    "del",
    "della",
    "delle",
    "dei",
    "gli",
    "alle",
    "alla",
    "nel",
    "nella",
    "sono",
    "come",
    "dove",
    "cosa",
    "questo",
    "questa",
    "poi",
    "mai",
    "più",
    "hai",
    "sei",
    "tuo",
    "tua",
    "mio",
    "mia",
    "noi",
    "voi",
    "loro",
    "era",
    "anche",
    "tutti",
    "tutto",
    "fino",
    "solo",
    "quando",
    "mentre",
    "ora",
    "però",
    "qui",
    "via"
  ]);

  const words =
    lowerText.match(/[a-zà-öø-ÿ]{4,}/gi) || [];

  const counts = {};

  words
    .filter((word) => !stopwords.has(word))
    .forEach((word) => {
      counts[word] = (counts[word] || 0) + 1;
    });

  const keywords = Object.entries(counts)
    .sort((first, second) => second[1] - first[1])
    .slice(0, 10)
    .map(([word]) => word);

  const semanticTerritories = [
    {
      name: "Milano e città",
      words: [
        "milano",
        "città",
        "strada",
        "traffico",
        "tangenziale",
        "san siro"
      ]
    },
    {
      name: "Tempo e attesa",
      words: [
        "tempo",
        "minuti",
        "domani",
        "ieri",
        "notte",
        "aspettare"
      ]
    },
    {
      name: "Corpo e intensità",
      words: [
        "cuore",
        "respiro",
        "occhi",
        "mani",
        "braccia",
        "voce"
      ]
    },
    {
      name: "Viaggio e distanza",
      words: [
        "viaggio",
        "partire",
        "tornare",
        "lontano",
        "treno",
        "mare"
      ]
    },
    {
      name: "Memoria e appartenenza",
      words: [
        "ricordo",
        "memoria",
        "casa",
        "insieme",
        "ritorno",
        "restare"
      ]
    },
    {
      name: "Successo e competizione",
      words: [
        "successo",
        "vincere",
        "lavoro",
        "soldi",
        "fama",
        "primo"
      ]
    },
    {
      name: "Relazione e conflitto",
      words: [
        "amore",
        "paura",
        "lasciare",
        "perdere",
        "parlare",
        "solitudine"
      ]
    }
  ];

  const themes = semanticTerritories
    .filter((territory) =>
      territory.words.some((word) => lowerText.includes(word))
    )
    .map((territory) => territory.name);

  const symbolicWords = [
    "cuore",
    "milano",
    "notte",
    "tempo",
    "sogni",
    "storia",
    "respiro",
    "città",
    "mondo",
    "vita",
    "paura",
    "amore",
    "strada",
    "lavoro",
    "successo",
    "casa",
    "insieme",
    "mare",
    "fuoco",
    "luce",
    "occhi",
    "voce"
  ];

  const originalLines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length >= 12 &&
        line.length <= 140
    );

  const uniqueLines = [
    ...new Set(originalLines)
  ];

  const candidates = uniqueLines
    .map((line) => {
      const lowerLine = line.toLowerCase();

      const symbolicCount = symbolicWords.filter((word) =>
        lowerLine.includes(word)
      ).length;

      const punctuationCount =
        (line.
