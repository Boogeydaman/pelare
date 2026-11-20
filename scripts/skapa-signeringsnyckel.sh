#!/usr/bin/env bash
# Run once (Git Bash). Creates the key that signs every APK and stores it as GitHub secrets.
# A backup copy is kept in ~/pelare-signering – keep it; without the same key, updates can't install over the old app.
set -e
GH="${GH:-gh}"; command -v "$GH" >/dev/null || GH="/c/Program Files/GitHub CLI/gh.exe"
D="$HOME/pelare-signering"; mkdir -p "$D"
if [ ! -f "$D/pelare.p12" ]; then
  PW=$(openssl rand -hex 24)
  MSYS_NO_PATHCONV=1 openssl req -x509 -newkey rsa:2048 -nodes -keyout "$D/key.pem" -out "$D/cert.pem" -days 10950 -subj "/CN=Pelare" 2>/dev/null
  openssl pkcs12 -export -inkey "$D/key.pem" -in "$D/cert.pem" -name pelare -out "$D/pelare.p12" -passout "pass:$PW" -keypbe AES-256-CBC -certpbe AES-256-CBC -macalg sha256
  rm "$D/key.pem" "$D/cert.pem"; printf '%s' "$PW" > "$D/losenord.txt"
fi
cd "$(dirname "$0")/.."
base64 -w0 "$D/pelare.p12" | "$GH" secret set KEYSTORE_BASE64
"$GH" secret set KEYSTORE_PASSWORD < "$D/losenord.txt"
"$GH" workflow run apk.yml
echo "Klart. APK:n byggs nu – om ett par minuter: https://github.com/Boogeydaman/pelare/releases/download/apk/pelare.apk"
