/**
 * Cinematic Hybrid display policy. The Noir portrait is a high-resolution 2D image,
 * NOT a GLB. AiGad / ChatBrat use distinct rigged glTF 2.0 models.
 */
export const CHARACTER_ASSETS=Object.freeze({
 aigad:Object.freeze({mesh:'./assets/characters/aigad-rigged.glb',portrait:null,source:'Thrixel Mixamo rigged glTF 2.0'}),
 chatbrat:Object.freeze({mesh:'./assets/characters/chatbrat-rigged.glb',portrait:null,source:'Thrixel Mixamo rigged glTF 2.0'}),
 airodja:Object.freeze({mesh:null,portrait:null,source:'original procedural Three.js hologram'}),
 leteci:Object.freeze({mesh:null,portrait:'./assets/portraits/leteci-noir.webp',source:'original Y!Appi 0.4.4 Noir WebP portrait'})
});
const modes=new Set(['auto','3d','2d','portrait']);
const agents=Object.keys(CHARACTER_ASSETS);
export function pickCinematicMode({agent,requested='auto',width=1200,webgl=false,saveData=false}={}){
 if(!agents.includes(agent))throw new RangeError('Unknown cinematic agent: '+String(agent));
 if(!modes.has(requested))throw new RangeError('Invalid cinematic preference: '+String(requested));
 const asset=CHARACTER_ASSETS[agent];
 const preferred3D=webgl ? (asset.mesh?'mesh':'procedural') : (asset.portrait?'portrait':'css');
 if(requested==='2d')return 'css';
 if(requested==='portrait')return asset.portrait?'portrait':preferred3D;
 if(requested==='3d')return preferred3D;
 if(asset.portrait)return 'portrait';
 if(saveData||!Number.isFinite(width)||width<=620)return 'css';
 return preferred3D;
}
export function nextCinematicPreference(agent,current){
 if(!agents.includes(agent))throw new RangeError('Unknown cinematic agent');
 if(current==='portrait')return '3d';
 if(current==='mesh'||current==='procedural')return '2d';
 if(current==='css')return CHARACTER_ASSETS[agent].portrait?'portrait':'3d';
 throw new RangeError('Invalid current render mode');
}
export function cinematicBudget({width=1200,reducedMotion=false,hidden=false,saveData=false}={}){
 const mobile=Number.isFinite(width)&&width<=620;
 return Object.freeze({dpr:mobile?1.25:1.75,fps:reducedMotion||hidden||saveData?0:(mobile?20:30),maxPixels:mobile?460000:1400000});
}
