// Loads HTML fragments from src/components and injects into the page
(async function(){
  const script = document.currentScript;
  // Derive components base path from this script's URL
  let componentsBase = '';
  if (script && script.src) {
    componentsBase = script.src.replace(/\/assets\/js\/include-components\.js(?:\?.*)?$/,'/components/');
  } else {
    componentsBase = '../components/';
  }

  const includes = document.querySelectorAll('[data-include]');
  for (const el of includes) {
    const name = el.getAttribute('data-include');
    try {
      const resp = await fetch(componentsBase + `${name}.html`);
      if (resp.ok) {
        const html = await resp.text();
        el.innerHTML = html;
      }
    } catch (e) {
      console.warn('Include failed:', name, e);
    }
  }

  // Notify that components are ready
  document.dispatchEvent(new Event('components:loaded'));
})();
