import {useContent} from './ContentContext';
export function useSiteCopy(){const {content}=useContent();return (key:string,fallback:string)=>content.copy?.[key]??fallback;}
