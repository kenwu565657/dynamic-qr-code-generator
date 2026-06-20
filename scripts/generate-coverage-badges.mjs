import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const summaryPath = join(process.cwd(), 'coverage', 'coverage-summary.json');
const outputDir = join(process.cwd(), 'coverage-badges', 'badges');

const summary = JSON.parse(readFileSync(summaryPath, 'utf8'));
const { total } = summary;

const metrics = {
  statements: total.statements,
  branches: total.branches,
  functions: total.functions,
  lines: total.lines,
};

mkdirSync(outputDir, { recursive: true });

const colorForPct = (pct) => {
  if (pct >= 95) {
    return 'brightgreen';
  }

  if (pct >= 90) {
    return 'green';
  }

  if (pct >= 80) {
    return 'yellowgreen';
  }

  if (pct >= 70) {
    return 'yellow';
  }

  if (pct >= 60) {
    return 'orange';
  }

  return 'red';
};

const formatPct = (pct) => `${Number(pct.toFixed(2))}%`;

for (const [label, metric] of Object.entries(metrics)) {
  const badge = {
    schemaVersion: 1,
    label,
    message: formatPct(metric.pct),
    color: colorForPct(metric.pct),
  };

  writeFileSync(join(outputDir, `${label}.json`), JSON.stringify(badge));
}

writeFileSync(
  join(process.cwd(), 'coverage-badges', 'index.html'),
  [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="utf-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1" />',
    '  <title>Coverage Badges</title>',
    '</head>',
    '<body>',
    '  <p>Coverage badge JSON for Dynamic QR Code Generator.</p>',
    '</body>',
    '</html>',
  ].join('\n')
);