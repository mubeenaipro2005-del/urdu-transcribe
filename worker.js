// Whisper runs here (Web Worker) so the page never freezes.
import {pipeline,env} from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1';
env.allowLocalModels=false;
let asr,loaded;
self.onmessage=async({data:d})=>{
  try{
    if(loaded!==d.model){
      asr=await pipeline('automatic-speech-recognition',d.model,{dtype:'q8',progress_callback:p=>self.postMessage({type:'dl',p})});
      loaded=d.model;
    }
    const o=await asr(d.audio,{language:d.lang==='auto'?null:d.lang,task:d.task||'transcribe',chunk_length_s:30,stride_length_s:5,return_timestamps:true,chunk_callback:()=>self.postMessage({type:'chunk'})});
    self.postMessage({type:'done',text:o.text,chunks:o.chunks});
  }catch(e){self.postMessage({type:'err',msg:String(e&&e.message||e)})}
};
