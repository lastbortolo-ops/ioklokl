import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

/*
 * I file index.html, app.js e style.css sono nella cartella
 * principale del repository, quindi Express serve __dirname.
 */
app.use(express.static(__dirname));

const demoUrl =
  "https://www.angolotesti.it/F/testi_canzoni_fabri_fibra_3164/testo_canzone_goya_2809972.html";

app.post("/api/analyze", async (req, res) => {
  const { url } = req.body || {};

  if (!url) {
    return res.status(400).json({
      error: "URL mancante",
    });
  }

  if (url !== demoUrl) {
    return res.status(422).json({
      error:
        "Connettore non disponibile per questa fonte nella prova. Usa il link demo di Goya.",
    });
  }

  return res.json({
    title: "Goya",
    artist: "Fabri Fibra",
    source: "AngoloTesti",
    rights: "Da verificare",
    fit: 2,
    insight:
      "Il brano mette in relazione visibilità, conflitto e paura di essere sostituiti. La notorietà emerge come pressione, non come semplice premio.",
    themes: [
      "fama e mortalità",
      "paranoia",
      "industria culturale",
      "lavoro creativo",
    ],
    candidates: [
      {
        label: "Frase candidata 1",
        score: 9.1,
        reason: "Immagine centrale da verificare",
      },
      {
        label: "Frase candidata 2",
        score: 8.8,
        reason: "Formula autonoma da verificare",
      },
      {
        label: "Frase candidata 3",
        score: 8.5,
        reason: "Tensione culturale",
      },
      {
        label: "Frase candidata 4",
        score: 8.2,
        reason: "Potenziale simbolico",
      },
      {
        label: "Frase candidata 5",
        score: 7.9,
        reason: "Immagine memorabile",
      },
      {
        label: "Frase candidata 6",
        score: 7.6,
        reason: "Passaggio narrativo",
      },
      {
        label: "Frase candidata 7",
        score: 7.3,
        reason: "Paradosso",
      },
      {
        label: "Frase candidata 8",
        score: 7.0,
        reason: "Sintesi tematica",
      },
      {
        label: "Frase candidata 9",
        score: 6.7,
        reason: "Brevità",
      },
      {
        label: "Frase candidata 10",
        score: 6.4,
        reason: "Risonanza",
      },
    ],
  });
});

/*
 * Se qualcuno apre un percorso non riconosciuto,
 * restituiamo comunque index.html.
 */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Inter Music Library avviata sulla porta ${PORT}`);
});
