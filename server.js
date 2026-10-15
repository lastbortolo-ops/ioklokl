import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "2mb" }));
app.use(express.static(__dirname));

app.post("/api/register-source", (req, res) => {
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: "URL mancante" });
  try {
    const parsed = new URL(url);
    return res.json({
      mode: "manual-text",
      url,
      source: parsed.hostname.replace("www.", ""),
      message: "Fonte registrata. Inserisci titolo, artista e testo per completare l'analisi."
    });
  } catch {
    return res.status(400).json({ error: "URL non valido" });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log("Inter Music Library attiva sulla porta " + PORT));
