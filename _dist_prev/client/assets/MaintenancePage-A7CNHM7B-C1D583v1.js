import{Oi as e,Wn as t,vr as n}from"./shared-home-CY2hce1J.js";var r=n(),i=`https://cdn.assets.salla.network/prod/stores/images/construction-01.png`,a=`https://cdn.assets.salla.network/prod/stores/images/under-construction.png`,o=[[`twitter`,`sicon-x`],[`snapchat`,`sicon-snapchat`],[`youtube`,`sicon-youtube`],[`tiktok`,`sicon-tiktok`],[`facebook`,`sicon-facebook`],[`instagram`,`sicon-instagram`]];function s(e){return o.flatMap(([t,n])=>{let r=e?.social?.[t];return r?[{key:t,icon:n,href:r}]:[]})}var c=`
.s-maintenance{display:flex;flex-direction:column;align-items:center;width:100%;height:100vh;height:100dvh;overflow-y:auto;color:#a3a3a3;background:#fff;filter:grayscale(100%);box-sizing:border-box}
.s-maintenance *{box-sizing:border-box}
.s-maintenance .mt-container{width:100%;max-width:1200px;margin:auto 0;padding:0 15px}
.s-maintenance .mt-panel{display:flex;flex-direction:row;align-items:center;justify-content:space-between;width:100%}
.s-maintenance .mt-message{width:100%;padding-inline-start:80px;animation:revealMtBlock 1.5s forwards}
.s-maintenance .mt-title{display:flex;align-items:center;margin:0 0 20px}
.s-maintenance .mt-logo{display:block;flex-shrink:0;width:80px;height:80px;margin-inline-end:20px;border-radius:50%;overflow:hidden;box-shadow:0 0 5px rgb(0 0 0 / 10%)}
.s-maintenance .mt-logo img{display:block;width:100%;height:100%;object-fit:cover}
.s-maintenance .mt-title h1{font-size:2.25rem;line-height:1;margin:0;color:#666}
.s-maintenance .mt-content p{margin:0;white-space:pre-line}
.s-maintenance .mt-contact-list{display:inline-block;list-style:none;width:100%;max-width:500px;margin:20px 0 0;padding:20px 0 0;border-top:1px solid #eee}
.s-maintenance .mt-contact-list li{display:inline-block;margin-inline-end:10px}
.s-maintenance .mt-contact-list a{display:inline-flex;align-items:center;padding:5px;color:rgb(102 102 102 / 80%);text-decoration:none;font-size:1.25rem}
.s-maintenance .mt-contact-list a:hover{color:#666}
.s-maintenance .mt-contact--btn{padding:3px 20px 5px;border-radius:20px;color:#fff!important;background:rgb(102 102 102 / 80%);font-size:1rem!important}
.s-maintenance .mt-contact--btn:hover{background:#666}
.s-maintenance .mt-contact--btn i{margin-inline-end:10px}
.s-maintenance .thumb{width:100%;animation:revealMtBlock 1.5s .1s forwards;opacity:0}
.s-maintenance .thumb img{display:block;width:100%;max-width:450px;margin:0 auto}
@media (max-width:1024px){
.s-maintenance{padding:40px 0 10px}
.s-maintenance .mt-panel{flex-direction:column}
.s-maintenance .mt-message{order:2;text-align:center;padding:0;margin:50px 0 0}
.s-maintenance .mt-title{flex-direction:column;margin-bottom:30px}
.s-maintenance .mt-logo{margin:0 0 10px}
.s-maintenance .mt-title h1{font-size:1.5rem}
}
@media (max-width:640px){.s-maintenance .thumb img{width:80%}}
@keyframes revealMtBlock{from{opacity:0;transform:translateY(50%)}to{opacity:1;transform:translateY(0)}}
`;function l({store:e,arabic:n}){let{t:i}=t(),a=e?.contacts?.mobile,o=s(e);return!a&&o.length===0?null:(0,r.jsxs)(`ul`,{className:`mt-contact-list`,children:[a&&(0,r.jsx)(`li`,{children:(0,r.jsxs)(`a`,{href:`tel:${a}`,className:`mt-contact--btn`,children:[(0,r.jsx)(`i`,{className:`sicon-phone`,"aria-hidden":`true`}),i(`common.elements.contact_us`,{defaultValue:n?`تواصل معنا`:`Contact us`})]})}),o.map(({key:e,icon:t,href:n})=>(0,r.jsx)(`li`,{children:(0,r.jsx)(`a`,{href:n,target:`_blank`,rel:`noreferrer`,"aria-label":e,children:(0,r.jsx)(`i`,{className:t,"aria-hidden":`true`})})},e))]})}var u=`
.s-launching{display:flex;flex-direction:column;align-items:center;width:100%;height:100vh;height:100dvh;overflow-y:auto;color:#a3a3a3;background:#fff;text-align:center;box-sizing:border-box}
.s-launching *{box-sizing:border-box}
.s-launching .ls-panel{display:flex;flex-direction:column;align-items:center;width:100%;max-width:1200px;margin:auto 0;padding:40px 15px 100px;animation:revealMtBlock 1.5s forwards}
.s-launching .ls-logo{display:block;max-width:70px;margin:0 0 60px}
.s-launching .ls-thumb{display:block;width:100%;max-width:250px}
.s-launching h1{font-size:3.125rem;line-height:1;margin:20px 0;color:#000}
.s-launching .ls-content p{margin:0;white-space:pre-line}
.s-launching .ls-footer{position:fixed;inset-inline:0;bottom:0;display:flex;align-items:center;justify-content:space-between;padding:0 25px;color:#000;background:#fbfbfb}
.s-launching .ls-contacts{display:flex;align-items:center}
.s-launching .ls-contacts h2{margin:1em 0;font-size:1rem;color:#7d7d7d}
.s-launching .ls-contacts h2::after{content:"|";margin:0 10px;font-weight:700;color:#dbdbdb}
.s-launching .ls-contacts ul{display:flex;list-style:none;margin:0;padding:0}
.s-launching .ls-contacts li{padding:0 10px}
.s-launching .ls-contacts a{display:inline-flex;align-items:center;gap:5px;color:#000;text-decoration:none}
.s-launching .ls-footer-logo{display:block;max-width:30px}
@media (max-width:1024px){.s-launching h1{font-size:1.5625rem}}
@media (max-width:767px){.s-launching .ls-contacts a span{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}}
@keyframes revealMtBlock{from{opacity:0;transform:translateY(50%)}to{opacity:1;transform:translateY(0)}}
`;function d({store:e,arabic:n}){let{t:i}=t(),a=e?.contacts?.mobile,o=s(e);return!a&&o.length===0?null:(0,r.jsxs)(`footer`,{className:`ls-footer`,children:[(0,r.jsxs)(`div`,{className:`ls-contacts`,children:[(0,r.jsx)(`h2`,{children:i(`common.elements.contact_us`,{defaultValue:n?`تواصل معنا`:`Contact us`})}),(0,r.jsxs)(`ul`,{children:[a&&(0,r.jsx)(`li`,{children:(0,r.jsxs)(`a`,{href:`tel:${a}`,children:[(0,r.jsx)(`i`,{className:`sicon-phone`,"aria-hidden":`true`}),(0,r.jsx)(`span`,{dir:`ltr`,children:a})]})}),o.map(({key:e,icon:t,href:n})=>(0,r.jsx)(`li`,{children:(0,r.jsx)(`a`,{href:n,target:`_blank`,rel:`noreferrer`,"aria-label":e,children:(0,r.jsx)(`i`,{className:t,"aria-hidden":`true`})})},e))]})]}),e?.logo&&(0,r.jsx)(`img`,{className:`ls-footer-logo`,src:e.logo,alt:``})]})}function f({store:e,arabic:n}){let{t:i}=t(),o=e?.name||i(`common.elements.store_logo`,{defaultValue:n?`شعار المتجر`:`Store logo`});return(0,r.jsxs)(`div`,{className:`s-launching`,"data-testid":`store-launching-soon-page`,children:[(0,r.jsx)(`style`,{children:u}),(0,r.jsxs)(`section`,{className:`ls-panel`,children:[e?.logo&&(0,r.jsx)(`img`,{className:`ls-logo`,src:e.logo,alt:o}),(0,r.jsx)(`img`,{className:`ls-thumb`,src:a,alt:``}),(0,r.jsx)(`h1`,{children:i(`pages.launching_soon.title`,{defaultValue:n?`ترقَّب إطلاق المتجر`:`The store is launching soon`})}),(0,r.jsx)(`div`,{className:`ls-content`,children:(0,r.jsx)(`p`,{children:i(`pages.launching_soon.message`,{defaultValue:n?`نعمل على وضع اللمسات الأخيرة لنقدم لك تجربة تسوق متكاملة، قريبًا!`:`We're putting the finishing touches on a complete shopping experience for you. Coming soon!`})})})]}),(0,r.jsx)(d,{store:e,arabic:n})]})}function p(){let{settings:n,locale:a}=e(),{t:o}=t(),s=n.store,u=n.maintenance_details,d=a.startsWith(`ar`);if(n.launched===!1)return(0,r.jsx)(f,{store:s,arabic:d});let p=u?.title||o(`pages.maintenance.title`,{defaultValue:d?`المتجر قيد الصيانة`:`Store under maintenance`});return(0,r.jsxs)(`div`,{className:`s-maintenance`,"data-testid":`store-maintenance-page`,children:[(0,r.jsx)(`style`,{children:c}),(0,r.jsx)(`div`,{className:`mt-container`,children:(0,r.jsxs)(`section`,{className:`mt-panel`,children:[(0,r.jsxs)(`div`,{className:`mt-message`,children:[(0,r.jsxs)(`div`,{className:`mt-title`,children:[s?.logo&&(0,r.jsx)(`span`,{className:`mt-logo`,children:(0,r.jsx)(`img`,{src:s.logo,alt:s.name||o(`common.elements.store_logo`,{defaultValue:d?`شعار المتجر`:`Store logo`})})}),(0,r.jsx)(`h1`,{children:p})]}),(0,r.jsx)(`div`,{className:`mt-content`,children:u?.message?(0,r.jsx)(`p`,{children:u.message}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(`p`,{children:o(`pages.maintenance.message`,{defaultValue:d?`عذرا عزيزي العميل، المتجر حاليا قيد الصيانة و سنعاود العمل خلال فترة وجيزة`:`Sorry, the store is under maintenance and will be back shortly.`})}),(0,r.jsx)(`p`,{children:o(`pages.maintenance.thanks`,{defaultValue:d?`شكرا لتفهمكم`:`Thank you for your understanding.`})})]})}),(0,r.jsx)(l,{store:s,arabic:d})]}),(0,r.jsx)(`div`,{className:`thumb`,children:(0,r.jsx)(`img`,{src:i,alt:``})})]})})]})}export{p as MaintenancePage};