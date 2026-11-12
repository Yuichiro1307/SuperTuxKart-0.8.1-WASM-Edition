#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "$0")" && pwd)"
OUTPUT="${1:-$ROOT/Web/Offline.html}"

python3 - "$ROOT/Web" "$OUTPUT" <<'PY'
import base64
import os
from pathlib import Path
import re
import sys
import tempfile

web_dir = Path(sys.argv[1]).resolve()
output_path = Path(sys.argv[2]).resolve()
html_path = web_dir / "supertuxkart.html"
js_path = web_dir / "supertuxkart.js"
wasm_path = web_dir / "supertuxkart.wasm"
favicon_path = web_dir / "favicon.ico"

for path in (html_path, js_path, wasm_path, favicon_path):
    if not path.is_file():
        raise SystemExit(f"Required Web build file is missing: {path}")

html = html_path.read_text(encoding="utf-8")
js = js_path.read_text(encoding="utf-8")
packages = re.findall(r'var REMOTE_PACKAGE_BASE = "([^"]+\.data)";', js)
if not packages or len(packages) != len(set(packages)):
    raise SystemExit("Could not identify unique asset bundles in the game loader")
if "</script" in js.lower():
    raise SystemExit("The game loader contains an unsafe inline-script terminator")

script_tag_pattern = re.compile(
    r'<script async type="text/javascript" src="supertuxkart\.js(?:\?[^"]*)?"></script>')
if len(script_tag_pattern.findall(html)) != 1:
    raise SystemExit("Expected one generated game JavaScript script tag")
favicon_tag = '<link rel="icon" href="favicon.ico">'
if html.count(favicon_tag) != 1:
    raise SystemExit("The game page must reference favicon.ico exactly once")

bundle_paths = {path.name: path for path in web_dir.glob("supertuxkart-assets-*.data")}
if set(packages) != set(bundle_paths):
    raise SystemExit(
        "Asset bundles do not match the game loader: "
        f"loader={sorted(packages)}, files={sorted(bundle_paths)}")

wasm_base64 = base64.b64encode(wasm_path.read_bytes()).decode("ascii")
favicon_base64 = base64.b64encode(favicon_path.read_bytes()).decode("ascii")
html = html.replace(
    favicon_tag,
    f'<link rel="icon" href="data:image/x-icon;base64,{favicon_base64}">')
before, after = script_tag_pattern.split(html, maxsplit=1)

bootstrap = f'''<script>
Module.wasmBinary = Uint8Array.from(atob("{wasm_base64}"), function(byte) {{
  return byte.charCodeAt(0);
}}).buffer;
Module.getPreloadedPackage = function(packageName, packageSize) {{
  var fileName = packageName.split(/[?#]/, 1)[0].split("/").pop();
  var chunks = document.querySelectorAll(
    'script[data-stk-package="' + fileName + '"]');
  if (!chunks.length) return null;
  var bytes = new Uint8Array(packageSize);
  var offset = 0;
  for (var i = 0; i < chunks.length; i++) {{
    var binary = atob(chunks[i].textContent);
    for (var j = 0; j < binary.length; j++)
      bytes[offset++] = binary.charCodeAt(j);
    chunks[i].remove();
  }}
  if (offset !== packageSize)
    throw new Error("Offline asset size mismatch for " + fileName);
  return bytes.buffer;
}};
</script>'''

output_path.parent.mkdir(parents=True, exist_ok=True)
temporary_path = None
try:
    with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", newline="", dir=output_path.parent,
            prefix=output_path.name + ".", suffix=".tmp", delete=False) as output:
        temporary_path = Path(output.name)
        output.write(before)
        output.write("\n")

        chunk_size = 3 * 1024 * 1024
        for package_name in packages:
            path = bundle_paths[package_name]
            with path.open("rb") as package:
                while True:
                    chunk = package.read(chunk_size)
                    if not chunk:
                        break
                    encoded = base64.b64encode(chunk).decode("ascii")
                    output.write(
                        '<script type="application/octet-stream" '
                        f'data-stk-package="{package_name}">{encoded}</script>\n')

        output.write(bootstrap)
        output.write("\n<script>\n")
        output.write(js.replace("</script", "<\\/script"))
        output.write("\n</script>")
        output.write(after)

    temporary_path.replace(output_path)
    os.chmod(output_path, 0o644)
except BaseException:
    if temporary_path is not None:
        temporary_path.unlink(missing_ok=True)
    raise

print(f"Created standalone game page: {output_path}")
print(f"Size: {output_path.stat().st_size:,} bytes")
print("This single HTML embeds the game, WebAssembly, favicon, and all game assets.")
PY
