#!/bin/sh
# Kriz Masası tek dosyasını src/ parçalarından üretir.
cd "$(dirname "$0")"
IKCU="data:image/png;base64,$(base64 -i assets/logo-ikcu.png | tr -d '\n')"
DEO="data:image/png;base64,$(base64 -i assets/logo-deosgb.png | tr -d '\n')"
{ sed -e "s|{{LOGO_IKCU}}|$IKCU|" -e "s|{{LOGO_DEOSGB}}|$DEO|" src/head.html; printf '\n<script>\n'; cat src/kutuphane.js; printf '\n'; cat src/logic.js; printf '</script>\n'; } > kriz-masasi.html
# GitHub Pages için tam HTML belgesi
mkdir -p docs
{ printf '<!doctype html>\n<html lang="tr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<meta name="description" content="İKÇÜ Halkla İlişkiler ve Reklamcılık × DEOSGB ders konukluğu: kurumsal iletişimde çeviklik ve kriz simülasyonu.">\n</head>\n<body>\n'; cat kriz-masasi.html; printf '</body>\n</html>\n'; } > docs/index.html
touch docs/.nojekyll
