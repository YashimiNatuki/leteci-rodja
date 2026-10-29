/**
 * Y!Appi Cinematic Hybrid v1.0 — one scene, multiple truthful visual modes.
 * - Two real Thrixel SkinnedMesh GLBs (Mixamo bones, no supplied clips).
 * - One original Noir illustration (2D CSS hover, not falsely called 3D).
 * - Existing procedural Three.js and accessible CSS fallbacks.
 */
import * as T from './vendor/three.module.js';
import {createAvatarRig,poseAvatarRig,disposeAvatarRig} from './avatar-rig.mjs';
import {CHARACTER_ASSETS,pickCinematicMode,nextCinematicPreference,cinematicBudget} from './cinematic-policy.mjs';

const sceneElement=document.getElementById('scene');
const toggle=document.getElementById('render-mode-toggle');
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
const saveData=Boolean(navigator.connection?.saveData);
const plaque=sceneElement.querySelector('.plaque');
const portrait=document.createElement('div');
portrait.className='cinematic-portrait';
portrait.setAttribute('aria-hidden','true');
const image=document.createElement('img');
image.alt='';
image.decoding='async';
image.width=1254;image.height=1254;
portrait.append(image);
sceneElement.insertBefore(portrait,plaque);
const credit=document.createElement('div');
credit.className='cinematic-credit';
credit.textContent='CINEMATIC HYBRID · REAL ASSETS';
sceneElement.insertBefore(credit,plaque);

let renderer=null,world=null,camera=null,host=null,rig=null;
let requested='auto',kind='css',clock=0,raf=0,last=0,observer=null,resizer=null,disposed=false,stopped=false;
let lastAgent=sceneElement.dataset.agent;
const cache=new Map(),loading=new Map(),failed=new Set();
let loaderPromise=null;
let assetStatus='not-loaded';
let renderSupported=false;

function countMode3d(mode){return mode==='mesh'||mode==='procedural';}
function getAgent(){return CHARACTER_ASSETS[sceneElement.dataset.agent]?sceneElement.dataset.agent:'aigad';}
function currentMode(){
 const agent=getAgent();
 let mode=pickCinematicMode({agent,requested,width:window.innerWidth,webgl:renderSupported,saveData});
 if(mode==='mesh'&&failed.has(agent))mode=renderSupported?'procedural':'css';
 return mode;
}
function syncButton(){
 const agent=getAgent();
 toggle.disabled=false;
 const upcoming=nextCinematicPreference(agent,kind);
 toggle.textContent=upcoming==='portrait'?'Prikaži filmski portret':upcoming==='2d'?'Prikaži lagani 2D':'Prikaži pravi 3D';
 toggle.setAttribute('aria-pressed',String(countMode3d(kind)));
 sceneElement.classList.toggle('is-3d',countMode3d(kind));
 sceneElement.classList.toggle('is-cinematic',kind==='portrait');
 sceneElement.classList.toggle('is-lite',kind==='css');
 sceneElement.dataset.visualMode=kind;
 if(host)host.style.display=countMode3d(kind)?'block':'none';
 credit.textContent=kind==='portrait'?'NOIR · ILUSTRACIJA + CSS':
 kind==='mesh'?assetStatus==='loaded'?'MIXAMO RIG · STVARNI GLB':'MIXAMO RIG · UČITAVANJE':
 kind==='procedural'?'THREE.JS · REZERVNI 3D':'CPU / LAGANI 2D PRIKAZ';
}
function releaseMaterial(material){
 if(!material)return;
 for(const key of Object.keys(material)){
  const prop=material[key];
  if(prop?.isTexture)prop.dispose();
 }
 material.dispose();
}
function disposeLoaded(root){
 if(!root)return;
 const geos=new Set(),mats=new Set();
 root.traverse(o=>{
  if(o.isMesh||o.isSkinnedMesh){
   if(o.geometry)geos.add(o.geometry);
   if(Array.isArray(o.material))o.material.forEach(x=>mats.add(x));
   else if(o.material)mats.add(o.material);
  }
 });
 geos.forEach(x=>x.dispose());mats.forEach(releaseMaterial);
}
function detachRig(){
 if(!rig)return;
 world?.remove(rig.root);
 if(rig.type==='procedural')disposeAvatarRig(rig.data);
 rig=null;
}
function procedural(agent){
 const data=createAvatarRig(agent);
 return {root:data.root,data,type:'procedural',agent};
}
function sculptRig(gltf,agent){
 const root=new T.Group();
 root.name='cinematic-'+agent;
 root.userData={id:agent,kind:'rigged-glb'};
 root.add(gltf.scene);
 const bones={};
 gltf.scene.traverse(node=>{
  if(node.isBone){
   const name=['Head','Spine2','LeftArm','RightArm'].find(key=>String(node.name).endsWith(key));
   if(['Head','Spine2','LeftArm','RightArm'].includes(name)){
    bones[name]={node,x:node.rotation.x,y:node.rotation.y,z:node.rotation.z};
   }
  }
 });
 return {root,agent,type:'gltf',bones,gltf};
}
function setRig(next){
 detachRig();
 rig=next;
 world.add(rig.root);
 rig.root.userData={...rig.root.userData,id:rig.agent};
}
function ensureProcedural(agent){
 if(!renderer)return;
 if(rig?.type==='procedural'&&rig.agent===agent)return;
 if(rig?.type==='gltf'&&rig.agent===agent)return;
 setRig(procedural(agent));
}
async function obtainRig(agent){
 if(cache.has(agent))return cache.get(agent);
 if(loading.has(agent))return loading.get(agent);
 const uri=CHARACTER_ASSETS[agent]?.mesh;
 if(!uri)throw Error('GLB source not defined');
 const task=(async()=>{
  const {GLTFLoader}=await (loaderPromise||=(import('./vendor/GLTFLoader.js')));
  const instance=new GLTFLoader();
  const loaded=await instance.loadAsync(uri);
  if(!loaded.scene)throw Error('GLB is missing a scene');
  let skinned=0,head=0;
  loaded.scene.traverse(o=>{
   if(o.isSkinnedMesh)skinned++;
   if(String(o.name).endsWith('Head'))head++;
  });
  if(!skinned||!head)throw Error('Rigged GLB check failed: skinned='+skinned+' headNodes='+head+' sample='+loaded.scene.children.map(o=>o.name).join(','));
  const data=sculptRig(loaded,agent);
  cache.set(agent,data);
  return data;
 })();
 loading.set(agent,task);
 try{return await task;}
 finally{loading.delete(agent);}
}
async function ensureMesh(agent){
 if(!renderer||!CHARACTER_ASSETS[agent]?.mesh)return;
 if(rig?.agent===agent&&rig.type==='gltf')return;
 if(loading.has(agent))return;
 if(rig?.agent!==agent)ensureProcedural(agent);
 assetStatus='loading';syncButton();
 try{
  const loaded=await obtainRig(agent);
  if(disposed || getAgent()!==agent || kind!=='mesh')return;
  setRig(loaded);
  assetStatus='loaded';syncButton();
  schedule();redraw();
 }catch(error){
  failed.add(agent);
  if(getAgent()===agent){
   assetStatus='error';kind='procedural';
   ensureProcedural(agent);
   syncButton();schedule();
  }
  console.warn('Cinematic GLB unavailable; safely using procedural 3D:',String(error.message).slice(0,130));
 }
}
function poseMesh(mesh,state,time){
 const idle=Math.sin(time*1.25);
 const amplitude=state==='speaking'?.11:state==='thinking'?.045:state==='success'?.08:0;
 mesh.root.position.y=(state==='error'?-0.05:0)+idle*.019;
 mesh.root.rotation.y=Math.sin(time*.35)*.13;
 const head=mesh.bones.Head;
 if(head){
  head.node.rotation.y=head.y+Math.sin(time*.7)*.055;
  head.node.rotation.x=head.x+(state==='thinking'?.12:state==='listening'?-.06:0);
 }
 const chest=mesh.bones.Spine2;
 if(chest)chest.node.rotation.y=chest.y+Math.sin(time*.9)*.027;
 for(const name of ['LeftArm','RightArm']){
  const arm=mesh.bones[name];if(!arm)continue;
  const sign=name==='LeftArm'?-1:1;
  arm.node.rotation.z=arm.z+sign*amplitude*(.5+.5*Math.sin(time*2.1));
 }
}
function redraw(){
 if(disposed||!renderer||!countMode3d(kind)||!rig)return;
 const agent=getAgent();
 if(rig.agent!==agent)return;
 if(rig.type==='gltf')poseMesh(rig,sceneElement.dataset.state,clock);
 else poseAvatarRig(rig.data,sceneElement.dataset.state,clock);
 renderer.render(world,camera);
}
function resize(){
 if(disposed||!renderer)return;
 const b=host.getBoundingClientRect();
 const w=Math.max(1,Math.floor(b.width)),h=Math.max(1,Math.floor(b.height));
 const budget=cinematicBudget({width:window.innerWidth,reducedMotion:reduce.matches,hidden:document.hidden,saveData});
 const cap=Math.min(budget.dpr,Math.sqrt(budget.maxPixels/(w*h)));
 renderer.setPixelRatio(Math.max(.7,cap));
 renderer.setSize(w,h,false);
 camera.aspect=w/h;camera.updateProjectionMatrix();
 redraw();
}
function frame(now){
 raf=0;
 if(!renderer||disposed||document.hidden||stopped||reduce.matches||!countMode3d(kind))return;
 const {fps}=cinematicBudget({width:window.innerWidth,reducedMotion:reduce.matches,hidden:document.hidden,saveData});
 if(!fps)return;
 if(!last)last=now;
 const elapsed=now-last;
 if(elapsed>=1000/fps){
  const dt=Math.min(.06,Math.max(0,elapsed/1000));
  last=now;clock+=dt;redraw();
 }
 raf=requestAnimationFrame(frame);
}
function schedule(){
 if(raf)cancelAnimationFrame(raf);
 raf=0;last=0;
 if(disposed)return;
 if(renderer&&countMode3d(kind)&&!stopped&&!document.hidden&&!reduce.matches&&!saveData)raf=requestAnimationFrame(frame);
 else redraw();
}
function refresh(){
 if(disposed)return;
 stopped=document.body.classList.contains('motion-off');
 const agent=getAgent();
 if(agent!==lastAgent){
  lastAgent=agent;
  requested='auto';
  assetStatus='not-loaded';
 }
 kind=currentMode();
 if(kind==='portrait'){
  if(image.getAttribute('src')!==CHARACTER_ASSETS[agent].portrait)image.src=CHARACTER_ASSETS[agent].portrait;
 }else if(countMode3d(kind)&&renderer){
  ensureProcedural(agent);
  if(kind==='mesh')void ensureMesh(agent);
  else assetStatus='procedural';
 }
 syncButton();resize();schedule();
}
image.addEventListener('error',()=>{
 if(kind==='portrait'){
  requested='2d';kind='css';syncButton();
  console.warn('Noir artwork unavailable; fallback kept.');
 }
});
try{
 host=document.createElement('div');
 host.className='avatar-stage3d';host.setAttribute('aria-hidden','true');
 sceneElement.insertBefore(host,plaque);
 renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
 renderSupported=true;
 renderer.setClearColor(0x000000,0);
 renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.16;
 host.append(renderer.domElement);
 world=new T.Scene();
 camera=new T.PerspectiveCamera(34,1,.1,100);
 camera.position.set(0,1.25,4.35);
 camera.lookAt(0,1.04,0);
 world.add(new T.HemisphereLight('#d0defc','#271629',1.8));
 const key=new T.DirectionalLight('#faf0df',2.65);key.position.set(-2.4,4.4,4.5);world.add(key);
 const rim=new T.DirectionalLight('#8c5ce0',3.0);rim.position.set(2.2,2.8,-2.7);world.add(rim);
 const fill=new T.DirectionalLight('#69caca',1.15);fill.position.set(3,1,2);world.add(fill);
 setRig(procedural(getAgent()));
}catch(error){
 console.warn('WebGL unavailable: cinematic portrait / CSS fallback retained.',String(error.message).slice(0,130));
 renderer?.dispose();renderer=null;renderSupported=false;
 host?.remove();host=null;
}
resizer=new ResizeObserver(()=>{refresh()});
resizer.observe(sceneElement);
observer=new MutationObserver(()=>refresh());
observer.observe(sceneElement,{attributes:true,attributeFilter:['data-agent','data-state']});
observer.observe(document.body,{attributes:true,attributeFilter:['class']});
const motionListener=()=>{schedule()};
reduce.addEventListener('change',motionListener);
const visibilityListener=()=>schedule();
document.addEventListener('visibilitychange',visibilityListener);
toggle.addEventListener('click',()=>{
 requested=nextCinematicPreference(getAgent(),kind);
 refresh();
});
refresh();
window.AI_CREW_3D={
 getStatus:()=>({
  active:countMode3d(kind)&&Boolean(renderer),supported:renderSupported,kind,
  agent:getAgent(),state:sceneElement.dataset.state,paused:stopped,
  meshReady:rig?.type==='gltf'&&rig?.agent===getAgent(),
  rigged:rig?.type==='gltf'&&rig?.agent===getAgent(),
  controlledBones:rig?.type==='gltf'?Object.keys(rig.bones).length:0,
  assetStatus, geometryCount:world?.children.length||0
 }),
 setMode:(mode)=>{
  if(!['auto','3d','2d','portrait'].includes(mode))return false;
  requested=mode;refresh();return true;
 },
 dispose:()=>{
  if(disposed)return;disposed=true;
  if(raf)cancelAnimationFrame(raf);
  observer.disconnect();resizer.disconnect();
  reduce.removeEventListener('change',motionListener);
  document.removeEventListener('visibilitychange',visibilityListener);
  detachRig();
  for(const item of cache.values())disposeLoaded(item.gltf.scene);
  cache.clear();
  renderer?.dispose();
  renderer?.forceContextLoss();
  host?.remove();portrait.remove();credit.remove();
  renderer=null;renderSupported=false;kind='css';syncButton();
 }
};
