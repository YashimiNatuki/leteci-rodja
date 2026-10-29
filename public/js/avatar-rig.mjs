/**
 * AI Crew procedural 3D rigs — zero cloud calls.
 * Each rig has articulated joints; shapes are generated locally with Three.js.
 * These are procedural characters, not imported/skinned GLB assets.
 */
import * as T from './vendor/three.module.js';
export const RIG_IDS=Object.freeze(['aigad','chatbrat','airodja','leteci']);
export const RIG_STATES=Object.freeze(['idle','listening','thinking','speaking','success','error']);
const mat=(c,emissive='#000000',intensity=0.1,metalness=.15)=>new T.MeshStandardMaterial({color:c,emissive,emissiveIntensity:intensity,roughness:.4,metalness});
const dark=()=>mat('#160f26'),bone=()=>mat('#ece4d6'),ink=()=>mat('#140b20');
function attach(group,geo,material,x=0,y=0,z=0,sx=1,sy=1,sz=1){
  const o=new T.Mesh(geo,material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);
  group.add(o);return o;
}
const ball=(p,m,x,y,z,sx=1,sy=1,sz=1)=>attach(p,new T.SphereGeometry(1,24,14),m,x,y,z,sx,sy,sz);
const box=(p,m,x,y,z,sx,sy,sz)=>attach(p,new T.BoxGeometry(1,1,1),m,x,y,z,sx,sy,sz);
const tube=(p,m,x,y,z,r1=.1,r2=.1,h=.6)=>attach(p,new T.CylinderGeometry(r1,r2,h,16),m,x,y,z);
const hoop=(p,m,x,y,z,r=.7,t=.025,rotationX=0)=>{const o=attach(p,new T.TorusGeometry(r,t,8,48),m,x,y,z);o.rotation.x=rotationX;return o;};
function skull(head,accent,hoodieMaterial,withHood=true){
  if(withHood){ball(head,hoodieMaterial,0,.01,-.08,.59,.64,.46);}
  ball(head,bone(),0,0,.22,.4,.46,.3);
  const socket=ink();
  ball(head,socket,-.17,.1,.47,.13,.125,.065);
  ball(head,socket,.17,.1,.47,.13,.125,.065);
  ball(head,mat('#d8ffec',accent,.4),-.17,.1,.533,.026,.03,.015);
  ball(head,mat('#d8ffec',accent,.4),.17,.1,.533,.026,.03,.015);
  ball(head,socket,0,-.08,.52,.05,.07,.026);
  const jaw=new T.Group();jaw.position.set(0,-.23,.34);head.add(jaw);
  box(jaw,bone(),0,-.1,.03,.48,.22,.18);
  box(jaw,socket,0,-.06,.129,.39,.07,.015);
  for(let i=-2;i<=2;i++)box(jaw,bone(),i*.068,-.056,.15,.046,.064,.027);
  return jaw;
}
function human(head,accent){
  ball(head,mat('#c79b89'),0,0,.15,.4,.48,.36);
  const band=mat('#641c43',accent,.12);
  tube(head,band,0,.31,.18,.405,.4,.135);
  box(head,band,.43,.19,.15,.12,.38,.13).rotation.z=.35;
  const shades=ink();
  box(head,shades,-.18,.08,.47,.33,.13,.08);
  box(head,shades,.18,.08,.47,.33,.13,.08);
  box(head,mat('#befef4',accent,.5),-.18,.1,.52,.22,.018,.009);
  box(head,mat('#befef4',accent,.5),.18,.1,.52,.22,.018,.009);
  box(head,shades,0,.08,.47,.1,.07,.07);
  hoop(head,mat('#301f29'),0,-.19,.45,.15,.02);
}
function baseRig(id,color){
  const root=new T.Group();root.name=id;
  const accent=mat(color,color,.48,.25);
  const hoodie=mat(id==='chatbrat'?'#962331':id==='leteci'?'#14121e':'#44205f',color,.09);
  const torso=new T.Group();torso.position.y=1.14;root.add(torso);
  ball(torso,hoodie,0,0,0,.57,.68,.35);
  tube(torso,mat('#130f19'),0,-.57,0,.4,.43,.25);
  const neck=tube(root,hoodie,0,1.69,0,.20,.22,.25);
  const head=new T.Group();head.position.set(0,1.88,.02);root.add(head);
  const leftArm=new T.Group();leftArm.position.set(-.58,1.52,0);root.add(leftArm);
  const rightArm=new T.Group();rightArm.position.set(.58,1.52,0);root.add(rightArm);
  for(const [arm,x] of [[leftArm,-1],[rightArm,1]]){
    ball(arm,hoodie,0,-.2,0,.21,.32,.22);
    tube(arm,hoodie,x*.045,-.47,0,.17,.13,.40);
    ball(arm,bone(),x*.07,-.68,0,.14,.14,.13);
  }
  const halo=hoop(root,accent,0,.08,0,.86,.024,Math.PI/2);
  const legs=[];
  for(const x of [-.25,.25]) {
    const leg=tube(root,mat('#1c1728'),x,.33,0,.20,.19,.64);
    legs.push(leg);
  }
  const sparks=new T.Group();root.add(sparks);
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    ball(sparks,mat(color,color,.65),Math.cos(a)*(.7+i%3*.12),.25+i*.16,Math.sin(a)*(.56+i%2*.1),.035,.035,.035);
  }
  return {root,head,leftArm,rightArm,halo,sparks,accent,hoodie,legs,jaw:null,flames:[],core:null};
}
export function createAvatarRig(id){
 if(!RIG_IDS.includes(id)) throw new RangeError('Unknown AI Crew avatar: '+String(id));
 const colors={aigad:'#b47aff',chatbrat:'#ff7775',airodja:'#9be3d1',leteci:'#edc2ff'};
 const color=colors[id],r=baseRig(id,color);
 if(id==='airodja'){
   r.head.visible=false;r.leftArm.visible=false;r.rightArm.visible=false;
   r.root.children.find(x=>x.position.y===1.14).visible=false;
   const core=new T.Group();core.position.set(0,1.32,0);r.root.add(core);
   const crystal=attach(core,new T.IcosahedronGeometry(.68,1),mat('#8af1ed','#41eadb',.75,.7));
   crystal.name='holographic-core';
   const wire=attach(core,new T.IcosahedronGeometry(.77,1),new T.MeshBasicMaterial({color:'#b8fffc',wireframe:true,transparent:true,opacity:.55}));
   wire.name='holographic-lattice';
   hoop(core,mat('#8fffe3','#8fffe3',.7),0,0,0,.92,.028,.5);
   const ring=hoop(core,mat('#bfa5ff','#bfa5ff',.7),0,0,0,1.05,.026,1.36);
   ring.rotation.y=.45;
   r.core=core;
   tube(r.root,mat('#252032',color,.2),0,.33,0,.35,.45,.5);
 }else if(id==='leteci'){
   human(r.head,color);
   for(const x of [-.39,.39]){
     box(r.root,mat('#3c3449'),x,1.14,-.37,.34,.66,.23);
     const flame=attach(r.root,new T.ConeGeometry(.18,.45,14),mat('#ffae45','#ff7100',.9),x,.57,-.38);
     flame.rotation.z=Math.PI;r.flames.push(flame);
   }
   hoop(r.root,mat('#f6d5ff',color,.3),0,2.48,0,.64,.035);
 }else{
   r.jaw=skull(r.head,color,r.hoodie);
   if(id==='chatbrat'){
     const arch=hoop(r.head,mat('#33343c'),0,.17,0,.55,.07,Math.PI/2);
     arch.rotation.z=.25;
     for(const x of [-.50,.50])box(r.head,mat('#d7a3ad'),x,.02,.11,.16,.40,.28);
     tube(r.head,mat('#11121d'),.49,-.17,.42,.018,.018,.39).rotation.x=.45;
     box(r.root,mat('#1a1523'),0,.79,.59,.9,.58,.065).rotation.x=-.15;
     box(r.root,mat('#8eecdc','#1abcae',.45),0,.79,.63,.67,.38,.01).rotation.x=-.15;
     box(r.root,mat('#2a2636'),0,.49,.67,1.04,.08,.52);
   }else{
     hoop(r.head,mat('#bfa0fe',color,.4),0,.20,-.28,.7,.04,Math.PI/2);
     for(let i=0;i<6;i++)ball(r.sparks,mat('#d8b1ff',color,.6),(i%2?-.68:.7),.38+i*.28,(i%3)*.18,.045,.07,.045);
   }
 }
 r.root.userData={id,kind:'procedural-3d',source:'ai-crew-avatar-lab'};
 return r;
}
export function poseAvatarRig(r,state,time){
 if(!RIG_STATES.includes(state))throw new RangeError('Unknown animation state: '+String(state));
 if(!Number.isFinite(time))throw new TypeError('Animation time must be finite');
 const idle=Math.sin(time*1.7),active=state==='speaking'?1:state==='listening'?.3:state==='thinking'?.65:state==='success'?1.2:state==='error'?.4:0;
 r.root.position.y=(state==='error'?-0.1:0)+idle*.055;
 r.root.rotation.y=Math.sin(time*.55)*.11;
 r.head.rotation.y=Math.sin(time*1.1)*.08;
 r.head.rotation.x=state==='thinking'?.15:state==='listening'?-.08:Math.sin(time*.8)*.025;
 r.leftArm.rotation.z=-.06-active*.22+Math.sin(time*1.4)*.035;
 r.rightArm.rotation.z=.06+active*.22-Math.sin(time*1.4)*.035;
 r.halo.rotation.z=time*.23;
 r.sparks.rotation.y=time*.28;
 if(r.jaw)r.jaw.rotation.x=state==='speaking'?Math.max(0,Math.sin(time*14))*.29:0;
 if(r.core){r.core.rotation.y=time*.42;r.core.scale.setScalar(1+(state==='thinking'?.06:state==='speaking'?.09:0)*Math.sin(time*7));}
 for(const f of r.flames){f.scale.y=state==='speaking'?1.35:1+Math.sin(time*13)*.12;}
 return r;
}
export function disposeAvatarRig(r){
 const geo=new Set(),materials=new Set();
 r.root.traverse(o=>{if(o.isMesh){geo.add(o.geometry);if(Array.isArray(o.material))o.material.forEach(m=>materials.add(m));else materials.add(o.material);}});
 geo.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
 r.root.parent?.remove(r.root);
}
