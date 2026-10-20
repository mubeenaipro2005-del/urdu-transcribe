const $=i=>document.getElementById(i);
const T={
ur:{title:'صدا نویس',drop:'آڈیو یا ویڈیو فائل منتخب کریں',lang:'آڈیو کی زبان',model:'ماڈل',ur:'اردو',en:'انگریزی',auto:'خودکار',go:'ٹرانسکرائب کریں',stop:'منسوخ کریں',vpara:'مسلسل متن',vlines:'حصہ وار',find:'تلاش',next:'اگلا',copy:'کاپی',clr:'متن حذف کریں',task:'کام',tx:'ٹرانسکرپشن',tr:'انگریزی ترجمہ',rec:'ریکارڈ کریں',recstop:'ریکارڈنگ روکیں',e5:'مائیک تک رسائی نہیں ملی۔ براؤزر میں اجازت دیں۔',lose:'ہاتھ سے کی گئی ترمیم ختم ہو جائے گی۔ جاری رکھیں؟',
dec:'آڈیو پڑھی جا رہی ہے…',dl:'ماڈل ڈاؤن لوڈ (صرف پہلی بار): ',run:'ٹرانسکرپشن جاری، حصہ ',done:'مکمل۔ آپ متن میں ترمیم کر سکتے ہیں۔',cancel:'منسوخ کر دیا گیا۔',copied:'کاپی ہو گیا۔',
e0:'فائل خالی ہے۔',e1:'فائل پڑھی نہیں جا سکی۔ فارمیٹ غیر معاون یا فائل خراب ہو سکتی ہے۔',e3:'ماڈل لوڈ نہیں ہو سکا۔ انٹرنیٹ چیک کریں؛ پہلی بار ماڈل ڈاؤن لوڈ لازمی ہے۔',e4:'خرابی: '},
en:{title:'Sada Nawis',drop:'Choose an audio or video file',lang:'Audio language',model:'Model',ur:'Urdu',en:'English',auto:'Auto-detect',go:'Transcribe',stop:'Cancel',vpara:'Flowing text',vlines:'By segment',find:'Find',next:'Next',copy:'Copy',clr:'Delete text',task:'Task',tx:'Transcribe',tr:'Translate to English',rec:'Record',recstop:'Stop recording',e5:'Microphone access was denied. Allow it in the browser.',lose:'Your manual edits will be lost. Continue?',
dec:'Reading audio…',dl:'Downloading model (first time only): ',run:'Transcribing, chunk ',done:'Done. You can edit the text.',cancel:'Cancelled.',copied:'Copied.',
e0:'The file is empty.',e1:'Could not read this file. The format may be unsupported or the file damaged.',e3:'Could not load the model. Check your connection; the first run must download it.',e4:'Error: '}
};
let dirty=false,pvw='para',L='ur',file,segs=[],dur=0,w,total=1,n=0,run=0;
const S=(m,c='')=>{$('status').textContent=m;$('status').className=c};
function ui(l){L=l;document.documentElement.lang=l;document.documentElement.dir=l==='ur'?'rtl':'ltr';
  document.querySelectorAll('[data-t]').forEach(e=>e.textContent=T[l][e.dataset.t]);
  document.querySelectorAll('[data-p]').forEach(e=>e.placeholder=T[l][e.dataset.p]);document.title=T[l].title}
$('ui').onchange=e=>ui(e.target.value);

function mk(){
  w=new Worker('worker.js',{type:'module'});
  w.onmessage=({data:d})=>{
    if(d.type==='dl'){if(d.p.status==='progress'){$('bar').hidden=false;$('bar').value=d.p.progress/100;S(T[L].dl+Math.round(d.p.progress)+'%')}}
    else if(d.type==='chunk'){n++;$('bar').hidden=false;$('bar').value=Math.min(1,n/total);S(T[L].run+n+' / ≈'+total)}
    else if(d.type==='done')finish(d);
    else if(d.type==='err')fail(T[L].e4+d.msg);
  };
  w.onerror=()=>fail(T[L].e3);
}
function busy(b){$('go').hidden=b;$('stop').hidden=!b;if(!b)$('bar').hidden=true}
function fail(m){busy(false);S(m,'er');mk()}

async function decode(f){
  const ctx=new AudioContext({sampleRate:16000});
  try{
    const b=await ctx.decodeAudioData(await f.arrayBuffer()),c=b.numberOfChannels,o=new Float32Array(b.length);
    for(let k=0;k<c;k++){const d=b.getChannelData(k);for(let i=0;i<o.length;i++)o[i]+=d[i]/c}
    return o;
  }finally{ctx.close()}
}

function showFile(){$('fname').textContent=file?file.name+' · '+(file.size/1048576).toFixed(1)+' MB':'';$('go').disabled=!file}
$('file').onchange=e=>{file=e.target.files[0];showFile()};
$('go').onclick=async()=>{
  if(!file)return;
  if(!file.size)return S(T[L].e0,'er');
  const my=++run;busy(true);n=0;S(T[L].dec);
  let a;
  try{a=await decode(file)}catch(e){if(my===run){busy(false);S(T[L].e1,'er')}return}
  if(my!==run)return;
  if(!a.length){busy(false);return S(T[L].e1,'er')}
  dur=a.length/16000;total=Math.max(1,Math.ceil(dur/20));
  w.postMessage({model:$('model').value,lang:$('lang').value,task:$('task').value,audio:a},[a.buffer]);
};
$('stop').onclick=()=>{run++;w.terminate();busy(false);S(T[L].cancel);mk()};

function finish(d){
  busy(false);
  segs=(d.chunks||[]).map(c=>({t:c.text.trim(),s:c.timestamp[0]||0,e:c.timestamp[1]??dur})).filter(x=>x.t);
  if(!segs.length&&d.text)segs=[{t:d.text.trim(),s:0,e:dur}];
  render();$('res').hidden=false;S(T[L].done,'ok');
}
function render(){$('txt').value=segs.map(x=>x.t).join($('view').value==='lines'?'\n':' ');dirty=false;save()}
$('view').onchange=()=>{if(!segs.length||(dirty&&!confirm(T[L].lose))){$('view').value=pvw;return}pvw=$('view').value;render()};

const ts=(s,c)=>{s=Math.max(0,s||0);const h=~~(s/3600),m=~~(s%3600/60);return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+(s%60).toFixed(3).padStart(6,'0').replace('.',c)};
document.querySelectorAll('[data-dl]').forEach(b=>b.onclick=()=>{
  const k=b.dataset.dl;let s;
  if(k==='txt')s=$('txt').value;
  else{if(!segs.length)return;const v=k==='vtt',c=v?'.':',';
    s=(v?'WEBVTT\n\n':'')+segs.map((x,i)=>(v?'':(i+1)+'\n')+ts(x.s,c)+' --> '+ts(x.e,c)+'\n'+x.t+'\n').join('\n')}
  saveBlob(new Blob([s],{type:'text/plain;charset=utf-8'}),k);
});
function saveBlob(b,ext){const a=document.createElement('a');a.href=URL.createObjectURL(b);
  a.download=(file?file.name.replace(/\.[^.]+$/,''):'transcript')+'.'+ext;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000)}
$('docx').onclick=()=>saveBlob(new Blob([buildDocx($('txt').value)],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}),'docx');
$('pdf').onclick=()=>{$('pv').textContent=$('txt').value;window.print()};
let mr,parts=[];
$('rec').onclick=async()=>{
  if(mr&&mr.state==='recording')return mr.stop();
  try{
    const st=await navigator.mediaDevices.getUserMedia({audio:true});parts=[];mr=new MediaRecorder(st);
    mr.ondataavailable=e=>parts.push(e.data);
    mr.onstop=()=>{st.getTracks().forEach(t=>t.stop());const t=mr.mimeType||'audio/webm';
      file=new File([new Blob(parts,{type:t})],'recording.'+(t.includes('mp4')?'m4a':'webm'),{type:t});showFile();$('rec').textContent=T[L].rec};
    mr.start();$('rec').textContent=T[L].recstop;
  }catch{S(T[L].e5,'er')}
};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText($('txt').value)}catch{$('txt').select();document.execCommand('copy')}S(T[L].copied,'ok')};
$('next').onclick=()=>{const q=$('find').value,t=$('txt');if(!q)return;let i=t.value.indexOf(q,t.selectionEnd);if(i<0)i=t.value.indexOf(q);if(i<0)return;t.focus();t.setSelectionRange(i,i+q.length)};

function save(){try{localStorage.setItem('sn.txt',$('txt').value)}catch{}}
$('txt').oninput=()=>{dirty=true;save()};
$('clr').onclick=()=>{segs=[];$('txt').value='';$('res').hidden=true;try{localStorage.removeItem('sn.txt')}catch{}};
try{const v=localStorage.getItem('sn.txt');if(v){$('txt').value=v;$('res').hidden=false}}catch{}

$('go').disabled=true;ui('ur');mk();
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
