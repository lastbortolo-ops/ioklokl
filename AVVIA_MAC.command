#!/bin/bash
cd "$(dirname "$0")"
if ! command -v node >/dev/null; then echo "Installa Node.js LTS da https://nodejs.org"; read; exit; fi
npm install
(open http://localhost:3000 || true) &
npm start
