import {rewrite} from '@vercel/functions';
export const config={matcher:['/api/:path*','/media/:path*'],runtime:'nodejs'};

export default function middleware(request){
 try{
  const source=new URL(request.url);
  const target=new URL(process.env.BACKEND_ORIGIN);
  if(target.protocol!=='https:'||target.username||target.password||
     target.pathname!=='/'||target.search||target.hash||
     target.origin===source.origin)throw Error('Invalid backend origin');
  target.pathname=source.pathname;
  target.search=source.search;
  return rewrite(target);
 }catch{
  return Response.json(
   {message:'Set BACKEND_ORIGIN on the frontend Vercel project and redeploy.'},
   {status:503,headers:{'Cache-Control':'no-store'}}
  );
 }
}
