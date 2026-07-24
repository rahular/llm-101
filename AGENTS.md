# AGENTS.md — working on the LLM Internals site

Guidance for coding agents (and humans) making changes to this repo. Read this before
editing; the conventions below are load-bearing.

## What this is

A static, self-contained reading course on LLM internals: 25 topic pages under `topics/`,
each with prose, formulas, **runnable PyTorch cells** (executed by a small local kernel),
and check-off exercises. No build step, no framework, no external JS/CSS dependencies.

```
index.html                  landing page (hero, topic cards, progress)
topics/<id>.html            one page per topic
assets/js/site.js           TOPICS manifest + all shared behavior (nav, cells, exercises, pager)
assets/js/kernel-runner.js  client for the kernel -> window.runPython(code)
assets/css/style.css        design system (light/dark via prefers-color-scheme)
kernel/server.py            local PyTorch kernel on 127.0.0.1:8177 (executes cell code)
tools/verify_cells.py       regression test: runs every cell through the kernel
start.sh                    start/stop both servers (./start.sh, ./start.sh stop)
```

## Run & verify

```bash
./start.sh                        # page server :8137 + PyTorch kernel :8177
python3 tools/verify_cells.py     # every runnable cell must pass (currently 75/75)
```

**Any change that touches cell code must end with a green `verify_cells.py` run.**
For visual changes, load the affected page in a browser and check both light and dark
mode. The kernel executes arbitrary Python from the pages — it binds to localhost only;
never expose it beyond 127.0.0.1.

## The topic manifest (single source of truth)

Nav sidebar, index cards, and prev/next pagers are all generated from the `TOPICS` array
in `assets/js/site.js`. To add a page:

1. Add an entry to `TOPICS` (id must equal the filename stem and the page's
   `<body data-topic="…">`) and, if it's a new group, to `GROUP_ORDER`.
2. Create `topics/<id>.html` by copying an existing page's skeleton (sidebar, crumb,
   eyebrow `Topic NN · <Group>`, `<div id="pager">`, both `<script>` tags at the bottom).
3. Keep numbering monotonic in nav order — the array order IS the pager order.

## Page anatomy & contracts

- **Runnable cell**: `<div class="code-cell" data-id="<unique-id>">` containing a
  toolbar (Run/Reset buttons), a `<textarea class="code-src">` with the code, and
  `<pre class="code-out" hidden>`. `data-id`s must be unique per page (localStorage
  keys derive from them). Cell code is plain PyTorch/Python — self-contained, seeded
  (`torch.manual_seed`), CPU-friendly, finishing in a few seconds, and ending with
  `print(...)` output that *demonstrates the claim made in the surrounding prose*.
- **Read-only reference code**: `<div class="code-view" data-file="name.py">` wrapping
  `<script type="text/x-python">RAW CODE</script>`. Raw text — no HTML escaping needed;
  never put a literal `</script>` inside. Highlighted client-side; gets a copy button.
- **Exercise**: `<div class="exercise" data-id="<local-id>">` with a
  `.exercise-done-toggle` checkbox. Completion is stored as `ex:<topic-id>:<local-id>`.
- **Callouts**: `callout` (neutral), `callout insight` (key takeaway, teal),
  `callout gotcha` (pitfall, red). Every topic page ends with a
  `Checklist before you call this "sharp"` insight callout.
- **Formulas**: `<div class="formula">` collapses whitespace — use explicit `<br />`
  between lines.
- Cross-link concept pages liberally (`<a href="other-topic.html">`), relative hrefs only.

## Code style in cells and reference blocks

- **Descriptive dimension names, always**: `batch, seqlen, d_model, n_heads, head_dim,
  n_kv_heads, max_seqlen`. Never the CNN-style `B, T, C` / `n_embd` / `block_size` /
  `hs`/`hd`. Use `d_model` rather than bare `dim` (avoids clashing with the `dim=` axis
  kwarg). Legitimate exceptions: scaling-law cells (`C` = compute, `D` = data tokens),
  set/matrix variables that aren't tensor dims.
- Annotate shapes in comments at every reshape/transpose: `# (batch, n_heads, seqlen, head_dim)`.
- PyTorch idioms over hand-rolled math where a stable/fused op exists
  (`F.scaled_dot_product_attention`, `F.cross_entropy` from logits, `clip_grad_norm_`).

## Content rules

- **Audience-neutral.** This is general reading material. No references to interviews,
  job descriptions, specific employers, or any individual's personal context. Motivate
  topics on their own merits.
- Claims should be demonstrable (runnable cell) or sourced (papers/reports linked in a
  `<p class="footnote">Sources: …</p>`). Case-study pages about post-2024 models must be
  grounded in the actual technical reports — verify against primary sources; don't write
  frontier-model specifics from memory.
- Tone: precise, first-principles, opinionated about trade-offs. Explain *why* before *what*.

## Cache busting (easy to forget, user-visible when missed)

Every HTML file references assets as `style.css?v=N`, `site.js?v=N`, `kernel-runner.js?v=N`.
**If you edit `site.js`, `style.css`, or `kernel-runner.js`, bump N in all 26 HTML files**:

```bash
sed -i '' -E 's#\?v=OLD"#?v=NEW"#g' index.html topics/*.html
```

(Check the current N with `grep -o 'v=[0-9]*' index.html | head -1`.) HTML-only changes
don't need a bump.

## Pre-commit checklist

- [ ] `python3 tools/verify_cells.py` — all cells pass
- [ ] New/renamed pages: `data-topic` == filename stem == `TOPICS` id; pager renders
- [ ] All internal `href`s resolve to existing files
- [ ] `<script>`/`<textarea>` tags balanced; file ends with `</html>`
- [ ] Asset version bumped if JS/CSS changed
- [ ] No interview/employer/personal references introduced
