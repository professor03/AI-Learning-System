"""Start once per container; child services share only the public 8787 gateway."""
import os
from pathlib import Path
import signal
import subprocess
import sys
import time
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
DEMO = ROOT / '.demo'
PID = DEMO / 'supervisor.pid'


def healthy(url):
    try:
        with urllib.request.urlopen(url, timeout=2) as response:
            return response.status == 200
    except Exception:
        return False


def supervise():
    PID.write_text(str(os.getpid()))
    env = {**os.environ, 'VISION_PORT': '8000', 'YOLO_CONFIG_DIR': str(DEMO / 'ultralytics')}
    python = str(DEMO / 'venv/bin/python')
    children = []
    try:
        with (DEMO / 'vision.log').open('a') as vision_log, (DEMO / 'web.log').open('a') as web_log:
            vision = subprocess.Popen([python, '-m', 'uvicorn', 'src.server.browser_demo:app',
                                       '--host', '127.0.0.1', '--port', '8000', '--no-access-log'],
                                      cwd=DEMO / 'yolo', env=env, stdout=vision_log, stderr=vision_log)
            children.append(vision)
            for _ in range(90):
                if healthy('http://127.0.0.1:8000/health'): break
                if vision.poll() is not None: raise RuntimeError('Vision startup failed. See .demo/vision.log')
                time.sleep(1)
            else: raise RuntimeError('Vision startup timeout. See .demo/vision.log')
            web = subprocess.Popen(['node', 'server/index.mjs'], cwd=ROOT, env=env, stdout=web_log, stderr=web_log)
            children.append(web)
            def shutdown(_signal, _frame):
                raise KeyboardInterrupt
            signal.signal(signal.SIGTERM, shutdown)
            signal.signal(signal.SIGINT, shutdown)
            while all(child.poll() is None for child in children):
                time.sleep(2)
            raise RuntimeError('A demo service stopped. Inspect .demo/*.log, then restart.')
    except KeyboardInterrupt:
        pass
    finally:
        for child in children:
            if child.poll() is None:
                child.terminate()
                try: child.wait(timeout=5)
                except subprocess.TimeoutExpired: child.kill()
        if PID.exists() and PID.read_text() == str(os.getpid()): PID.unlink()


def main():
    if '--supervise' in sys.argv:
        supervise(); return
    if os.name == 'nt': raise SystemExit('Codespaces launcher runs inside the Linux Codespace, not Windows.')
    if not (DEMO / 'venv/bin/python').exists() or not (ROOT / 'dist/index.html').exists():
        raise SystemExit('Run python scripts/codespaces_setup.py first.')
    if PID.exists():
        previous = PID.read_text().strip()
        command = Path('/proc') / previous / 'cmdline'
        if previous.isdigit() and command.exists() and b'codespaces_start.py' in command.read_bytes():
            print('Demo supervisor is already running.'); return
    for port, path in [(8787, '/api/health'), (8000, '/health')]:
        if healthy(f'http://127.0.0.1:{port}{path}'):
            raise SystemExit(f'Port {port} already has a service; do not start a second demo.')
    with (DEMO / 'supervisor.log').open('a') as log:
        subprocess.Popen([sys.executable, str(Path(__file__).resolve()), '--supervise'], cwd=ROOT,
                         stdout=log, stderr=log, start_new_session=True, stdin=subprocess.DEVNULL)
    print('Starting demo: http://localhost:8787/learnsight (logs: .demo/)')


if __name__ == '__main__':
    main()
