import{i as e}from"./rolldown-runtime-COiEfhsA.js";import{Ji as t}from"./shared-home-DEIFcKkt.js";var n=e(t(),1);function r(e){return`
window.dataLayer = window.dataLayer || [];
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${e}');

window.dataLayer = new Proxy(window.dataLayer, {
  set(target, property, value) {
    target[property] = value;
    if (typeof value === 'object') {
      ['form_data', 'data', 'gateway', 'config', 'request', 'headers']
        .forEach(function(key) { value && value.hasOwnProperty(key) && delete value[key]; });
    }
    return true;
  }
});
`.trim()}var i=[`pointerdown`,`keydown`,`touchstart`,`scroll`,`wheel`],a=4e3;function o({gtmIds:e}){let t=e?.[0];return(0,n.useEffect)(()=>{if(!t)return;let e=t,n,o=()=>{window.clearTimeout(n),window.removeEventListener(`load`,c),i.forEach(e=>window.removeEventListener(e,s))};function s(){if(o(),document.getElementById(`gtm-script`))return;let t=document.createElement(`script`);t.id=`gtm-script`,t.textContent=r(e),document.head.appendChild(t)}function c(){n=window.setTimeout(s,a)}return i.forEach(e=>window.addEventListener(e,s,{once:!0,passive:!0})),document.readyState===`complete`?c():window.addEventListener(`load`,c,{once:!0}),()=>{o(),document.getElementById(`gtm-script`)?.remove()}},[t]),null}export{o as GoogleTagBody};