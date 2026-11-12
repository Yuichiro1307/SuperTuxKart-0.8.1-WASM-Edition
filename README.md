# SuperTuxKart 0.8.1 WebAssembly Edition

The game is built with Emscripten. The browser build disables CURL and WiiUse,
uses the bundled SDL-backed Irrlicht device, and keeps the game, audio, and
gamepad support enabled. The complete `data/` tree is split into asset bundles
smaller than 90 MB each, then all bundles are loaded before the game starts.
This keeps every generated file below GitHub's 100 MB file limit without
removing game assets. Save files are stored in IndexedDB through Emscripten's
IDBFS.

The browser renderer requires WebGL 2 and uses Emscripten's legacy OpenGL
emulation. This lets Irrlicht use NPOT textures and the game's shader path.
Irrlicht sphere-map materials generate reflection coordinates in the emulated
vertex shader instead of relying on unsupported fixed-function texture gen.
Because browsers restrict autoplay, click or press a key after the game loads
to enable audio.
The build also corrects Emscripten's legacy shader scanner for nested texture
matrix expressions used by Irrlicht.

## For those who don’t know where to start
started

```sh
sh fastboot.sh
```
## Build

Install the required tools if they are not already installed:

```sh
sudo apt-get update
sudo apt-get install emscripten cmake
```

From this repository's root, run:

```sh
./build-wasm.sh
```

The build uses one worker and a 5 GB process data-memory limit by default. Override
these with `JOBS` and `BUILD_MEMORY_KB` if needed.

CMake's configuration and build files are written to `CMake/`. The generated
`supertuxkart.html`, JavaScript, WebAssembly, and all
`supertuxkart-assets-NN.data` bundles are written to `Web/`.

## Run locally

Serve `Web/` over HTTP (browsers do not enable WebAssembly and IndexedDB when
opening the generated page as a `file://` URL):

```sh
python3 -m http.server 8000 --directory Web
```

Open <http://localhost:8000/supertuxkart.html>. The browser loads all bundled
game assets before starting; no game-server or add-on connection is used.
Browser gamepads are handled through the SDL input device. Audio may require a
click or key press first, depending on the browser's autoplay policy.

The browser build starts with a 256 MiB WebAssembly memory and grows it as
needed. Rendering is capped at 60 FPS (35 FPS in throttled menus) to avoid
unnecessary browser work.

Each build adds a unique query string to the JavaScript, WebAssembly, and asset
bundle URLs so browsers do not reuse cached files from an earlier build.
