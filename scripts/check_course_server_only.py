"""Verify Next rejects importing either private module into the client graph.

Requires npm ci. Temporary source/build copies are deleted, and compiler output
is never printed or retained: a regression must not expose protected data in
logs/test artifacts. This checks a code boundary, not authentication.
"""
from pathlib import Path
import os
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]


def main():
    if not (ROOT / 'node_modules/next').is_dir():
        raise SystemExit('Run npm ci first')
    probes = {
        'curriculum': "import { FOREX_LESSONS } from '@/lib/server/curriculum';\nexport default function Probe() { return <div>{FOREX_LESSONS.length}</div>; }\n",
        'quizData': "import { getQuizForLesson } from '@/lib/server/quizData';\nexport default function Probe() { return <div>{getQuizForLesson(1).length}</div>; }\n",
    }
    for name, probe in probes.items():
        with tempfile.TemporaryDirectory(prefix='course-boundary-probe-') as directory:
            temp = Path(directory)
            shutil.copy(ROOT / 'package.json', temp / 'package.json')
            shutil.copy(ROOT / 'tsconfig.json', temp / 'tsconfig.json')
            shutil.copytree(ROOT / 'lib/server', temp / 'lib/server')
            shutil.copy(ROOT / 'lib/curriculum-types.ts', temp / 'lib/curriculum-types.ts')
            (temp / 'node_modules').symlink_to(ROOT / 'node_modules', target_is_directory=True)
            (temp / 'app').mkdir()
            (temp / 'app/layout.tsx').write_text('export default function Layout({children}: {children: React.ReactNode}) { return <html><body>{children}</body></html>; }\n')
            (temp / 'app/page.tsx').write_text("'use client';\n" + probe)
            env = {key: os.environ[key] for key in ('PATH', 'HOME', 'TMPDIR') if key in os.environ}
            env.update({'NODE_ENV': 'production', 'NEXT_TELEMETRY_DISABLED': '1'})
            result = subprocess.run([str(ROOT / 'node_modules/.bin/next'), 'build', '--webpack'], cwd=temp, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=120)
            output = result.stdout.decode(errors='replace')
            if result.returncode == 0:
                raise SystemExit(f'FAIL: {name} entered client graph; private probe artifacts removed')
            if 'server-only' not in output or not ('Client Component' in output or 'Server Component' in output or 'client component' in output):
                raise SystemExit(f'FAIL: {name} build failed for an unconfirmed reason; compiler output suppressed')
        print(f'PASS: Next production build rejected client import of guarded {name}; temporary artifacts removed')


if __name__ == '__main__':
    main()
