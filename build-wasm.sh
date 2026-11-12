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
old = '''    if (source.includes("gl_FrontColor")) {
     source = "varying vec4 v_color; \\n" + source.replace(/gl_FrontColor/g, "v_color");
    }'''
new = '''    if (source.includes("gl_FrontColor") || source.includes("gl_BackColor")) {
     source = "varying vec4 v_color; \\n" + source.replace(/gl_FrontColor|gl_BackColor/g, "v_color");
    }'''
if js.count(old) != 1:
    raise SystemExit("Expected one legacy vertex-color shader translation block")
js = js.replace(old, new)
old = '''    if (source.includes("gl_Normal")) {
     source = "attribute vec3 a_normal; \\n" + source.replace(/gl_Normal/g, "a_normal");
    }'''
new = '''    if (source.includes("gl_NormalMatrix")) {
     source = "uniform mat3 u_normalMatrix; \\n" + source.replace(/gl_NormalMatrix/g, "u_normalMatrix");
    }
    if (source.includes("gl_Normal")) {
     source = "attribute vec3 a_normal; \\n" + source.replace(/gl_Normal/g, "a_normal");
    }'''
if js.count(old) != 1:
    raise SystemExit("Expected one legacy normal shader translation block")
js = js.replace(old, new)
old = '''        vsLightingPass += "    vec3 lightDirection = normalize(u_lightPosition" + lightId + ").xyz;";'''
new = '''        vsLightingPass += "    vec3 lightDirection = normalize(u_lightPosition" + lightId + ".w == 0.0 ? u_lightPosition" + lightId + ".xyz : u_lightPosition" + lightId + ".xyz - ecPosition.xyz);";'''
if js.count(old) != 1:
    raise SystemExit("Expected one Emscripten fixed-function light direction expression")
js = js.replace(old, new)
old = '''     if (GLEmulation.lightEnabled) {
      var tmpMVinv = GLImmediate.matrixLib.mat4.create(GLImmediate.matrix[0]);
      GLImmediate.matrixLib.mat4.inverse(tmpMVinv);
      GLImmediate.matrixLib.mat4.transpose(tmpMVinv);
      GLctx.uniformMatrix3fv(this.normalMatrixLocation, false, GLImmediate.matrixLib.mat4.toMat3(tmpMVinv));
     }'''
new = '''     if (this.normalMatrixLocation) {
      var tmpMVinv = GLImmediate.matrixLib.mat4.create(GLImmediate.matrix[0]);
      GLImmediate.matrixLib.mat4.inverse(tmpMVinv);
      GLImmediate.matrixLib.mat4.transpose(tmpMVinv);
      GLctx.uniformMatrix3fv(this.normalMatrixLocation, false, GLImmediate.matrixLib.mat4.toMat3(tmpMVinv));
     }'''
if js.count(old) != 1:
    raise SystemExit("Expected one normal matrix upload condition")
js = js.replace(old, new)
old = '''    if (GLImmediate.enabledClientAttributes[GLImmediate.COLOR]) {
     var colorAttr = clientAttributes[GLImmediate.COLOR];'''
new = '''    if (this.colorLocation >= 0 && GLImmediate.enabledClientAttributes[GLImmediate.COLOR]) {
     var colorAttr = clientAttributes[GLImmediate.COLOR];'''
if js.count(old) != 1:
    raise SystemExit("Expected one GLImmediate client-color attribute setup")
js = js.replace(old, new)
old = ''' flush: function flush(numProvidedIndexes, startIndex, ptr) {
  startIndex = startIndex || 0;
  ptr = ptr || 0;'''
new = ''' flush: function flush(numProvidedIndexes, startIndex, ptr, indexType) {
  startIndex = startIndex || 0;
  ptr = ptr || 0;
  indexType = indexType || GLctx.UNSIGNED_SHORT;'''
if js.count(old) != 1:
    raise SystemExit("Expected one GLImmediate flush function")
js = js.replace(old, new)
old = '''   if (!GLctx.currentArrayBufferBinding && GLImmediate.firstVertex > GLImmediate.lastVertex) {
    for (var i = 0; i < numProvidedIndexes; i++) {
     var currIndex = HEAPU16[ptr + i * 2 >> 1];
     GLImmediate.firstVertex = Math.min(GLImmediate.firstVertex, currIndex);
     GLImmediate.lastVertex = Math.max(GLImmediate.lastVertex, currIndex + 1);
    }
   }
   if (!GLctx.currentElementArrayBufferBinding) {
    var indexBuffer = GL.getTempIndexBuffer(numProvidedIndexes << 1);
    GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, indexBuffer);
    GLctx.bufferSubData(GLctx.ELEMENT_ARRAY_BUFFER, 0, HEAPU16.subarray(ptr >> 1, ptr + (numProvidedIndexes << 1) >> 1));
    ptr = 0;
    emulatedElementArrayBuffer = true;
   }'''
new = '''   var indexView;
   var indexBytes;
   if (indexType == GLctx.UNSIGNED_BYTE) {
    indexView = HEAPU8;
    indexBytes = 1;
   } else if (indexType == GLctx.UNSIGNED_INT) {
    indexView = HEAPU32;
    indexBytes = 4;
   } else {
    indexView = HEAPU16;
    indexBytes = 2;
   }
   if (!GLctx.currentArrayBufferBinding && GLImmediate.firstVertex > GLImmediate.lastVertex) {
    for (var i = 0; i < numProvidedIndexes; i++) {
     var currIndex = indexView[ptr / indexBytes + i];
     GLImmediate.firstVertex = Math.min(GLImmediate.firstVertex, currIndex);
     GLImmediate.lastVertex = Math.max(GLImmediate.lastVertex, currIndex + 1);
    }
   }
   if (!GLctx.currentElementArrayBufferBinding) {
    var indexBuffer = GL.getTempIndexBuffer(numProvidedIndexes * indexBytes);
    GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, indexBuffer);
    GLctx.bufferSubData(GLctx.ELEMENT_ARRAY_BUFFER, 0, indexView.subarray(ptr / indexBytes, ptr / indexBytes + numProvidedIndexes));
    ptr = 0;
    emulatedElementArrayBuffer = true;
   }'''
if js.count(old) != 1:
    raise SystemExit("Expected one GLImmediate client index-buffer path")
js = js.replace(old, new)
old = '''   GLctx.drawElements(GLImmediate.mode, numIndexes, GLctx.UNSIGNED_SHORT, ptr);'''
new = '''   GLctx.drawElements(GLImmediate.mode, numIndexes, indexType, ptr);'''
if js.count(old) != 1:
    raise SystemExit("Expected one GLImmediate indexed draw call")
js = js.replace(old, new)
old = '''function _emscripten_glDrawElements(mode, count, type, indices, start, end) {
 if (GLImmediate.totalEnabledClientAttributes == 0 && mode <= 6 && GLctx.currentElementArrayBufferBinding) {
  GLctx.drawElements(mode, count, type, indices);
  return;
 }
 GLImmediate.prepareClientAttributes(count, false);
 GLImmediate.mode = mode;
 if (!GLctx.currentArrayBufferBinding) {
  GLImmediate.firstVertex = end ? start : HEAP8.length;
  GLImmediate.lastVertex = end ? end + 1 : 0;
  GLImmediate.vertexData = HEAPF32.subarray(GLImmediate.vertexPointer >> 2, end ? GLImmediate.vertexPointer + (end + 1) * GLImmediate.stride >> 2 : undefined);
 }
 GLImmediate.flush(count, 0, indices);
 GLImmediate.mode = -1;
}'''
new = '''function _emscripten_glDrawElements(mode, count, type, indices, start, end) {
 if (GLImmediate.totalEnabledClientAttributes == 0 && mode <= 6 && GLctx.currentElementArrayBufferBinding) {
  GLctx.drawElements(mode, count, type, indices);
  return;
 }
 var vertexCount = count;
 if (!GLctx.currentArrayBufferBinding) {
  if (end !== undefined && end !== null) {
   GLImmediate.firstVertex = start;
   GLImmediate.lastVertex = end + 1;
  } else {
   var indexView;
   var indexBytes;
   if (type == GLctx.UNSIGNED_BYTE) {
    indexView = HEAPU8;
    indexBytes = 1;
   } else if (type == GLctx.UNSIGNED_INT) {
    indexView = HEAPU32;
    indexBytes = 4;
   } else {
    indexView = HEAPU16;
    indexBytes = 2;
   }
   var first = HEAP8.length;
   var last = 0;
   for (var i = 0; i < count; i++) {
    var index = indexView[indices / indexBytes + i];
    first = Math.min(first, index);
    last = Math.max(last, index + 1);
   }
   GLImmediate.firstVertex = first;
   GLImmediate.lastVertex = last;
  }
  vertexCount = GLImmediate.lastVertex;
 }
 if (!count) return;
 GLImmediate.prepareClientAttributes(vertexCount, false);
 GLImmediate.mode = mode;
 if (!GLctx.currentArrayBufferBinding) {
  GLImmediate.vertexData = HEAPF32.subarray(GLImmediate.vertexPointer >> 2, GLImmediate.vertexPointer + GLImmediate.lastVertex * GLImmediate.stride >> 2);
 }
 GLImmediate.flush(count, 0, indices, type);
 GLImmediate.mode = -1;
}'''
if js.count(old) != 1:
    raise SystemExit("Expected one Emscripten glDrawElements wrapper")
js = js.replace(old, new)
old = '''   return fcn.apply(navigator);
  } else {
   return [];
  }
 },
 getGamepad: function(deviceIndex)'''
new = '''   var gamepads = fcn.apply(navigator) || [];
   var connectedGamepads = [];
   for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i] && gamepads[i].connected !== false) connectedGamepads.push(gamepads[i]);
   }
   return connectedGamepads;
  } else {
   return [];
  }
 },
 getGamepad: function(deviceIndex)'''
if js.count(old) != 1:
    raise SystemExit("Expected one SDL Gamepad API enumeration block")
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

js_path.write_text(js, encoding="utf-8")

html = html_path.read_text(encoding="utf-8")
script_tag = '<script async type="text/javascript" src="supertuxkart.js"></script>'
if "__STK_BUILD_ID__" not in html or script_tag not in html or '<link rel="icon" href="favicon.ico">' not in html:
    raise SystemExit("Generated HTML is missing expected build markers or favicon")

html = html.replace("__STK_BUILD_ID__", build_id)
html = html.replace(
    script_tag,
    f'<script async type="text/javascript" src="supertuxkart.js?v={build_id}"></script>')
html_path.write_text(html, encoding="utf-8")
PY
