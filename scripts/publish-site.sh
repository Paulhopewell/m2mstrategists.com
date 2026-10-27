#!/usr/bin/env bash
# Copy the public site into site/ for Netlify.
#
# netlify.toml sets publish = "site". Only files in that folder are uploaded
# as website files. Internal notes, CSS changelogs, the article template and
# the function source stay in the repository and are not part of the upload.
#
# The form handler is deployed separately. netlify.toml points [functions]
# at netlify/functions, which sits outside site/, so submission-created.js
# still becomes a function. The HTML forms are copied unchanged, including
# data-netlify="true", so Netlify Forms can still detect them.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
dest="$root/site"

rm -rf "$dest"
mkdir -p "$dest/css" "$dest/js" "$dest/assets"

pages=(
  index.html
  ai-growth-audit.html
  m2m-framework.html
  clients.html
  contact.html
  legal.html
)

for page in "${pages[@]}"; do
  cp "$root/$page" "$dest/$page"
done

cp "$root/css/reset.css" "$root/css/style.css" "$dest/css/"
cp "$root/js/consent.js" "$root/js/ga4.js" "$root/js/hero-embers.js" "$root/js/scroll-reveal.js" "$dest/js/"
cp -a "$root/assets/." "$dest/assets/"

# robots.txt, sitemap.xml and favicon.ico are copied when present.
for extra in robots.txt sitemap.xml favicon.ico; do
  if [[ -f "$root/$extra" ]]; then
    cp "$root/$extra" "$dest/$extra"
  fi
done
