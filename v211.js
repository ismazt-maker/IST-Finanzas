/* I$T V2.11 — Quality & Polish patch */
(() => {
  "use strict";

  const V = "2.11.0";
  const appearanceAccent = {
    graphite: "#263238",
    navy: "#243b53",
    forest: "#166534",
    burgundy: "#7f1d1d",
    slate: "#475569"
  };

  function removeLegacyDarkCSS(){
    document.querySelectorAll("style").forEach(style => {
      const text = style.textContent || "";
      if (text.includes("@media(prefers-color-scheme:dark)")) style.remove();
    });
  }

  function syncBrowserThemeColor(){
    const meta = document.querySelector('meta[name="theme-color"]');
    if(!meta) return;
    const mode = v210Appearance().mode;
    const accent = appearanceAccent[v210Appearance().accent] || appearanceAccent.navy;
    const effective = mode === "auto"
      ? (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : mode;
    meta.content = effective === "dark" ? "#0a0c10" : accent;
  }

  const _v210ApplyAppearance = v210ApplyAppearance;
  v210ApplyAppearance = function(){
    _v210ApplyAppearance();
    syncBrowserThemeColor();
  };

  removeLegacyDarkCSS();
  v210ApplyAppearance();

  const _importData = importData;
  importData = function(file){
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result);
        const valid = raw && typeof raw === "object"
          && Array.isArray(raw.accounts)
          && Array.isArray(raw.movements)
          && Array.isArray(raw.categories);
        if(!valid) throw new Error("invalid-shape");
        backupState(state, "preimport-v211");
        const next = normalizeV22State(raw);
        if(!next || !Array.isArray(next.accounts) || !Array.isArray(next.movements) || !Array.isArray(next.categories)) throw new Error("invalid-normalized-state");
        state = next;
        ensureV25State();
        save();
        render();
        toast(`Datos importados: ${state.accounts.length} cuentas · ${state.movements.length} movimientos.`);
      } catch(e) {
        toast("Archivo no válido o incompatible. Tus datos actuales no se han modificado.");
      }
    };
    reader.readAsText(file);
  };

  function categoryDependencies(cid){
    const deps = [];
    const movements = state.movements.filter(m => m.categoryId === cid);
    const recurrings = state.recurrings.filter(r => r.categoryId === cid);
    const budgets = [];
    Object.keys(state.budgets || {}).forEach(k => { if(k.endsWith("|" + cid)) budgets.push(k); });
    if(state.settings?.budgetsV25?.[cid]) budgets.push("persistent");
    if(movements.length) deps.push(`${movements.length} movimiento${movements.length===1?"":"s"}`);
    if(recurrings.length) deps.push(`${recurrings.length} recurrente${recurrings.length===1?"":"s"}`);
    if(budgets.length) deps.push(`${budgets.length} presupuesto${budgets.length===1?"":"s"}`);
    return deps;
  }

  function subcategoryDependencies(cid,sid){
    const deps = [];
    const movements = state.movements.filter(m => m.categoryId === cid && m.subcategoryId === sid);
    const recurrings = state.recurrings.filter(r => r.categoryId === cid && r.subcategoryId === sid);
    if(movements.length) deps.push(`${movements.length} movimiento${movements.length===1?"":"s"}`);
    if(recurrings.length) deps.push(`${recurrings.length} recurrente${recurrings.length===1?"":"s"}`);
    return deps;
  }

  const _deleteCategory = deleteCategory;
  deleteCategory = function(id){
    const deps = categoryDependencies(id);
    if(deps.length){ toast(`No puedes eliminarla: ${deps.join(" y ")}.`); return; }
    _deleteCategory(id);
  };

  const _deleteSubcategory = deleteSubcategory;
  deleteSubcategory = function(cid,sid){
    const deps = subcategoryDependencies(cid,sid);
    if(deps.length){ toast(`No puedes eliminarla: ${deps.join(" y ")}.`); return; }
    _deleteSubcategory(cid,sid);
  };

  const _deleteAccount = deleteAccount;
  deleteAccount = function(id){
    const movementDeps = state.movements.filter(m => m.accountId === id || m.toAccountId === id).length;
    const recurringDeps = state.recurrings.filter(r => r.accountId === id).length;
    if(movementDeps || recurringDeps){
      const deps = [];
      if(movementDeps) deps.push(`${movementDeps} movimiento${movementDeps===1?"":"s"}`);
      if(recurringDeps) deps.push(`${recurringDeps} recurrente${recurringDeps===1?"":"s"}`);
      toast(`No puedes eliminarla: ${deps.join(" y ")}.`);
      return;
    }
    _deleteAccount(id);
  };

  function movementListForCurrentFilters(){
    const months = monthsBack(36);
    const selected = state.ui?.movMonth || months[0];
    const selectedCat = state.ui?.movCat || "";
    const concept = (state.ui?.movConcept || "").trim().toLowerCase();
    return state.movements.filter(m => (!selected || monthKey(m.date) === selected) && (!selectedCat || m.categoryId === selectedCat) && (!concept || String(m.merchant||"").toLowerCase().includes(concept) || String(m.note||"").toLowerCase().includes(concept))).sort((a,b) => b.date.localeCompare(a.date));
  }

  function movementMobileCard(m){
    const cat = categoryById(m.categoryId);
    const sub = subcategoryById(m.categoryId,m.subcategoryId);
    const acc = byId(state.accounts,m.accountId);
    const isTransfer = m.type === "transfer";
    const label = m.merchant || (isTransfer ? "Traspaso" : cat?.name || "Movimiento");
    const sign = m.type === "income" ? "+" : m.type === "transfer" ? "⇄" : "−";
    const cls = m.type === "income" ? "positive" : m.type === "transfer" ? "v211-transfer" : "negative";
    const account = isTransfer && m.toAccountId ? `${acc?.name||"—"} → ${byId(state.accounts,m.toAccountId)?.name||"—"}` : acc?.name || "—";
    const details = isTransfer ? "Traspaso interno" : `${cat?.name||"Sin categoría"} · ${sub?.name||"Sin subcategoría"}`;
    return `<article class="v211-movement-card"><div class="v211-movement-main"><span class="merchant-icon">${merchantVisual(label)}</span><div class="v211-movement-copy"><strong>${esc(label)}</strong><span>${esc(details)}</span><small>${esc(m.date)} · ${esc(account)}</small></div></div><div class="v211-movement-side"><strong class="${cls}">${sign}${euro(m.amount)}</strong>${isTransfer ? "" : `<div class="v211-movement-actions"><button class="btn small" data-edit-m="${m.id}">Editar</button><button class="btn small danger" data-del-m="${m.id}">Eliminar</button></div>`}</div></article>`;
  }

  const _renderMovements = renderMovements;
  renderMovements = function(){
    _renderMovements();
    const tableCard = document.querySelector("#appContent .movement-filters")?.nextElementSibling?.nextElementSibling;
    if(!tableCard) return;
    const list = movementListForCurrentFilters();
    const mobile = document.createElement("div");
    mobile.className = "v211-mobile-movements";
    mobile.innerHTML = list.map(movementMobileCard).join("") || `<div class="empty">No hay movimientos para el filtro seleccionado.</div>`;
    tableCard.appendChild(mobile);
    const input = document.getElementById("movConcept");
    if(input){
      input.oninput = e => {
        state.ui.movConcept = e.target.value;
        save();
        clearTimeout(renderMovements._searchTimer);
        renderMovements._searchTimer = setTimeout(() => renderMovements(), 140);
      };
    }
    mobile.querySelectorAll("[data-edit-m]").forEach(b => b.onclick = () => movementModal(b.dataset.editM));
    mobile.querySelectorAll("[data-del-m]").forEach(b => b.onclick = () => deleteMovement(b.dataset.delM));
  };

  const _renderReports = renderReports;
  renderReports = function(){
    _renderReports();
    const reportType = document.getElementById("reportType");
    if(reportType){
      const field = reportType.closest(".field");
      if(field) field.remove();
    }
    document.querySelectorAll("#appContent [data-report-mode]").forEach(tab => tab.setAttribute("aria-pressed", tab.classList.contains("active") ? "true" : "false"));
  };

  const _toast = toast;
  toast = function(msg){
    _toast(msg);
    const nodes = [...document.querySelectorAll('div')].filter(x => x.textContent === msg && x.style.position === "fixed");
    const node = nodes[nodes.length - 1];
    if(node) node.style.bottom = "calc(86px + env(safe-area-inset-bottom))";
  };

  document.querySelectorAll("button").forEach(btn => {
    if(!btn.getAttribute("aria-label") && !btn.textContent.trim()) btn.setAttribute("aria-label","Botón");
  });

  document.body.dataset.istVersion = V;
  const title = document.querySelector("title");
  if(title) title.textContent = "I$T V2.11";

  render();
  v210ApplyAppearance();
})();
