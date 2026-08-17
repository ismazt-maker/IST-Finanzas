/* I$T V2.12.1 — Movement search + navigation fixes */
(() => {
  "use strict";
  const VERSION = "2.12.1";

  // Header shortcut: direct access to Configuración.
  function installSettingsShortcut(){
    const topbar = document.querySelector('.topbar');
    if(!topbar || document.getElementById('headerSettingsBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'headerSettingsBtn';
    btn.className = 'menu-btn header-settings-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label','Abrir configuración');
    btn.title = 'Configuración';
    btn.textContent = '⚙️';
    btn.style.marginLeft = 'auto';
    btn.onclick = () => {
      currentRoute = 'settings';
      localStorage.setItem('ist_route', currentRoute);
      if(typeof closeMenu === 'function') closeMenu();
      renderNav();
      renderMobileNav();
      render();
      requestAnimationFrame(() => window.scrollTo({top:0,left:0,behavior:'instant'}));
    };
    topbar.appendChild(btn);
    const date = document.getElementById('headerDate');
    if(date) date.style.marginLeft = '0';
  }

  // Fix the movement search: never rebuild the input while typing.
  function patchMovementSearch(){
    const input = document.getElementById('movConcept');
    if(!input || input.dataset.v2121Bound) return;
    input.dataset.v2121Bound = '1';
    input.oninput = e => {
      state.ui ||= {};
      state.ui.movConcept = e.target.value;
      save();
      updateMovementResultsInPlace();
    };
  }

  function filteredMovements(){
    const selected = state.ui?.movMonth || '';
    const selectedCat = state.ui?.movCat || '';
    const concept = String(state.ui?.movConcept || '').trim().toLowerCase();
    return state.movements.filter(m =>
      (!selected || monthKey(m.date) === selected) &&
      (!selectedCat || m.categoryId === selectedCat) &&
      (!concept || String(m.merchant||'').toLowerCase().includes(concept) || String(m.note||'').toLowerCase().includes(concept))
    ).sort((a,b)=>b.date.localeCompare(a.date));
  }

  function updateMovementResultsInPlace(){
    const mov = filteredMovements();
    const desktopBody = document.querySelector('.movement-list-desktop tbody');
    if(desktopBody){
      desktopBody.innerHTML = mov.map(m => movementTableRow(m)).join('') || '<tr><td colspan="8" class="empty">No hay movimientos para el filtro seleccionado.</td></tr>';
      desktopBody.querySelectorAll('[data-edit-m]').forEach(b=>b.onclick=()=>movementModal(b.dataset.editM));
      desktopBody.querySelectorAll('[data-del-m]').forEach(b=>b.onclick=()=>deleteMovement(b.dataset.delM));
    }
    const mobile = document.querySelector('.v211-mobile-movements');
    if(mobile){
      mobile.innerHTML = mov.map(m => movementMobileCardV211(m)).join('') || '<div class="empty">No hay movimientos para el filtro seleccionado.</div>';
      mobile.querySelectorAll('[data-edit-m]').forEach(b=>b.onclick=()=>movementModal(b.dataset.editM));
      mobile.querySelectorAll('[data-del-m]').forEach(b=>b.onclick=()=>deleteMovement(b.dataset.delM));
    }
    const notice = document.querySelector('.movement-filters')?.nextElementSibling;
    if(notice && notice.classList.contains('notice')){
      const concept = String(state.ui?.movConcept || '').trim();
      notice.innerHTML = `${mov.length} movimiento${mov.length===1?'':'s'} encontrado${mov.length===1?'':'s'}${concept?` para «${esc(concept)}»`:''}.`;
    }
  }

  // Add a true "Cualquier mes" option without breaking the existing V2.12 filters.
  function patchAnyMonth(){
    const select = document.getElementById('movMonth');
    if(!select || select.dataset.v2121MonthBound) return;
    select.dataset.v2121MonthBound = '1';
    const opt = document.createElement('option');
    opt.value = '__all__';
    opt.textContent = 'Cualquier mes';
    select.insertBefore(opt, select.firstChild);
    if(state.ui?.movMonth === '__all__') select.value = '__all__';
    select.onchange = e => {
      state.ui ||= {};
      state.ui.movMonth = e.target.value === '__all__' ? '' : e.target.value;
      save();
      // Re-render only when changing the date/category filters; typing in search never calls render.
      renderMovements();
    };
  }

  const originalRenderMovements = renderMovements;
  renderMovements = function(){
    const all = state.ui?.movMonth === '';
    // V2.12's original renderer treats an empty month as the current month.
    // Temporarily use the current month for the structural render, then replace results if "all" is selected.
    if(all) state.ui.movMonth = monthsBack(36)[0];
    originalRenderMovements();
    if(all) state.ui.movMonth = '';
    patchAnyMonth();
    patchMovementSearch();
    if(all) updateMovementResultsInPlace();
  };

  // Re-bind after navigation renders a fresh page.
  const originalRender = render;
  render = function(){
    originalRender();
    installSettingsShortcut();
    if(currentRoute === 'movements'){
      patchAnyMonth();
      patchMovementSearch();
      if(state.ui?.movMonth === '') updateMovementResultsInPlace();
    }
  };

  // Initial load: the page has already rendered, so patch immediately.
  installSettingsShortcut();
  if(currentRoute === 'movements'){
    patchAnyMonth();
    patchMovementSearch();
  }
  document.body.dataset.istVersion = VERSION;
  const title = document.querySelector('title');
  if(title) title.textContent = 'I$T V2.12.1';
})();
