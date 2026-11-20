export async function optimiseUpload(file:File):Promise<File>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Choose a JPG, PNG or WebP image. Convert HEIC photographs to JPG first.');
 if(file.size>15*1024*1024)throw Error('Choose a photograph up to 15 MB.');
 let bitmap:ImageBitmap;
 try{bitmap=await createImageBitmap(file);}catch{throw Error('This photograph could not be opened. Export it as JPG and try again.');}
 try{
  const scale=Math.min(1,2000/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const context=canvas.getContext('2d');if(!context)throw Error('Image processing is unavailable in this browser.');context.drawImage(bitmap,0,0,canvas.width,canvas.height);
  let output:Blob|null=null;
  for(const quality of [.82,.68,.5]){output=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',quality));if(output&&output.size<4*1024*1024)break;}
  if(!output||output.size>=4*1024*1024)throw Error('This photograph is too large to prepare. Export a smaller JPG and try again.');
  return new File([output],file.name.replace(/\.[^.]+$/,'')+'.webp',{type:output.type});
 }finally{bitmap.close();}
}
export function verifyImage(url:string):Promise<void>{
 return new Promise((resolve,reject)=>{
  const image=new Image();const timer=setTimeout(()=>finish(Error('The uploaded photograph did not load in time. Your live image has been kept. Check the backend connection.')),12000);
  function finish(error?:Error){clearTimeout(timer);image.onload=null;image.onerror=null;error?reject(error):resolve();}
  image.onload=()=>image.naturalWidth?finish():finish(Error('The server returned an empty image. Your live image has been kept.'));
  image.onerror=()=>finish(Error('The uploaded photograph cannot be displayed at '+url+'. Your live image has been kept. Check the API address or missing upload file.'));
  image.src=url;
 });
}
