(function(){"use strict";self.addEventListener("message",i=>{const{imageData:t,pathsD:r,left:c,right:f,top:h,bottom:l}=i.data,s=new OffscreenCanvas(t.width,t.height).getContext("2d",{willReadFrequently:!0});if(!s)return;s.putImageData(t,0,0);const u=new Path2D(r),n=[];for(let e=h;e<l;e++)for(let a=c;a<f;a++)if(s.isPointInPath(u,a,e)){const o=(e*t.width+a)*4;n.push([...t.data.subarray(o,o+3)])}self.postMessage(n)})})();
