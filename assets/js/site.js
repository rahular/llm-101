/* ============================================================
   Site shell: nav manifest, sidebar, code cells, exercises, progress.
   ============================================================ */

const TOPICS = [
  { id: "python-pytorch",        num: "01", title: "Python & Tensor Fluency",        group: "Foundations",        status: "deep",    runnable: true,  priority: true,
    desc: "Think in tensors: broadcasting, einsum, reshape/permute, indexing, the autograd mental model." },
  { id: "transformer-internals", num: "02", title: "Transformer Internals",           group: "Foundations",        status: "deep",    runnable: true,
    desc: "Residual stream, pre/post-norm, RMSNorm, SwiGLU, RoPE, param counting, MoE." },
  { id: "attention",             num: "03", title: "Attention: Scratch → Efficient",  group: "Foundations",        status: "deep",    runnable: true,  priority: true,
    desc: "Self-attention from scratch, causal masking, MHA/GQA, KV cache, FlashAttention, roofline." },
  { id: "training-dynamics",     num: "04", title: "Training Dynamics & Optimizers",  group: "Training science",   status: "deep",    runnable: true,
    desc: "AdamW from scratch, warmup+cosine/WSD, grad clipping, loss spikes, batch size, init." },
  { id: "numerics-precision",    num: "05", title: "Numerics & Precision",            group: "Training science",   status: "deep",    runnable: true,
    desc: "bf16 vs fp16, master weights, loss scaling, stable softmax, determinism." },
  { id: "scaling-science",       num: "06", title: "Scaling Laws & Experiment Design", group: "Training science",  status: "deep",    runnable: true,
    desc: "6ND, Kaplan vs Chinchilla, IsoFLOP, power-law fitting, ablation design, eval noise." },
  { id: "distributed",           num: "07", title: "Distributed Training & Parallelism", group: "Systems",         status: "deep",    runnable: true,  priority: true,
    desc: "DP/FSDP/TP/PP/SP/EP, collectives, memory accounting, bubble, MFU — with calculators." },
  { id: "accelerators",          num: "08", title: "Accelerators & Performance",      group: "Systems",            status: "deep",    runnable: true,
    desc: "Memory hierarchy, roofline, interconnect, TPU/XLA, fault tolerance (MTBF, Young/Daly)." },
  { id: "infra-tooling",         num: "09", title: "Infra, K8s & Dev Tooling",        group: "Systems",            status: "deep",    runnable: true,
    desc: "K8s gang scheduling, resumable checkpoints, experiment infra, dev-tooling leverage." },
  { id: "data-tokenization",     num: "10", title: "Data & Tokenization",             group: "Data",               status: "deep",    runnable: true,  priority: true,
    desc: "BPE from scratch, dedup (MinHash/LSH), quality filtering, packing, data mixing." },
  { id: "interpretability",      num: "11", title: "Interpretability & Viz",          group: "Extras",             status: "deep",    runnable: true,
    desc: "Attention heatmaps/entropy, logit lens, linear probes, SAEs, building an internals visualizer." },
  { id: "attention-variants",    num: "12", title: "Attention Variants & SSMs",       group: "Frontier",           status: "deep",    runnable: true,
    desc: "Linear attention, Mamba/SSD, DeltaNet & Gated DeltaNet, MLA, sparse, hybrids." },
  { id: "optimizer-frontier",    num: "13", title: "Optimizer Frontier",              group: "Frontier",           status: "deep",    runnable: true,
    desc: "Lion, Shampoo/SOAP, and Muon (Newton–Schulz orthogonalization) at scale." },
  { id: "synthetic-data",        num: "14", title: "Synthetic Data",                  group: "Frontier",           status: "deep",    runnable: true,
    desc: "Distillation, Self/Evol-Instruct, rejection sampling/STaR, model collapse." },
  { id: "rl-post-training",      num: "15", title: "RL for Post-training",            group: "Frontier",           status: "deep",    runnable: true,
    desc: "RLHF/PPO, DPO family, GRPO & DAPO/GSPO, RLVR & reasoning RL." },
  { id: "on-policy-distillation", num: "16", title: "On-Policy Self-Distillation",     group: "Frontier",           status: "deep",    runnable: true,
    desc: "Student rollouts + dense teacher reverse-KL; exposure bias, mode-seeking, recovering lost skills." },
  { id: "code-standard-gpt",     num: "17", title: "Standard Transformer",             group: "Code",               status: "deep",    runnable: true,  code: true,
    desc: "Annotated PyTorch: fused MHA, causal mask, MLP, pre-norm block, full GPT + loss." },
  { id: "code-rope-modern",      num: "18", title: "RoPE & Modern Blocks",             group: "Code",               status: "deep",    runnable: true,  code: true,
    desc: "RMSNorm, RoPE (rotate_half), SwiGLU, SDPA attention, a Llama-style block." },
  { id: "code-training-loop",    num: "19", title: "The Training Loop",                group: "Code",               status: "deep",    runnable: true,  code: true,
    desc: "Batching, AdamW param groups, warmup+cosine, grad-accum, autocast, clip, checkpoint, generate." },
  { id: "code-newer-arch",       num: "20", title: "Newer Architectures (code)",       group: "Code",               status: "deep",    runnable: true,  code: true,
    desc: "GQA, MoE + aux loss, MLA sketch, sliding-window, and a Muon optimizer." },
  { id: "code-kv-cache",         num: "21", title: "KV-Cache Inference",               group: "Code",               status: "deep",    runnable: true,  code: true,
    desc: "Prefill vs decode, a KVCache class, cached attention, the generate loop, paging." },
  { id: "case-deepseek-v4",      num: "22", title: "Case Study: DeepSeek-V4",          group: "Case studies",       status: "deep",    runnable: true,
    desc: "CSA/HCA hybrid attention for 1M ctx, mHC stability, anticipatory routing, FP4 experts, specialist→OPD." },
  { id: "case-qwen",             num: "23", title: "Case Study: Qwen 3.6",             group: "Case studies",       status: "deep",    runnable: false,
    desc: "Gated DeltaNet : full attention 3:1 hybrid, tiny-active MoE, multi-step MTP self-speculation." },
  { id: "case-kimi",             num: "24", title: "Case Study: The Kimi Line",        group: "Case studies",       status: "deep",    runnable: false,
    desc: "K2's MuonClip/zero-spike run → K2.5 early-fusion vision + agent-swarm RL → K2.7 → K3's KDA." },
  { id: "case-inkling-synthesis", num: "25", title: "Case Study: Inkling + Synthesis", group: "Case studies",       status: "deep",    runnable: true,
    desc: "No-RoPE local/global attention, encoder-free multimodal, 30M-rollout RL — and the cross-model themes." },
];

const GROUP_ORDER = ["Foundations", "Training science", "Systems", "Data", "Extras", "Frontier", "Code", "Case studies"];

/* ---------- storage helpers ---------- */
const store = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

function exerciseIds() {
  return Object.keys(localStorage).filter((k) => k.startsWith("ex:"));
}
function isExDone(id) { return store.get("ex:" + id, false) === true; }
function setExDone(id, v) { store.set("ex:" + id, v); }

/* ---------- sidebar ---------- */
function buildSidebar(currentId) {
  const nav = document.getElementById("nav");
  if (!nav) return;
  let html = "";
  for (const group of GROUP_ORDER) {
    const items = TOPICS.filter((t) => t.group === group);
    if (!items.length) continue;
    html += `<div class="nav-group-label">${group}</div>`;
    for (const t of items) {
      const active = t.id === currentId ? " active" : "";
      const doneCount = countDoneForTopic(t.id);
      const statusBadge = t.status === "outline" ? `<span class="nav-status outline">outline</span>` : "";
      const check = doneCount > 0 && !statusBadge ? `<span class="nav-check">✓${doneCount}</span>` : "";
      html += `<a class="nav-item${active}" href="${navHref(t.id, currentId)}">
        <span class="nav-num">${t.num}</span>
        <span class="nav-label">${t.title}</span>
        ${statusBadge || check}
      </a>`;
    }
  }
  nav.innerHTML = html;
}

function navHref(targetId, currentId) {
  // index.html lives at root; topic pages live in topics/
  const onIndex = !currentId;
  return onIndex ? `topics/${targetId}.html` : `${targetId}.html`;
}

function countDoneForTopic(topicId) {
  return Object.keys(localStorage).filter(
    (k) => k.startsWith(`ex:${topicId}:`) && store.get(k, false) === true
  ).length;
}

/* ---------- code cells ---------- */
function enhanceCodeCells() {
  document.querySelectorAll(".code-cell").forEach((cell) => {
    const id = cell.dataset.id;
    const ta = cell.querySelector(".code-src");
    const out = cell.querySelector(".code-out");
    const runBtn = cell.querySelector(".btn-run");
    const resetBtn = cell.querySelector(".btn-reset");

    // preserve starter and restore any saved edits
    const starter = ta.value;
    cell.dataset.starter = starter;
    const saved = store.get("code:" + id, null);
    if (saved !== null) ta.value = saved;
    autoSize(ta);

    // tab inserts 4 spaces; save on input
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const s = ta.selectionStart, en = ta.selectionEnd;
        ta.value = ta.value.slice(0, s) + "    " + ta.value.slice(en);
        ta.selectionStart = ta.selectionEnd = s + 4;
      }
      // Ctrl/Cmd+Enter runs
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); run(); }
    });
    let saveT;
    ta.addEventListener("input", () => {
      autoSize(ta);
      clearTimeout(saveT);
      saveT = setTimeout(() => store.set("code:" + id, ta.value), 300);
    });

    async function run() {
      runBtn.disabled = true;
      const label = runBtn.textContent;
      runBtn.textContent = "Running…";
      out.hidden = false;
      out.classList.remove("err");
      out.textContent = "…";
      const res = await window.runPython(ta.value);
      out.classList.toggle("err", res.isError);
      out.textContent = res.text;
      runBtn.disabled = false;
      runBtn.textContent = label;
    }
    runBtn.addEventListener("click", run);
    if (resetBtn) resetBtn.addEventListener("click", () => {
      ta.value = cell.dataset.starter;
      store.set("code:" + id, null);
      localStorage.removeItem("code:" + id);
      autoSize(ta);
      out.hidden = true;
    });
  });
}

function autoSize(ta) {
  ta.style.height = "auto";
  ta.style.height = Math.min(ta.scrollHeight + 4, 640) + "px";
}

/* ---------- code-view: read-only syntax-highlighted PyTorch ---------- */
function escHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// single-pass Python tokenizer -> highlighted HTML (no external deps)
const PY_KW = "def|class|return|if|elif|else|for|while|in|not|and|or|is|import|from|as|with|try|except|finally|raise|yield|lambda|global|nonlocal|pass|break|continue|assert|del|None|True|False|self|super|async|await";
function highlightPython(src) {
  const re = new RegExp(
    "(#[^\\n]*)" +                                              // 1 comment
    "|('''[\\s\\S]*?'''|\"\"\"[\\s\\S]*?\"\"\"|'(?:\\\\.|[^'\\\\])*'|\"(?:\\\\.|[^\"\\\\])*\")" + // 2 string
    "|(@[A-Za-z_][\\w.]*)" +                                    // 3 decorator
    "|\\b(" + PY_KW + ")\\b" +                                  // 4 keyword
    "|(\\b\\d+\\.?\\d*(?:e-?\\d+)?\\b)" +                       // 5 number
    "|\\b([A-Za-z_]\\w*)(?=\\s*\\()",                           // 6 function/callable name
    "g"
  );
  let out = "", last = 0, m;
  while ((m = re.exec(src))) {
    out += escHtml(src.slice(last, m.index));
    if (m[1]) out += `<span class="tok-com">${escHtml(m[1])}</span>`;
    else if (m[2]) out += `<span class="tok-str">${escHtml(m[2])}</span>`;
    else if (m[3]) out += `<span class="tok-dec">${escHtml(m[3])}</span>`;
    else if (m[4]) out += `<span class="tok-kw">${escHtml(m[4])}</span>`;
    else if (m[5]) out += `<span class="tok-num">${escHtml(m[5])}</span>`;
    else if (m[6]) out += `<span class="tok-fn">${escHtml(m[6])}</span>`;
    last = re.lastIndex;
  }
  out += escHtml(src.slice(last));
  return out;
}

function enhanceCodeViews() {
  document.querySelectorAll(".code-view").forEach((el) => {
    const script = el.querySelector('script[type="text/x-python"]');
    if (!script) return;
    const code = script.textContent.replace(/^\n/, "").replace(/\s+$/, "");
    const file = el.dataset.file || "";
    el.innerHTML =
      `<div class="cv-bar"><span class="cv-file">${escHtml(file)}</span>` +
      `<button class="cv-copy" type="button">copy</button></div>` +
      `<pre><code>${highlightPython(code)}</code></pre>`;
    const btn = el.querySelector(".cv-copy");
    btn.addEventListener("click", () => {
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = "copied";
        setTimeout(() => (btn.textContent = "copy"), 1200);
      });
    });
  });
}

/* ---------- exercises ---------- */
function enhanceExercises(currentId) {
  document.querySelectorAll(".exercise").forEach((ex) => {
    const localId = ex.dataset.id;
    const fullId = `${currentId}:${localId}`;
    const toggle = ex.querySelector(".exercise-done-toggle input");
    if (!toggle) return;
    const done = isExDone(fullId);
    toggle.checked = done;
    ex.classList.toggle("done", done);
    toggle.addEventListener("change", () => {
      setExDone(fullId, toggle.checked);
      ex.classList.toggle("done", toggle.checked);
      buildSidebar(currentId); // refresh done counts
    });
  });
}

/* ---------- mobile menu ---------- */
function setupMobileMenu() {
  const btn = document.querySelector(".menu-toggle");
  const sb = document.querySelector(".sidebar");
  if (!btn || !sb) return;
  btn.addEventListener("click", () => sb.classList.toggle("open"));
  sb.addEventListener("click", (e) => { if (e.target.closest("a")) sb.classList.remove("open"); });
}

/* ---------- pager ---------- */
function buildPager(currentId) {
  const el = document.getElementById("pager");
  if (!el) return;
  el.classList.add("pager"); // the stylesheet targets .pager (flex layout, next-align)
  const idx = TOPICS.findIndex((t) => t.id === currentId);
  const prev = TOPICS[idx - 1];
  const next = TOPICS[idx + 1];
  el.innerHTML =
    (prev
      ? `<a class="prev" href="${prev.id}.html"><div class="dir">← Previous</div><div class="ttl">${prev.title}</div></a>`
      : `<a class="prev disabled"></a>`) +
    (next
      ? `<a class="next" href="${next.id}.html"><div class="dir">Next →</div><div class="ttl">${next.title}</div></a>`
      : `<a class="next disabled"></a>`);
}

/* ---------- index progress + cards ---------- */
function buildIndex() {
  const grid = document.getElementById("topic-grid");
  if (!grid) return;
  let html = "";
  for (const group of GROUP_ORDER) {
    const items = TOPICS.filter((t) => t.group === group);
    if (!items.length) continue;
    for (const t of items) {
      const done = countDoneForTopic(t.id);
      html += `<a class="topic-card" href="topics/${t.id}.html">
        <div class="tc-top"><span class="tc-num">${t.num}</span><span class="tc-title">${t.title}</span></div>
        <div class="tc-desc">${t.desc}</div>
        <div class="tc-meta">
          ${t.priority ? '<span class="chip priority">start here</span>' : ""}
          ${t.code ? '<span class="chip code">code</span>' : `<span class="chip ${t.status === "deep" ? "deep" : ""}">${t.status === "deep" ? "deep dive" : "outline"}</span>`}
          ${t.runnable ? '<span class="chip runnable">runnable</span>' : ""}
          ${done ? `<span class="chip">✓ ${done} done</span>` : ""}
        </div>
      </a>`;
    }
  }
  grid.innerHTML = html;

  // progress across all exercises tracked so far
  const total = exerciseIds().length;
  const done = exerciseIds().filter((k) => store.get(k, false) === true).length;
  const bar = document.querySelector(".progress-bar > span");
  const label = document.querySelector(".progress-label");
  if (bar && label) {
    const pct = total ? Math.round((done / total) * 100) : 0;
    bar.style.width = pct + "%";
    label.textContent = total
      ? `${done} / ${total} exercises done (${pct}%)`
      : "No exercises attempted yet — open a deep-dive page to start.";
  }
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const currentId = document.body.dataset.topic || null;
  buildSidebar(currentId);
  setupMobileMenu();
  if (currentId) {
    enhanceCodeCells();
    enhanceCodeViews();
    enhanceExercises(currentId);
    buildPager(currentId);
  } else {
    buildIndex();
  }
});
