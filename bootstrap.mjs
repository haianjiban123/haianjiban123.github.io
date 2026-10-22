globalThis.__HOME_PWA__=true;
const {offlineResponse}=await import('./mobile-db.mjs');
const originalFetch=window.fetch.bind(window);
const apiURL=value=>{try{const u=new URL(value,location.href);return u.origin===location.origin&&['/api/study','/api/home'].includes(u.pathname)?u:null;}catch{return null;}};
window.fetch=(input,options)=>{const u=apiURL(input instanceof Request?input.url:String(input));return u?offlineResponse(new Request(input instanceof Request?input:u.href,options)):originalFetch(input,options);};
const status=document.querySelector('#pwa-status'),label=status.querySelector('span');
let ready=localStorage.getItem('my-home-offline-ready-v3')||'',progress='正在准备离线资源…';
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const statusText=()=>ready?(standalone()?'离线资源已就绪，资料保存在此设备。':'离线资源已就绪。iPhone：Safari 分享 → 添加到主屏幕。'):progress;
const render=()=>{label.textContent=statusText();const info=document.querySelector('#offline-cache-state');if(info)info.textContent=statusText();};
status.querySelector('button').addEventListener('click',()=>{status.hidden=true;});
navigator.serviceWorker?.addEventListener('message',event=>{const data=event.data||{};if(data.type==='OFFLINE_PROGRESS')progress=`首次准备离线资源 ${data.done} / ${data.total}，请暂时保持联网。`;if(data.type==='OFFLINE_READY'){ready=new Date().toISOString();localStorage.setItem('my-home-offline-ready-v3',ready);}if(data.type==='OFFLINE_ERROR'){ready='';progress='离线资源未齐备，可继续联网使用。请在“本地与备份”中重试。';}render();});
navigator.serviceWorker?.addEventListener('controllerchange',()=>navigator.serviceWorker.controller?.postMessage({type:'CACHE_ALL'}));
async function prepareOffline(){if(!('serviceWorker' in navigator))throw Error('当前浏览器不支持离线模式，请使用 Safari。');const registration=await navigator.serviceWorker.register('/sw.js',{type:'module'});await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));registration.active?.postMessage({type:'CACHE_ALL'});return registration;}
async function downloadResponse(response,name){if(!response.ok)throw Error('导出失败');const blob=await response.blob(),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
window.__homeIOSSettings=({jsx,jsxs,Fragment,React,store,importZip,adapter,Lock})=>{
 const {flush,load,notify}=store(),[busy,setBusy]=React.useState(false),input=React.useRef(null);
 const act=fn=>async()=>{if(busy)return;setBusy(true);try{await flush();await fn();}catch(e){notify(e.message||'操作失败');}finally{setBusy(false);}};
 return jsxs(Fragment,{children:[jsxs('section',{className:'panel settings-section',children:[jsx('span',{className:'eyebrow',children:'我的家 3.2 · 手机本地版'}),jsx('h2',{children:'本地资料与备份'}),jsx('p',{children:'笔记、图片与附件保存在当前设备，不上传到网站。电脑无需开机，也不需要账号。'}),jsx('p',{children:'iPhone：用 Safari 打开此页面，点分享，再选“添加到主屏幕”。请从桌面图标进入后开始记录。'}),jsx('p',{id:'offline-cache-state',children:statusText()}),jsx('p',{children:'清理网站数据或移除主屏幕应用可能丢失本地资料，请定期导出完整备份到“文件”。'}),jsxs('div',{className:'tool-actions',children:[jsx('button',{className:'button primary',disabled:busy,onClick:act(async()=>{await downloadResponse(await fetch('/api/home?action=export-full'),'我的家-完整备份.zip');notify('备份已生成，请在下载中保存 ZIP。');}),children:busy?'正在处理…':'导出完整备份 ZIP'}),jsx('button',{className:'button',disabled:busy,onClick:()=>input.current?.click(),children:'导入完整备份 ZIP'}),jsx('button',{className:'button',disabled:busy,onClick:act(async()=>{await prepareOffline();status.hidden=false;notify('正在准备离线资源，完成后会显示提示。');}),children:'准备离线资源'})]}),jsx('input',{type:'file',accept:'.zip',hidden:true,ref:input,onChange:async event=>{const file=event.target.files?.[0];event.target.value='';if(file)await act(async()=>{const result=await importZip(file,adapter(),()=>{});await load();notify(`已导入 ${result.records} 条记录、${result.files} 份附件。`);})();}})]}),jsx(Lock,{})]});
};
try{render();await prepareOffline();}catch(error){ready='';progress=error.message+'，联网时仍可使用。';render();}
await import('./assets/app.js');
