const PIXEL_LIMIT=650000;
const VERTEX_SHADER=`
attribute vec2 a_position;
void main(){gl_Position=vec4(a_position,0.0,1.0);}
`;
// Analytic ray/sphere lighting, not a mesh loader or a path tracer. Four
// vertices and one intersection keep this optional scene predictable.
const FRAGMENT_SHADER=`
precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
void main(){
 vec2 screen=(gl_FragCoord.xy/u_resolution)*2.0-1.0;
 screen.x*=u_resolution.x/u_resolution.y;
 vec3 eye=vec3(0.0,0.0,4.0);
 vec3 ray=normalize(vec3(screen,-2.7));
 vec3 center=vec3(1.55+u_pointer.x*0.10,0.24+u_pointer.y*0.06,-3.4);
 vec3 offset=eye-center;
 float radius=1.48;
 float b=dot(offset,ray);
 float h=b*b-dot(offset,offset)+radius*radius;
 if(h<=0.0){gl_FragColor=vec4(0.0);return;}
 float distance=-b-sqrt(h);
 if(distance<=0.0){gl_FragColor=vec4(0.0);return;}
 vec3 normal=normalize(eye+ray*distance-center);
 vec3 light=normalize(vec3(-1.8,3.8,5.5));
 vec3 view=-ray;
 float diffuse=max(dot(normal,light),0.0);
 float specular=pow(max(dot(normal,normalize(light+view)),0.0),58.0);
 float rim=pow(1.0-max(dot(normal,view),0.0),3.0);
 float band=1.0-smoothstep(0.008,0.020,abs(normal.y+0.17+sin(u_time*0.055)*0.014));
 vec3 graphite=vec3(0.028,0.033,0.043);
 vec3 bone=vec3(0.79,0.76,0.69);
 vec3 violet=vec3(0.27,0.20,0.43);
 vec3 color=graphite*(0.45+diffuse*1.7)+bone*specular*0.33;
 color+=violet*rim*0.42+bone*band*(0.018+diffuse*0.025);
 float alpha=smoothstep(0.0,0.07,h)*0.92;
 gl_FragColor=vec4(color*alpha,alpha);
}
`;

export function noirSceneBudget({width=1440,reducedMotion=false,saveData=false,hidden=false}={}){
 const enabled=Number.isFinite(width)&&width>900&&!saveData;
 return{enabled,fps:enabled&&!reducedMotion&&!hidden?20:0,dpr:enabled?1.25:1,maxPixels:PIXEL_LIMIT};
}

export function createNoirRenderer(canvas){
 let gl;
 try{gl=canvas?.getContext?.('webgl',{alpha:true,antialias:false,preserveDrawingBuffer:false,powerPreference:'low-power'});}catch{return null;}
 if(!gl)return null;
 const resources=[];let disposed=false,lost=false,program,buffer,position,resolution,pointerLocation,timeLocation;
 const keep=(kind,value)=>{if(!value)throw Error('Native resource unavailable');resources.push([kind,value]);return value;};
 const contextLost=event=>{event.preventDefault();lost=true;};
 function dispose(){
  if(disposed)return;disposed=true;
  canvas.removeEventListener?.('webglcontextlost',contextLost);
  for(const [kind,value]of resources.reverse()){try{gl['delete'+kind](value);}catch{}}
  resources.length=0;
 }
 try{
  const compile=(kind,source)=>{const shader=keep('Shader',gl.createShader(kind));gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('Shader unavailable');return shader;};
  const vertex=compile(gl.VERTEX_SHADER,VERTEX_SHADER),fragment=compile(gl.FRAGMENT_SHADER,FRAGMENT_SHADER);
  program=keep('Program',gl.createProgram());gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Program unavailable');
  position=gl.getAttribLocation(program,'a_position');if(position<0)throw Error('Position unavailable');
  resolution=gl.getUniformLocation(program,'u_resolution');pointerLocation=gl.getUniformLocation(program,'u_pointer');timeLocation=gl.getUniformLocation(program,'u_time');
  if(resolution===null||pointerLocation===null||timeLocation===null)throw Error('Uniform unavailable');
  buffer=keep('Buffer',gl.createBuffer());gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  canvas.addEventListener?.('webglcontextlost',contextLost);
 }catch{dispose();return null;}
 const finite=value=>typeof value==='number'&&Number.isFinite(value);
 const boundedPointer=value=>finite(value)?Math.max(-1,Math.min(1,value)):0;
 return{
  render({width,height,time=0,pointer=[0,0]}={}){
   if(disposed||lost||!finite(width)||!finite(height)||width<1||height<1||width>10000000||height>10000000)return false;
   try{
    if(gl.isContextLost?.())return false;
    const scale=Math.min(1.25,Math.sqrt(PIXEL_LIMIT/(width*height)),4096/width,4096/height);
    const w=Math.max(1,Math.floor(width*scale)),h=Math.max(1,Math.floor(height*scale));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    gl.viewport(0,0,w,h);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    gl.uniform2f(resolution,w,h);gl.uniform2f(pointerLocation,boundedPointer(pointer?.[0]),boundedPointer(pointer?.[1]));gl.uniform1f(timeLocation,finite(time)?(time/1000)%3600:0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);return true;
   }catch{lost=true;return false;}
  },
  dispose
 };
}
