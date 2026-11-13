The official SuperTuxKart website can be found [here](https://supertuxkart.net).
For information on how to use add-ons in SuperTuxKart-WASM, please refer to [this page](https://github.com/Yuichiro1307/Addon-Server).
# SuperTuxKart 0.8.1 WebAssembly Version

This game is built using Emscripten. In this browser-based build, CURL and WiiUse are disabled. The game utilizes an Irrlicht device with an SDL backend, while core game functionality—including audio and gamepad support—remains fully enabled. The entire `data/` directory has been split into asset bundles totaling less than 90 MB; all of these bundles are loaded before the game begins. This approach ensures that all generated files remain within GitHub’s 100 MB file size limit without requiring the removal of any game assets. Save data is stored in IndexedDB via Emscripten’s IDBFS.

The browser-based renderer requires WebGL 2 and employs Emscripten’s legacy OpenGL emulation. This allows Irrlicht to utilize NPOT (non-power-of-two) textures and the game’s custom shader paths. Due to browser autoplay restrictions, audio is enabled only after the game has loaded and the user performs an action, such as clicking the mouse or pressing a key.
Additionally, this build includes a modification to Emscripten’s legacy shader scanner to properly handle the nested texture matrices used by Irrlicht.

## Getting Started

```sh
sh fastboot.sh
```

## Building

If the necessary tools are not already installed, please install them using the following commands:

```sh
sudo apt-get update
sudo apt-get install emscripten cmake
```

Run the following commands from the root directory of the repository: ```sh
./build-wasm.sh
```

By default, the build uses one worker, and the process data memory limit is set to 5 GB. You can adjust these values ​​by specifying `JOBS` and `BUILD_MEMORY_KB` as needed.

CMake configuration and build files are generated in the `CMake/` directory. The resulting `supertuxkart.html`, JavaScript, WebAssembly, and all `supertuxkart-assets-NN.data` bundles are output to the `Web/` directory.

## Running Locally

Serve the `Web/` directory via HTTP (browsers do not enable WebAssembly or IndexedDB when pages are opened using `file://` URLs).

```sh
python3 -m http.server 8000 --directory Web
```

Open <http://localhost:8000/supertuxkart.html>. The browser will load all game assets before startup. An internet connection is not required for regular gameplay.
Gamepads connected to the browser are passed to SDL upon startup. Depending on the browser's autoplay policy, you may need to click or press a key before audio can be heard.

If internet access is enabled in the game settings, the add-ons screen will display a list of `.zip` files found in the `Kart/`, `course/`, and `Arena/` directories on the add-on server repository. Selecting an add-on will download the corresponding ZIP file and save it to the browser's persistent user file system.

The browser-based build starts with 256 MiB of WebAssembly memory, which expands as needed. To avoid unnecessary load on the browser, rendering is capped at 60 FPS (or 35 FPS in menus and similar screens).

In each build, a unique query string is appended to the URLs for the JavaScript, WebAssembly, and asset bundles. This prevents the browser from reusing cached files from previous builds.

## Standalone Offline Page

Running `./offline-make.sh` after a build is complete generates `Web/Offline.html`. This file contains the WebAssembly module, all game assets, and the favicon—all embedded within a single, large HTML file—eliminating the need for separate game files or additional network requests.
