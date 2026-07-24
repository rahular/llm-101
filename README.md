# LLM Internals

A local, self-contained reading course on the internals of large language models —
architecture, training science, distributed systems, data, and post-training.
Each topic is one page with **runnable PyTorch cells** (real `torch`, executed by a small
local kernel) and exercises you can check off. Progress and code edits persist in the
browser's `localStorage`.

## Starting the servers

The site needs two processes: a static file server for the pages (port **8137**) and the
PyTorch kernel that executes the code cells (port **8177**, needs `pip install torch`).

**Quick start — one command:**

```bash
cd /Users/aralikatte/code/random/llm-101
./start.sh          # starts both in the background (logs in /tmp/prep-*.log)
./start.sh stop     # stops both
```

**Or manually, in two terminals:**

```bash
python3 -m http.server 8137     # terminal 1: the pages
python3 kernel/server.py        # terminal 2: the PyTorch kernel
```

Then open <http://localhost:8137>. The status pill (bottom-right) shows the kernel
connection — **green** (`● PyTorch … · mps/cuda/cpu`) means cells will run; grey means
start the kernel. Without the kernel, cells stay editable but won't execute. Both
commands are safe to re-run — `start.sh` skips anything already running.

## Structure

```
index.html                 landing page + progress
start.sh                   start/stop both servers (./start.sh, ./start.sh stop)
kernel/server.py           local PyTorch kernel (127.0.0.1:8177) — runs the cells
tools/verify_cells.py      regression test: runs every cell through the kernel
AGENTS.md                  conventions & contracts for contributors (and coding agents)
assets/css/style.css       design system (light/dark aware)
assets/js/site.js          nav manifest, code cells, exercises, progress
assets/js/kernel-runner.js client for the kernel -> window.runPython()
topics/*.html              one page per topic
```

## Status

All 25 topics are full deep-dive pages with runnable cells and exercises:

| # | Topic |
|---|-------|
| 01 | Python & Tensor Fluency |
| 02 | Transformer Internals |
| 03 | Attention: Scratch → Efficient |
| 04 | Training Dynamics & Optimizers |
| 05 | Numerics & Precision |
| 06 | Scaling Laws & Experiment Design |
| 07 | Distributed Training & Parallelism |
| 08 | Accelerators & Performance |
| 09 | Infra, K8s & Dev Tooling |
| 10 | Data & Tokenization |
| 11 | Interpretability & Viz |
| 12 | Attention Variants & SSMs |
| 13 | Optimizer Frontier |
| 14 | Synthetic Data |
| 15 | RL for Post-training |
| 16 | On-Policy Self-Distillation |
| 17 | Standard Transformer (code) |
| 18 | RoPE & Modern Blocks (code) |
| 19 | The Training Loop (code) |
| 20 | Newer Architectures (code) |
| 21 | KV-Cache Inference (code) |
| 22 | Case Study: DeepSeek-V4 |
| 23 | Case Study: Qwen 3.6 |
| 24 | Case Study: The Kimi Line |
| 25 | Case Study: Inkling + Synthesis |

Every page ends with a "before you call this sharp" self-assessment checklist. Cells with
a `Local exercise` badge are meant to be done on your own machine with real PyTorch.

## Adding / editing a page

- Topic list and metadata live in `assets/js/site.js` (`TOPICS` array) — nav, cards, and
  pager all derive from it.
- Code cell contract: `<div class="code-cell" data-id="unique-id">` with a
  `.code-cell-toolbar` (Run/Reset buttons), a `.code-src` textarea, and a `.code-out` pre.
- Exercise contract: `<div class="exercise" data-id="local-id">` with a
  `.exercise-done-toggle input` checkbox; completion is keyed `ex:<topic>:<local-id>`.
