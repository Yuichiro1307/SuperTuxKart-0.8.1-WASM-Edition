sudo apt-get update
sudo apt-get install emscripten cmake

./build-wasm.sh

python3 -m http.server 8000 --directory Web