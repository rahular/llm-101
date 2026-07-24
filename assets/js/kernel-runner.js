/* ============================================================
   PyTorch kernel client. Runnable cells POST their code to a local
   kernel (kernel/server.py) that executes real PyTorch and returns
   the output. Exposes window.runPython(code) -> Promise<{ text, isError }>.
   ============================================================ */

(function () {
  const KERNEL = "http://127.0.0.1:8177";

  async function checkHealth() {
    try {
      const r = await fetch(KERNEL + "/health", { method: "GET" });
      if (!r.ok) return null;
      return await r.json();
    } catch (_) {
      return null;
    }
  }

  window.runPython = async function (code) {
    try {
      const r = await fetch(KERNEL + "/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      return await r.json();
    } catch (_) {
      return {
        text:
          "⚠ PyTorch kernel not reachable.\n\nStart it from the project root:\n" +
          "    python3 kernel/server.py\n\n(needs: pip install torch)",
        isError: true,
      };
    }
  };

  // small status pill, bottom-right, reflecting kernel connection
  function renderStatus(health) {
    let el = document.getElementById("kernel-status");
    if (!el) {
      el = document.createElement("div");
      el.id = "kernel-status";
      document.body.appendChild(el);
    }
    if (health && health.status === "ok") {
      el.className = "up";
      el.textContent = `● PyTorch ${health.torch} · ${health.device}`;
      el.title = "Local PyTorch kernel connected";
    } else {
      el.className = "down";
      el.innerHTML = '● kernel offline — run <code>python3 kernel/server.py</code>';
      el.title = "Start the kernel to run cells";
    }
  }

  async function poll() {
    renderStatus(await checkHealth());
  }

  window.addEventListener("DOMContentLoaded", () => {
    poll();
    // re-check so that starting/stopping the kernel updates the UI without a reload
    setInterval(poll, 4000);
  });

  window.preloadPython = checkHealth; // kept for compatibility with pages that call it
})();
