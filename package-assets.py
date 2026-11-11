#!/usr/bin/env python3

import os
from pathlib import Path
import subprocess
import sys
import tempfile


PACKAGE_LIMIT = 90_000_000
PACKAGE_PREFIX = "supertuxkart-assets-"


def main():
    if len(sys.argv) != 4:
        raise SystemExit(
            "Usage: package-assets.py DATA_DIR OUTPUT_DIR FILE_PACKAGER")

    data_dir = Path(sys.argv[1]).resolve()
    output_dir = Path(sys.argv[2]).resolve()
    packager = Path(sys.argv[3]).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    files = sorted(
        (path for path in data_dir.rglob("*") if path.is_file()),
        key=lambda path: (-path.stat().st_size,
                          path.relative_to(data_dir).as_posix()))
    if not files:
        raise SystemExit(f"No assets found under {data_dir}")

    packages = []
    for path in files:
        size = path.stat().st_size
        if size > PACKAGE_LIMIT:
            relative = path.relative_to(data_dir)
            raise SystemExit(
                f"Asset exceeds the {PACKAGE_LIMIT}-byte bundle limit: "
                f"{relative} ({size} bytes)")

        for package in packages:
            if package[0] + size <= PACKAGE_LIMIT:
                package[0] += size
                package[1].append(path)
                break
        else:
            packages.append([size, [path]])

    for stale_path in output_dir.glob(f"{PACKAGE_PREFIX}[0-9][0-9].data"):
        stale_path.unlink()
    (output_dir / "supertuxkart.data").unlink(missing_ok=True)

    package_scripts = []
    with tempfile.TemporaryDirectory(prefix="stk-assets-") as temp_dir:
        for index, (size, package_files) in enumerate(packages, start=1):
            package_name = f"{PACKAGE_PREFIX}{index:02d}"
            data_path = output_dir / f"{package_name}.data"
            script_path = Path(temp_dir) / f"{package_name}.js"
            command = [
                sys.executable, os.fspath(packager), os.fspath(data_path),
                "--js-output=" + os.fspath(script_path), "--preload"]
            command.extend(
                f"{path}@/data/{path.relative_to(data_dir).as_posix()}"
                for path in package_files)
            subprocess.run(command, check=True)
            package_scripts.append(script_path.read_text(encoding="utf-8"))
            print(f"Created {data_path.name}: {size} bytes")

    loader_path = output_dir / "supertuxkart-assets.js"
    loader_path.write_text("\n".join(package_scripts), encoding="utf-8")
    print(f"Packaged {len(files)} assets into {len(packages)} bundles.")


if __name__ == "__main__":
    main()
