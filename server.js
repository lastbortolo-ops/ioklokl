import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

/*
 * Pubblica i file presenti nella cartella principale:
 * index.html, style.css e app.js
 */
app.use(express.static(__dirname));

app.post("/api/analyze", async (req, res) => {
  const { url } = req.body || {};

  if (!url) {
    return res.status(400).json({
      error: "URL mancante"
    });
  }

  return res.json({
    mode: "manual-text",
    url: url,
    message:
      "Fonte registrata. Inserisci titolo, artista e testo per completare l'analisi."
  });
});

/*
 * Restituisce index.html esclusivamente per le pagine HTML.
 * Non intercetta style.css e app.js.
 */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    "Inter Music Library avviata sulla porta " + PORT
  );
});
