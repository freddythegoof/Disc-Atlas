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

Preserve the 241-frame 1×→9×→1× flight, 120-frame still workload, devices, throttle, GPU flags, and original frame margins (desktop 1.15× + 1.5 ms, phone 1.15× + 3 ms). First try the median of three complete warm repetitions per build and device, with a single cold flight per page as warm-up/diagnostics. Keep the +1 long-task allowance, applied to median counts. Alternate build order between repetitions; device order remains desktop then phone. Run measurements serially.

Three repetitions target the runtime constraint: four configurations × (one cold + three warm) = 16 full flights, versus the original eight. Five warm repetitions would require 24 full flights, about 3× the old gate before setup savings; use configurable `PERF_REPS` for that longer trade-off. Acceptance depends on actual sensitivity and stability evidence, not this estimate.

## Part 2 — decision rule

Implemented the plan above without changing any numeric margin. For each device, take the median of the repetition p95s independently for 2D and 3D, for flight and 1×. A frame check fails strictly above `median(2D p95) × 1.15 + slack`, slack **1.5 ms desktop / 3 ms phone**. Long tasks fail strictly above `median(2D count) + 1`. All six metrics must pass both aggregate checks described below; no pooling across devices or phases, percentile of pooled frames, outlier removal, retry-until-green, or tolerance adjustments. Even repetition counts use the mean of the two middle values.

**Why these numbers:** 1.15, 1.5 ms, 3 ms, and +1 are unchanged from the original gate; Part 1's variance is a reason to aggregate, not to widen them. Three warm repetitions are the smallest odd sample with a nontrivial median and fit the measured runtime budget. Set `PERF_REPS=5` (or a larger integer) for more resistance to outliers at additional runtime. Values below 3, fractions, empty or nonnumeric values fail before launching Chromium. This is a median over repeated full flights on retained warmed pages, not fresh-browser repetitions; caches/process state may correlate repetitions. A new invocation creates a fresh browser and contexts.

One cold flight per build remains diagnostic only, as before. Every warm repetition still has 241 flight draw-time samples and 120 still samples. The original FLIGHT measurement code is unchanged. Only the orchestration and decision change. 2D/3D order alternates 3D-first, 2D-first, 3D-first; measurements are serial, including across devices. Retaining two pages per device amortizes setup. Each measured row checks 3D `ready` / 2D `off` and reports actual render/disc counts, so disabling 3D cannot create a green result.

Every run prints all cold/warm rows (including frame median, p95, max, sample counts, long-task count/longest task, discs, state, renders), six median/limit checks plus paired excesses and both failure flags, and elapsed seconds. `outputs/atlas-3d/perf.json` now contains `{reps, elapsedSeconds, rows, summary, error?}` rather than the old bare row array; no repository reader consumes the old file. A red assertion also writes the full report before closing Chromium/the local server. Partial reports survive browser/state errors.

### Initial rebuilt run

| Device | Check | 3D median | 2D median | Limit | Verdict |
| --- | --- | ---: | ---: | ---: | --- |
| desktop | flight p95 | 4 | 4 | 6.1 | pass |
| desktop | 1x p95 | 1.3 | 0.9 | 2.535 | pass |
| desktop | long tasks | 0 | 0 | 1 | pass |
| phone | flight p95 | 10.4 | 10.9 | 15.535 | pass |
| phone | 1x p95 | 3.8 | 3.1 | 6.565 | pass |
| phone | long tasks | 1 | 0 | 1 | pass |

Exit 0; external wall-clock **112.41 s**, **1.66×** the old median 67.68 s (report timer 111.99 s excludes final teardown). This is one exploratory result, not stability proof. Lower absolute values than Part 1 reinforce the loaded-machine limitation. Full raw distribution: `outputs/perf-gate/rebuild-first.{log,json}`.

Validation so far: browser-free `--self-test` first failed because the median implementation was absent, then passed after implementation; covers isolated outliers, sustained flight/1×/long-task regressions, exact limits, odd/even medians, and invalid repetition inputs. Related `node --test tests/atlas-lod.mjs`: **7/7 pass** (retried outside sandbox after its child-process spawn was denied). Static review found no Critical/Important issue; its device-order documentation mismatch was corrected. Mutation and stability evidence follows in subsequent parts.

### Paired sensitivity guard

An exploratory +40% mutation exposed a central-tendency trap: desktop independent medians passed (6.5 ms 3D vs 4.6 ms 2D, limit 6.79), although paired flight excesses over the original limit were **+1.01, −1.265, +0.745 ms**. Two of three original flight comparisons were red, but sorting each build independently hid that persistent relative slowdown. The phone made that exploratory gate red; relying on it alone would leave desktop coverage weaker.

The final rule therefore also takes `median(3D_i − (2D_i × multiplier + allowance))` for every metric, matching repetitions by measurement order. Fail if this paired median excess is strictly positive **or** the independent-median check fails. Use the same multiplier and allowance: frame 1.15 and device slack, long tasks 1 and +1. Zero means exactly the original limit, not a new tolerance. The +40% desktop sample now has paired median excess +0.745 ms and fails. A single isolated bad pair remains insufficient at three reps. Even repetition counts average the two middle excesses; this is a median guard, not always a strict-majority vote.

This adds sensitivity without increasing sample count, wall-clock workload, or any margin. It can add reds under sequential timing noise, which is why Part 4 must exercise this final combined rule. JSON/table output includes every paired excess, the paired median excess, independent/paired failure flags, and the combined verdict. The measured crossed-median fixture first failed the self-test under the initial rule, then passed after adding the guard; self-tests also cover crossed long-task counts, phone slack, and mismatched/empty pairs. The initial unmutated report re-evaluates green under both aggregate checks, but the required final browser runs follow. Exploratory mutation logs are kept as `outputs/perf-gate/exploratory-mutation-{40,15}.{log,json}`; they are not the final sensitivity proof.

## Part 3 — final mutation proof

Temporary local changes in this test only wrapped the real page `draw()` function for 3D pages after load. Each call executed its real draw, measured its elapsed duration, then burned CPU until `start + duration × (1 + cost)`. Cost was 0.40, then 0.15. 2D pages were unmodified. This adds actual render-path work, not synthetic report values, sleeps, or changed thresholds. Temporary parallel arrays recorded the underlying draw duration for the same measured flight/still frames. Busy-wait quantization and scheduler preemption make the realized p95 increase approximate; calibration is below. No product file was patched.

Both final runs used three repetitions and the final independent-plus-paired rule. Every repetition and assertion was printed/saved.

| Target extra draw cost | Exit | External seconds | Device | Check | 3D median | 2D median | Independent limit | Paired median excess | Failure flags (independent / paired) |
| --- | ---: | ---: | --- | --- | ---: | ---: | ---: | ---: | --- |
| +40% | 1 | 126.88 | desktop | flight p95 | 6.5 | 4.2 | 6.33 | 0.47 | FAIL / FAIL |
| +40% | 1 | 126.88 | desktop | 1x p95 | 2.1 | 1.2 | 2.88 | -0.78 | pass / pass |
| +40% | 1 | 126.88 | desktop | long tasks | 0 | 0 | 1 | -1 | pass / pass |
| +40% | 1 | 126.88 | phone | flight p95 | 27.8 | 16.6 | 22.09 | 5.71 | FAIL / FAIL |
| +40% | 1 | 126.88 | phone | 1x p95 | 5 | 3.3 | 6.795 | -1.795 | pass / pass |
| +40% | 1 | 126.88 | phone | long tasks | 20 | 6 | 7 | 16 | FAIL / FAIL |
| +15% | 1 | 122.66 | desktop | flight p95 | 6.1 | 4.8 | 7.02 | -1 | pass / pass |
| +15% | 1 | 122.66 | desktop | 1x p95 | 2.4 | 1.1 | 2.765 | -0.365 | pass / pass |
| +15% | 1 | 122.66 | desktop | long tasks | 0 | 0 | 1 | -1 | pass / pass |
| +15% | 1 | 122.66 | phone | flight p95 | 23.7 | 12.4 | 17.26 | 0.875 | FAIL / FAIL |
| +15% | 1 | 122.66 | phone | 1x p95 | 6.2 | 3.6 | 7.14 | -1.055 | pass / pass |
| +15% | 1 | 122.66 | phone | long tasks | 12 | 3 | 4 | 8 | FAIL / FAIL |

Calibration and raw warm rows follow. “Base” is the actual draw duration inside the wrapper before the added work, in the same mutated invocation; it is not a separate quiet control run. All frame times are ms.

| Target | Device | Build | Rep | Base flight p95 | Measured flight p95 | Base 1× p95 | Measured 1× p95 | Long tasks |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| +40% | desktop | 3D | 1 | 4.4 | 6.2 | 1.3 | 1.9 | 0 |
| +40% | desktop | 2D | 1 | 3.5 | 3.5 | 0.9 | 0.9 | 0 |
| +40% | desktop | 2D | 2 | 4.2 | 4.2 | 1.2 | 1.2 | 0 |
| +40% | desktop | 3D | 2 | 4.8 | 6.8 | 1.5 | 2.1 | 0 |
| +40% | desktop | 3D | 3 | 4.6 | 6.5 | 1.5 | 2.2 | 0 |
| +40% | desktop | 2D | 3 | 7.2 | 7.2 | 1.5 | 1.5 | 0 |
| +40% | phone | 3D | 1 | 19.2 | 26.9 | 3.3 | 5 | 23 |
| +40% | phone | 2D | 1 | 17.1 | 17.1 | 3.3 | 3.3 | 6 |
| +40% | phone | 2D | 2 | 16.5 | 16.5 | 3 | 3 | 3 |
| +40% | phone | 3D | 2 | 21.5 | 30.2 | 3.6 | 5.2 | 20 |
| +40% | phone | 3D | 3 | 19.8 | 27.8 | 3.5 | 5 | 17 |
| +40% | phone | 2D | 3 | 16.6 | 16.6 | 3.4 | 3.4 | 7 |
| +15% | desktop | 3D | 1 | 5.2 | 6.1 | 2.1 | 2.5 | 0 |
| +15% | desktop | 2D | 1 | 4.8 | 4.8 | 1.1 | 1.1 | 0 |
| +15% | desktop | 2D | 2 | 4 | 4 | 0.9 | 0.9 | 0 |
| +15% | desktop | 3D | 2 | 4.4 | 5.1 | 1.3 | 1.5 | 0 |
| +15% | desktop | 3D | 3 | 6 | 7 | 2 | 2.4 | 2 |
| +15% | desktop | 2D | 3 | 5.7 | 5.7 | 1.1 | 1.1 | 0 |
| +15% | phone | 3D | 1 | 12.8 | 14.8 | 3.1 | 3.6 | 1 |
| +15% | phone | 2D | 1 | 9.5 | 9.5 | 2.7 | 2.7 | 0 |
| +15% | phone | 2D | 2 | 12.4 | 12.4 | 3.6 | 3.6 | 3 |
| +15% | phone | 3D | 2 | 20.6 | 23.7 | 7.6 | 8.9 | 12 |
| +15% | phone | 3D | 3 | 24.6 | 28.8 | 5.3 | 6.2 | 23 |
| +15% | phone | 2D | 3 | 22.9 | 22.9 | 3.7 | 3.7 | 14 |

| Target | Device | Median base → inflated flight p95 | Realized p95 increase |
| --- | --- | --- | ---: |
| +40% | desktop | 4.6 → 6.5 ms | 41.3% |
| +40% | phone | 19.8 → 27.8 ms | 40.4% |
| +15% | desktop | 5.2 → 6.1 ms | 17.3% |
| +15% | phone | 20.6 → 23.7 ms | 15.0% |

**Sensitivity result:** +40% is caught on both desktop and phone flight p95 (phone long tasks also fail). In that final run, underlying base flight times pass the original frame relationship before added cost; the inflated times fail it, so the cost measurably crosses the gate rather than relying only on an already-red frame baseline. The paired guard also catches the exploratory desktop crossed-median hole without moving a threshold. These are direct sensitivity checks of the old decision's intent under repetition.

**+15% result: observed FAIL, but an uncertain causal sensitivity floor.** Desktop passes all checks at this cost. Phone flight and long tasks fail. Phone's same-run base flight p95 median is already above its independent-median limit before the extra cost, so this run cannot establish that a clean 15% regression alone would fail. The exploratory +15% run also failed, only on phone long tasks, which remain noisy under load. Do not claim universal 15% detection: additive margins allow some percentage slowdowns, timing varies, and these were loaded-machine measurements. The proven injected frame-cost point here is roughly +40%; desktop sensitivity lies above this observed +15% pass and at/below the observed +40% failure for these samples. Quiet paired controls would be needed to locate a smaller general floor.

Restoration: the runner's `finally` copied the exact pre-mutation test back, removed its process-only flag, and `git diff --exit-code -- tests/atlas-3d-perf.mjs` plus `git status --short` returned no changes. No injection or env hook is committed. Ignored `outputs/perf-gate/mutation-{40,15}.{log,json}` retain the full raw distribution; the committed test has no mutation flag.

## Part 4 — five consecutive unchanged runs

The final committed rule ran five times consecutively with default `PERF_REPS=3`, a new browser per invocation, no test edits between runs, no skipped failures, and no retry window. Other heavy work continued as the user requested. Times below are October 14, 2026, America/New_York. CPU is whole-machine utilization averaged over each complete run using `os.cpus()` time deltas; it includes the gate itself. Baseline CPU figures were one-second spot samples, so the two measurement windows are not directly comparable estimates of background load. No other browser benchmark was started by this task during the window.

| Run | Start → end | Exit | External seconds | Mean CPU busy | Failed condition |
| --- | --- | ---: | ---: | ---: | --- |
| 1 | 15:38:44 → 15:40:35 | 0 | 111.149 | 22.6% | none |
| 2 | 15:40:35 → 15:42:26 | 0 | 110.75 | 21.6% | none |
| 3 | 15:42:26 → 15:44:22 | 1 | 116.339 | 34.6% | phone long tasks (independent + paired) |
| 4 | 15:44:22 → 15:46:19 | 1 | 117.111 | 40% | desktop flight p95 (paired) |
| 5 | 15:46:19 → 15:48:20 | 0 | 120.497 | 45.2% | none |

Every run's medians follow. Flight/1× columns are **3D / 2D**, in ms; long tasks are counts. Paired excesses are flight ms / 1× ms / task count; positive means red. Verdict is per device, with either aggregate failure sufficient.

| Run | Device | Flight p95 3D / 2D | 1× p95 3D / 2D | Long tasks 3D / 2D | Paired median excesses | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | desktop | 3.7 / 3.2 | 1.1 / 0.6 | 0 / 0 | -1.595 / -1.09 / -1 | pass |
| 1 | phone | 11 / 10 | 3.4 / 2.9 | 1 / 0 | -2.78 / -2.935 / 0 | pass |
| 2 | desktop | 3.6 / 3.2 | 1 / 0.6 | 0 / 0 | -1.58 / -1.19 / -1 | pass |
| 2 | phone | 10.5 / 10 | 3.9 / 2.8 | 0 / 2 | -4 / -2.55 / -2 | pass |
| 3 | desktop | 3.7 / 3.1 | 1.2 / 0.6 | 0 / 0 | -1.365 / -0.99 / -1 | pass |
| 3 | phone | 15.4 / 19 | 3.6 / 2.6 | 8 / 6 | -3.93 / -2.39 / 1 | FAIL |
| 4 | desktop | 6.2 / 4.3 | 1.9 / 1 | 0 / 0 | 0.445 / -0.765 / -1 | FAIL |
| 4 | phone | 10.8 / 13.8 | 3.8 / 2.7 | 0 / 4 | -4.99 / -2.42 / -1 | pass |
| 5 | desktop | 5.3 / 4.3 | 1.6 / 0.9 | 0 / 0 | -1.145 / -1.135 / -1 | pass |
| 5 | phone | 20.1 / 20.6 | 3.9 / 2.6 | 7 / 11 | -7.855 / -2.16 / -1 | pass |

**Observed stability: 3/5 pass; target 5/5 was not achieved.** Run 3's phone long-task median is 8 versus 6 (limit 7); its paired excess is +1. Run 4's desktop independent median flight check passes (6.2 versus 4.3, limit 6.445), but the paired excesses are +0.755, −2.515, +0.445 ms and median +0.445, so the sensitivity guard correctly keeps that result red under the original per-pair margins. These are unchanged-tree failures; this experiment does not establish their cause or quiet-machine stability. CPU averages ranged 21.6%–45.2%. The higher-load run 5 passed, so load is a limitation, not proof that it caused either failure. No allowance or rule was loosened after this window. The candidate is retained locally for review, without claiming acceptance of the 5/5 goal.

Full distributions (16 cold/warm rows per invocation, every raw emitted number and all decision flags) are in ignored `outputs/perf-gate/stability-{1,2,3,4,5}.{log,json}`. The five-run runner is `outputs/perf-gate/run-stability.cjs`; it records exit, external elapsed time, CPU deltas, and timestamps, and continues through red assertions to complete exactly five runs.

### Runtime before / after

| Gate | Runs | External wall-clock range | Median | Ratio to original median |
| --- | ---: | --- | ---: | ---: |
| Original single warm run | 3 | 64.97–69.94 s | 67.68 s | 1× |
| Final median + paired guard, 3 warm repetitions | 5 | 110.75–120.50 s | 116.34 s | 1.72× |

The observed default gate stays below the ~2× target. Five warm repetitions are available with `PERF_REPS=5`, but would require 24 full flights instead of the original eight (rather than the default 16); budget approximately 3× original flight time before setup savings. That longer option was not used to replace or hide the failed stability window. Runtime and pass rates were observed under changing load, not a controlled quiet before/after comparison.

### How to read a red run

Start with the device and metric in the summary, then read `medianFailed` and `pairedFailed`. The independent limit is 2D's median p95 × 1.15 plus 1.5 ms desktop or 3 ms phone; long tasks use 2D's median +1. A positive paired median excess means the original comparison repeatedly went over its allowance even if independent medians look green. Match 2D/3D rows by device and rep to see those pairs. Rep 0 is cold diagnostics only; warm rows supply the verdict. Check max/longest values for spikes, the 241/120 sample counts, equal disc counts, and 3D `ready` / 2D `off`. Keep the full `outputs/atlas-3d/perf.json` and log when investigating. If other work is active, record that and repeat on a quiet machine without dropping the original red result; do not adjust margins from a single run.

## Verification and local delivery

Aggregation self-tests, syntax checking, and the seven related LOD tests passed. The final FLIGHT body matches the original after normalizing Windows line endings. Static review found no outstanding code issue. Full browser evidence is reported above, including both red stability runs and the +15% uncertainty; unrelated product browser suites were not rerun. Only `tests/atlas-3d-perf.mjs` and this document changed. `public/data.json`, other tests, product code, and the original checkout's Wrangler edit remain untouched. The mutation hook is absent and the worktree is clean after each scoped commit.

Four local commits on `codex/atlas-perf-medians`: Part 1 characterization, Part 2 test rebuild, Part 3 mutation evidence, Part 4 this stability/runtime write-up. No push, deployment, or remote Cloudflare command. The recorded 3/5 stability result is not a successful quiet acceptance run; any further attempt follows Freddy's requested Claude Sonnet high, then Opus routing.
