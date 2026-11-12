#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "$0")" && pwd)"
export EM_CACHE="${EM_CACHE:-$HOME/.cache/emscripten}"
mkdir -p "$EM_CACHE"
ulimit -d "${BUILD_MEMORY_KB:-5242880}"

if [[ -z "${EM_CONFIG:-}" && -f /usr/share/emscripten/.emscripten ]]; then
  export EM_CONFIG="$ROOT/CMake/emscripten.config"
  cp /usr/share/emscripten/.emscripten "$EM_CONFIG"
  sed -i 's/^FROZEN_CACHE = True.*/FROZEN_CACHE = False/' "$EM_CONFIG"
fi

EMSCRIPTEN_ROOT="$(em-config EMSCRIPTEN_ROOT)"
python3 "$ROOT/package-assets.py" \
  "$ROOT/SuperTuxKart-0.8.1/data" \
  "$ROOT/Web" \
  "$EMSCRIPTEN_ROOT/tools/file_packager.py"

emcmake cmake \
  -S "$ROOT/SuperTuxKart-0.8.1" \
  -B "$ROOT/CMake" \
  -DCMAKE_BUILD_TYPE=Release \
  -DUSE_WIIUSE=OFF \
  -DUSE_FRIBIDI=OFF

# CMake artifacts are checked in, so refresh Irrlicht's WebGL-specific objects.
touch \
  "$ROOT/SuperTuxKart-0.8.1/lib/irrlicht/source/Irrlicht/COpenGLDriver.cpp" \
  "$ROOT/SuperTuxKart-0.8.1/lib/irrlicht/source/Irrlicht/COpenGLExtensionHandler.cpp" \
  "$ROOT/SuperTuxKart-0.8.1/lib/irrlicht/source/Irrlicht/COpenGLTexture.cpp"
cmake --build "$ROOT/CMake" --parallel "${JOBS:-1}"

BUILD_ID="${STK_BUILD_ID:-$(git -C "$ROOT" rev-parse --short HEAD)-$(date -u +%Y%m%d%H%M%S)}"
python3 - "$ROOT/Web/supertuxkart.js" "$ROOT/Web/supertuxkart.html" "$BUILD_ID" <<'PY'
from pathlib import Path
import sys

js_path = Path(sys.argv[1])
html_path = Path(sys.argv[2])
build_id = sys.argv[3]

js = js_path.read_text(encoding="utf-8")
regex_replacements = (
    (
        r"var texLoadRegex = /(texture.*?\(.*?\))/g;",
        r"var texLoadRegex = /(texture.*?\((?:[^()]|\([^()]*\))*\))/g;",
    ),
    (
        r"texLoadRegex = /(texture.*\(.*\))/g;",
        r"texLoadRegex = /(texture.*?\((?:[^()]|\([^()]*\))*\))/g;",
    ),
)
for old, new in regex_replacements:
    if js.count(old) != 1:
        raise SystemExit(f"Expected one Emscripten GL texture scanner: {old}")
    js = js.replace(old, new)
old = '''    default:
     err("WARNING: Unhandled `pname` in call to `glTexEnvf`.");
    }
   },
   hook_texEnvi: function'''
new = '''    default:
     GLImmediate.TexEnvJIT.hook_texEnvi(target, pname, param);
    }
   },
   hook_texEnvi: function'''
if js.count(old) != 1:
    raise SystemExit("Expected one Emscripten glTexEnvf fallback")
js = js.replace(old, new)
gl_draw_buffer_wrappers = (
    "function _glDrawBuffer() {\n throw \"glDrawBuffer: TODO\";\n}",
    "function _emscripten_glDrawBuffer() {\n throw \"glDrawBuffer: TODO\";\n}",
)
for old in gl_draw_buffer_wrappers:
    if js.count(old) != 1:
        raise SystemExit("Expected one Emscripten glDrawBuffer TODO wrapper")
    js = js.replace(old, old.split("\n")[0] + "\n}")
texgen_wrappers = (
    "function _glTexGeni() {\n throw \"glTexGeni: TODO\";\n}",
    "function _emscripten_glTexGeni() {\n throw \"glTexGeni: TODO\";\n}",
    "function _emscripten_glTexGenfv() {\n throw \"glTexGenfv: TODO\";\n}",
)
for old in texgen_wrappers:
    if js.count(old) > 1:
        raise SystemExit("Found duplicate Emscripten texture-generation wrappers")
    js = js.replace(old, old.split("\n")[0] + "\n}")

def replace_once(old, new, description):
    global js
    if js.count(old) != 1:
        raise SystemExit(f"Expected one Emscripten {description} hook")
    js = js.replace(old, new)

replace_once(
    " currentMatrix: 0,\n tempMatrix: null,",
    " currentMatrix: 0,\n textureGenS: [],\n textureGenT: [],\n textureGenModeS: [],\n textureGenModeT: [],\n tempMatrix: null,",
    "texture-generation state")
replace_once(
    '''  keyView.next(enabledAttributesKey);
  keyView.next(GL.currProgram);''',
    '''  keyView.next(enabledAttributesKey);
  var textureGenKey = 0;
  for (var texUnit = 0; texUnit < GLImmediate.MAX_TEXTURES; texUnit++) {
   var sphereMap = GLImmediate.textureGenS[texUnit] && GLImmediate.textureGenT[texUnit] &&
    GLImmediate.textureGenModeS[texUnit] == 9218 && GLImmediate.textureGenModeT[texUnit] == 9218;
   textureGenKey = textureGenKey * 2 + (sphereMap ? 1 : 0);
  }
  keyView.next(textureGenKey);
  keyView.next(GL.currProgram);''',
    "texture-generation renderer cache")
replace_once(
    '''     var vsTexCoordInits = "";
     this.usedTexUnitList = GLImmediate.TexEnvJIT.getUsedTexUnitList();''',
    '''     var vsTexCoordInits = "";
     var sphereMapUnits = [];
     var hasSphereMap = false;
     for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
      sphereMapUnits[i] = !useCurrProgram && GLImmediate.textureGenS[i] && GLImmediate.textureGenT[i] &&
       GLImmediate.textureGenModeS[i] == 9218 && GLImmediate.textureGenModeT[i] == 9218;
      hasSphereMap = hasSphereMap || sphereMapUnits[i];
     }
     if (hasSphereMap && !GLImmediate.enabledClientAttributes[GLImmediate.NORMAL]) {
      sphereMapUnits = [];
      hasSphereMap = false;
     }
     this.usedTexUnitList = GLImmediate.TexEnvJIT.getUsedTexUnitList();''',
    "sphere-map shader state")
replace_once(
    '''      vsTexCoordInits += "  " + vTexCoordPrefix + texUnit + " = " + aTexCoordPrefix + texUnit + ";\\n";''',
    '''      if (sphereMapUnits[texUnit]) {
       var suffix = texUnit;
       vsTexCoordInits += "  vec3 sphereNormal" + suffix + " = normalize(u_normalMatrix * a_normal);\\n";
       vsTexCoordInits += "  vec3 sphereEye" + suffix + " = normalize(ecPosition.xyz);\\n";
       vsTexCoordInits += "  vec3 sphereReflection" + suffix + " = reflect(sphereEye" + suffix + ", sphereNormal" + suffix + ");\\n";
       vsTexCoordInits += "  float sphereDenom" + suffix + " = max(2.0 * length(vec3(sphereReflection" + suffix + ".x, sphereReflection" + suffix + ".y, sphereReflection" + suffix + ".z + 1.0)), 0.000001);\\n";
       vsTexCoordInits += "  " + vTexCoordPrefix + texUnit + " = vec4(sphereReflection" + suffix + ".xy / sphereDenom" + suffix + " + vec2(0.5), 0.0, 1.0);\\n";
      } else {
       vsTexCoordInits += "  " + vTexCoordPrefix + texUnit + " = " + aTexCoordPrefix + texUnit + ";\\n";
      }''',
    "sphere-map shader coordinates")
replace_once(
    '''     var vsLightingDefs = "";
     var vsLightingPass = "";
     if (GLEmulation.lightingEnabled) {
      vsLightingDefs += "attribute vec3 a_normal;";
      vsLightingDefs += "uniform mat3 u_normalMatrix;";''',
    '''     var vsLightingDefs = "";
     var vsLightingPass = "";
     if (GLEmulation.lightingEnabled || hasSphereMap) {
      vsLightingDefs += "attribute vec3 a_normal;";
      vsLightingDefs += "uniform mat3 u_normalMatrix;";
     }
     if (GLEmulation.lightingEnabled) {''',
    "sphere-map normal matrix")

texgen_enable = '''   } else if (cap == 3553) {
    return;'''
if js.count(texgen_enable) != 2:
    raise SystemExit("Expected Emscripten texture-enable compatibility hooks")
enable_branch = '''   } else if (cap == 3168 || cap == 3169) {
    var texUnit = GLImmediate.TexEnvJIT.getActiveTexture();
    if (cap == 3168) GLImmediate.textureGenS[texUnit] = true;
    else GLImmediate.textureGenT[texUnit] = true;
    GLImmediate.currentRenderer = null;
    return;
   } else if (cap == 3553) {
    return;'''
js = js.replace(texgen_enable, enable_branch, 1)
disable_branch = '''   } else if (cap == 3168 || cap == 3169) {
    var texUnit = GLImmediate.TexEnvJIT.getActiveTexture();
    if (cap == 3168) GLImmediate.textureGenS[texUnit] = false;
    else GLImmediate.textureGenT[texUnit] = false;
    GLImmediate.currentRenderer = null;
    return;
   } else if (cap == 3553) {
    return;'''
js = js.replace(texgen_enable, disable_branch, 1)
replace_once(
    '''   } else if (!(cap in validCapabilities)) {
    return 0;
   }
   return GLctx.isEnabled(cap);''',
    '''   } else if (cap == 3168) {
    return GLImmediate.textureGenS[GLImmediate.TexEnvJIT.getActiveTexture()] ? 1 : 0;
   } else if (cap == 3169) {
    return GLImmediate.textureGenT[GLImmediate.TexEnvJIT.getActiveTexture()] ? 1 : 0;
   } else if (!(cap in validCapabilities)) {
    return 0;
   }
   return GLctx.isEnabled(cap);''',
    "texture-generation query")

texgen_body = '''function _emscripten_glTexGeni(coord, pname, param) {
 if (pname != 9472) return;
 var texUnit = GLImmediate.TexEnvJIT.getActiveTexture();
 if (coord == 8192) GLImmediate.textureGenModeS[texUnit] = param;
 else if (coord == 8193) GLImmediate.textureGenModeT[texUnit] = param;
 GLImmediate.currentRenderer = null;
}'''
replace_once(
    "function _emscripten_glTexGeni() {\n}",
    texgen_body,
    "glTexGeni wrapper")
replace_once(
    "function _glTexGeni() {\n}",
    texgen_body.replace("_emscripten_glTexGeni", "_glTexGeni"),
    "desktop-alias glTexGeni wrapper")
gl_texgen_fv = '''function _emscripten_glTexGenfv() {
}'''
if js.count(gl_texgen_fv) != 1:
    raise SystemExit("Expected one Emscripten glTexGenfv compatibility wrapper")
js_path.write_text(js, encoding="utf-8")

html = html_path.read_text(encoding="utf-8")
script_tag = '<script async type="text/javascript" src="supertuxkart.js"></script>'
if "__STK_BUILD_ID__" not in html or script_tag not in html:
    raise SystemExit("Generated HTML is missing expected build cache-busting markers")

html = html.replace("__STK_BUILD_ID__", build_id)
html = html.replace(
    script_tag,
    f'<script async type="text/javascript" src="supertuxkart.js?v={build_id}"></script>')
html_path.write_text(html, encoding="utf-8")
PY
