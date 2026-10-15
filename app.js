const q = (s) => document.querySelector(s);
let currentUrl = "";

q("#go").addEventListener("click", async () => {
  const url = q("#url").value.trim();
  if (!url) return setStatus("Inserisci un URL completo.");
  setStatus("Registrazione della fonte...");
  try {
    const response = await fetch("/api/register-source", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Errore");
    currentUrl = data.url;
    showManualForm(data);
    setStatus("Fonte registrata. Ora incolla il testo.");
  } catch (error) {
    setStatus(error.message);
  }
});

function showManualForm(data) {
  q("#result").innerHTML = `<div class="panel">
    <div class="eyebrow">FONTE REGISTRATA · ${escapeHtml(data.source)}</div>
    <h2>Completa la canzone</h2>
    <p>${escapeHtml(data.message)}</p>
    <div class="manual-form">
      <label>Titolo<input id="songTitle" placeholder="Titolo della canzone"></label>
      <label>Artista<input id="songArtist" placeholder="Nome dell'artista"></label>
      <label>Testo da analizzare<textarea id="songText" placeholder="Incolla qui il testo che sei autorizzato ad analizzare..."></textarea></label>
      <button id="analyseText" class="analyse-button">Analizza il testo</button>
      <div id="manualStatus"></div>
    </div>
  </div>`;
  q("#result").classList.remove("hidden");
  q("#analyseText").addEventListener("click", analyseManualText);
}

function analyseManualText() {
  const title = q("#songTitle").value.trim();
  const artist = q("#songArtist").value.trim();
  const text = q("#songText").value.trim();
  if (!title || !artist) return setManualStatus("Inserisci titolo e artista.");
  if (text.length < 100) return setManualStatus("Inserisci almeno 100 caratteri di testo.");
  setManualStatus("Analisi in corso...");
  const analysis = analyse(text);
  showAnalysis({ title, artist, source: hostname(currentUrl), rights: "Da verificare", ...analysis });
}

function analyse(text) {
  const lower = text.toLowerCase();
  const stop = new Set("che non per con una uno del della delle dei gli alle alla nel nella sono come dove cosa questo questa poi mai più hai sei tuo tua mio mia noi voi loro era anche tutti tutto fino solo quando mentre ora però qui via".split(" "));
  const words = (lower.match(/[a-zà-öø-ÿ]{4,}/gi) || []).filter(w => !stop.has(w));
  const counts = {}; words.forEach(w => counts[w] = (counts[w] || 0) + 1);
  const keywords = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,10).map(([w]) => w);
  const areas = [
    ["Milano e città", ["milano","città","strada","traffico","tangenziale","san siro"]],
    ["Tempo e attesa", ["tempo","minuti","domani","ieri","notte","aspettare"]],
    ["Corpo e intensità", ["cuore","respiro","occhi","mani","braccia","voce"]],
    ["Viaggio e distanza", ["viaggio","partire","tornare","lontano","treno","mare"]],
    ["Memoria e appartenenza", ["ricordo","memoria","casa","insieme","ritorno","restare"]],
    ["Successo e competizione", ["successo","vincere","lavoro","soldi","fama","primo"]],
    ["Relazione e conflitto", ["amore","paura","lasciare","perdere","parlare","solitudine"]]
  ];
  const themes = areas.filter(([,ws]) => ws.some(w => lower.includes(w))).map(([n]) => n);
  const symbolic = ["cuore","milano","notte","tempo","sogni","storia","respiro","città","mondo","vita","paura","amore","strada","lavoro","successo","casa","insieme","mare","fuoco","luce","occhi","voce"];
  const lines = [...new Set(text.split(/\n+/).map(x => x.trim()).filter(x => x.length >= 12 && x.length <= 140))];
  const candidates = lines.map(line => {
    const l = line.toLowerCase(); const sy = symbolic.filter(w => l.includes(w)).length;
    const punct = (line.match(/[?!,:;]/g) || []).length; const brevity = line.length <= 60 ? 2 : line.length <= 90 ? 1 : 0;
    const score = Math.min(10, 3 + sy * 1.4 + punct * .3 + brevity);
    return { label: line, score: Number(score.toFixed(1)), reason: sy >= 2 ? "Immagine densa e memorabile" : sy === 1 ? "Contiene un simbolo forte" : brevity === 2 ? "Formula breve e autonoma" : "Passaggio narrativo rilevante" };
  }).sort((a,b) => b.score-a.score).slice(0,10);
  const fit = Math.min(5, 1 + (lower.includes("milano")?1:0) + (lower.includes("san siro")?2:0) + (lower.includes("cuore")?1:0));
  const normalizedThemes = themes.length ? themes : ["Territorio da approfondire"];
  return { themes: normalizedThemes, keywords, candidates, fit, insight: normalizedThemes.length > 1 ? `Il testo mette in tensione ${normalizedThemes[0].toLowerCase()} e ${normalizedThemes[1].toLowerCase()}.` : `Il testo costruisce il proprio universo attorno a ${normalizedThemes[0].toLowerCase()}.` };
}

function showAnalysis(data) {
  q("#result").innerHTML = `<div class="panel"><div class="top"><div><div class="eyebrow">SCHEDA STRATEGICA</div><h2>${escapeHtml(data.title)}</h2><p>${escapeHtml(data.artist)} · ${escapeHtml(data.source)}</p></div><span class="badge">${data.rights}</span></div><h3>Insight</h3><p class="insight">${escapeHtml(data.insight)}</p><div>${data.themes.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div><h3>Compatibilità preliminare con Inter: ${data.fit}/5</h3><h3>Parole ricorrenti</h3><p>${data.keywords.map(escapeHtml).join(" · ")}</p><h3>10 frasi candidate</h3><div class="phrases">${data.candidates.map((c,i) => `<div class="phrase"><span class="n">${i+1}</span><div>${escapeHtml(c.label)}<div class="reason">${escapeHtml(c.reason)} · Da verificare</div></div><span class="score">${c.score}</span></div>`).join("")}</div><div class="notice">Uso interno: verifica i diritti prima di qualsiasi pubblicazione o utilizzo commerciale.</div></div>`;
  saveLocal(data);
}
function saveLocal(data) { const key="inter-music-library"; const saved=JSON.parse(localStorage.getItem(key)||"[]"); saved.unshift({...data,url:currentUrl,date:new Date().toISOString()}); localStorage.setItem(key,JSON.stringify(saved)); }
function hostname(url){try{return new URL(url).hostname.replace("www.","")}catch{return "Fonte"}}
function setStatus(t){q("#status").textContent=t}
function setManualStatus(t){q("#manualStatus").textContent=t}
function escapeHtml(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
