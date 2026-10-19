#!/bin/sh
cd "$(dirname "$0")"
{ cat src/shell.html; printf '\n<script>\n(() => {\n'"'"'use strict'"'"';\n'; cat src/01_core.js src/02_sprites.js src/03_world.js src/04_actors.js src/05_game.js; printf '\n})();\n</script>\n'; } > dapa.html
{ printf '<!doctype html>\n<html lang="vi">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">\n<meta name="theme-color" content="#16121c">\n<meta name="description" content="DAPA: game trào phúng bạo loạn kiểu châu Âu, pixel art 2.5D, chơi vô tận trên trình duyệt.">\n';
  sed -n '1,/<\/style>/p' dapa.html; printf '</head>\n<body>\n'; sed -n '/<\/style>/,$p' dapa.html | tail -n +2; printf '</body>\n</html>\n'; } > index.html
node -e "const s=require('fs').readFileSync('dapa.html','utf8'); const m=s.split('<script>\n')[1].split('</script>')[0]; try{ new Function(m); console.log('syntax ok', m.length) }catch(e){ console.log('ERR', e.message) }"
