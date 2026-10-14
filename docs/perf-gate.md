# Atlas 3D performance gate

Freddy's October 14, 2026 rebuild. Started from clean main HEAD `ee74817920c600fb109b5ef70bdf194ac5e242f3` in a managed worktree; the original checkout's pre-existing Wrangler formatting edit is preserved. Test infrastructure only; no push, deployment, or remote Cloudflare commands.

## Part 1 — unchanged gate

Three consecutive runs of the original `tests/atlas-3d-perf.mjs`. No instrumentation was added: its existing JSON/table already reports cold/warm frame distributions and long tasks. Node 24.21.0, bundled Playwright 1.62.1, Chromium headless shell 1243, Windows ANGLE D3D11; desktop 1440×900, phone 390×844 at DPR 2 and 4× CPU throttle. Explicit `PLAYWRIGHT_MODULE` and `PLAYWRIGHT_EXECUTABLE_PATH` select those installed runtimes. Each invocation is `node tests/atlas-3d-perf.mjs` (the npm script's exact command).

**Environment limitation:** this was not a verified quiet machine. Total CPU samples during baseline measurement were 52.9% and 53.4%; other applications were active. A one-second process CPU sample included Claude (0.62 + 0.22 CPU seconds), ChatGPT (0.22 + 0.14), and Zen (0.14), alongside this gate's Chromium processes (1.52 + 0.31). The user was asked to pause heavy work. No unrelated process was stopped. Treat these data as loaded-machine observations, not the quiet-machine figures in Plan 22.

| Run | Exit | Seconds | Failed condition |
| --- | ---: | ---: | --- |
| 1 | 1 | 69.94 | phone warm long tasks: 19 > 17 + 1; both frame checks pass |
| 2 | 0 | 67.68 | none |
| 3 | 1 | 64.97 | desktop warm 1× p95: 2.8 > 1.1 × 1.15 + 1.5 = 2.765 ms |

All emitted raw values follow (milliseconds except counts). The old reporter does not emit 1× max or individual frame timings; no extra reporting was needed to characterize its decision inputs.

| Run | Device | Build | Phase | Flight median | Flight p95 | Flight max | 1× median | 1× p95 | Long tasks | Longest | Discs |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | desktop | 2D | cold | 2.3 | 4.5 | 15.8 | 0.7 | 1.2 | 0 | 0 | 77 |
| 1 | desktop | 2D | warm | 2.3 | 5 | 12 | 0.9 | 1.3 | 0 | 0 | 77 |
| 1 | desktop | 3D | cold | 3 | 7.8 | 18.2 | 1.3 | 1.9 | 0 | 0 | 77 |
| 1 | desktop | 3D | warm | 2.9 | 5.4 | 11.7 | 1.1 | 2.1 | 0 | 0 | 77 |
| 1 | phone | 2D | cold | 6.3 | 20.7 | 44.7 | 2.2 | 3.6 | 11 | 80 | 17 |
| 1 | phone | 2D | warm | 6 | 21.5 | 48.8 | 1.9 | 3.5 | 17 | 102 | 17 |
| 1 | phone | 3D | cold | 8.6 | 24.7 | 52.7 | 2.7 | 4.1 | 20 | 92 | 17 |
| 1 | phone | 3D | warm | 8.2 | 27.5 | 43.7 | 3.3 | 4.9 | 19 | 119 | 17 |
| 2 | desktop | 2D | cold | 2.2 | 5.1 | 13.5 | 0.9 | 1.5 | 0 | 0 | 77 |
| 2 | desktop | 2D | warm | 2.2 | 5 | 9 | 0.7 | 1.2 | 0 | 0 | 77 |
| 2 | desktop | 3D | cold | 2.6 | 7.7 | 14.2 | 0.9 | 1.5 | 0 | 0 | 77 |
| 2 | desktop | 3D | warm | 3.5 | 6.6 | 18.9 | 1.5 | 2.1 | 0 | 0 | 77 |
| 2 | phone | 2D | cold | 5.7 | 23.5 | 41 | 1.7 | 2.9 | 15 | 85 | 17 |
| 2 | phone | 2D | warm | 6.4 | 22.1 | 46.5 | 2.2 | 3.3 | 9 | 76 | 17 |
| 2 | phone | 3D | cold | 8.5 | 19.9 | 53 | 3.1 | 5.7 | 21 | 89 | 17 |
| 2 | phone | 3D | warm | 7.3 | 17.5 | 37.4 | 2.6 | 3.9 | 10 | 71 | 17 |
| 3 | desktop | 2D | cold | 2.2 | 5.5 | 16.9 | 0.6 | 1.1 | 0 | 0 | 77 |
| 3 | desktop | 2D | warm | 2.2 | 5.7 | 10.9 | 0.6 | 1.1 | 0 | 0 | 77 |
| 3 | desktop | 3D | cold | 2.2 | 6.9 | 26.7 | 0.8 | 1.4 | 0 | 0 | 77 |
| 3 | desktop | 3D | warm | 2.4 | 5.2 | 11.2 | 1 | 2.8 | 0 | 0 | 77 |
| 3 | phone | 2D | cold | 6 | 17.1 | 46.9 | 1.7 | 3.4 | 10 | 72 | 17 |
| 3 | phone | 2D | warm | 6.2 | 17 | 38.5 | 1.8 | 2.9 | 9 | 67 | 17 |
| 3 | phone | 3D | cold | 8.1 | 21.8 | 58.5 | 2.2 | 3.5 | 23 | 128 | 17 |
| 3 | phone | 3D | warm | 5.7 | 15.1 | 36.6 | 1.6 | 3.1 | 3 | 56 | 17 |

Baseline wall-clock median: **67.68 s**. Raw logs and JSON are retained locally under `outputs/perf-gate/baseline-{1,2,3}.{log,json}` (ignored).

## Rebuild plan

Preserve the 241-frame 1×→9×→1× flight, 120-frame still workload, devices, throttle, GPU flags, and original frame margins (desktop 1.15× + 1.5 ms, phone 1.15× + 3 ms). First try the median of three complete warm repetitions per build and device, with a single cold flight per page as warm-up/diagnostics. Keep the +1 long-task allowance, applied to median counts. Alternate build order between repetitions and device order between rounds. Run measurements serially.

Three repetitions target the runtime constraint: four configurations × (one cold + three warm) = 16 full flights, versus the original eight. Five warm repetitions would require 24 full flights, about 3× the old gate before setup savings; use configurable `PERF_REPS` for that longer trade-off. Acceptance depends on actual sensitivity and stability evidence, not this estimate.
