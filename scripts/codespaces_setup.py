"""Install the isolated CPU runtime and build the real browser demo."""
import json
import os
from pathlib import Path
import subprocess
import sys
import venv

ROOT = Path(__file__).resolve().parents[1]
DEMO = ROOT / '.demo'


def run(args, cwd=ROOT, env=None):
    subprocess.run(args, cwd=cwd, env=env, check=True)


def main():
    # The minimal Linux Codespaces image does not include OpenCV's shared libs.
    # This runs only inside Codespaces, never changes a visitor's local machine.
    if sys.platform == 'linux' and os.environ.get('CODESPACES') == 'true':
        # Use signed Debian sources only; an unrelated Yarn feature may ship
        # an expired repository key. Never disable signature verification.
        apt = ['sudo', 'apt-get', '-o',
               'Dir::Etc::sourcelist=/etc/apt/sources.list.d/debian.sources',
               '-o', 'Dir::Etc::sourceparts=-']
        run([*apt, 'update'])
        run([*apt, 'install', '-y', '--no-install-recommends',
             'libgl1', 'libglib2.0-0'])
    manifest = json.loads((ROOT / 'scripts/demo-versions.json').read_text())
    DEMO.mkdir(exist_ok=True)
    source = DEMO / 'yolo'
    if not source.exists():
        run(['git', 'clone', '--no-checkout', manifest['yolo']['repository'], str(source)])
    run(['git', 'fetch', 'origin', manifest['yolo']['commit']], cwd=source)
    # Only this generated clone is checked out; user source files are never reset.
    run(['git', 'checkout', '--detach', manifest['yolo']['commit']], cwd=source)
    environment = DEMO / 'venv'
    if not environment.exists():
        venv.create(environment, with_pip=True)
    python = str(environment / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python'))
    run([python, '-m', 'pip', 'install', 'torch==2.5.1', 'torchvision==0.20.1',
         '--index-url', 'https://download.pytorch.org/whl/cpu'])
    run([python, '-m', 'pip', 'install', '-r', str(source / 'requirements-browser.txt')])
    env = {**os.environ, 'YOLO_CONFIG_DIR': str(DEMO / 'ultralytics')}
    (DEMO / 'ultralytics').mkdir(exist_ok=True)
    run([python, '-c', 'from ultralytics import YOLO; YOLO("yolov8n.pt")'], cwd=source, env=env)
    run(['npm', 'ci'])
    run(['npm', 'run', 'build'], env={**env, 'VITE_CLOUD_DEMO': '1', 'VITE_LEARNSIGHT_API_URL': '/vision'})
    print('Install complete. Runtime uses genuine YOLOv8n / CPU, not a mock detector.')


if __name__ == '__main__':
    main()
