if (url !== demoUrl) {
  return res.status(422).json({
    error:
      "Connettore non disponibile per questa fonte nella prova. Usa il link demo di Goya.",
  });
}
