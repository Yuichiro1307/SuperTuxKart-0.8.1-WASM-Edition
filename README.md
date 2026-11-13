The original directory for SuperTuxKart is [here](https://supertuxkart.net).
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
game assets before starting; normal gameplay does not require an internet
connection.
Connected browser gamepads are passed to SDL at startup. Audio may require a
click or key press first, depending on the browser's autoplay policy.

When internet access is enabled in the game settings, the add-ons screen lists
`.zip` files found in the `Kart/`, `cource/`, and `Arena/` directories of the
Addon-Server repository. Selecting an add-on fetches its ZIP and saves it in
the browser's persistent user filesystem. The current directories contain no
ZIP files, so the online list will remain empty until packages are added.

The browser build starts with a 256 MiB WebAssembly memory and grows it as
needed. Rendering is capped at 60 FPS (35 FPS in throttled menus) to avoid
unnecessary browser work.

Each build adds a unique query string to the JavaScript, WebAssembly, and asset
bundle URLs so browsers do not reuse cached files from an earlier build.

## Standalone offline page

Run `./offline-make.sh` after a successful build to generate
`Web/Offline.html`. It embeds the WebAssembly module, all game assets, and the
favicon into one large HTML file; no separate game files or network requests
are needed. The output is intentionally ignored by Git because it is hundreds
of megabytes. Depending on browser policy, IndexedDB saves may still require
serving the file from a local HTTP server rather than opening it as `file://`.
