import { useSiteCopy } from "./SiteCopy";
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { apiRequest } from './api';
export default function NewsletterAction() {
  const siteText = useSiteCopy();
  const {
      action
    } = useParams(),
    [q] = useSearchParams();
  const [message, setMessage] = useState(''),
    [error, setError] = useState('');
  return <section className="container section-space"><h1>{action === 'confirm' ? 'Confirm your updates' : 'Unsubscribe from updates'}</h1><p>{siteText("NewsletterAction.choose-below-to-apply-your-email-preference-.8ab420", "Choose below to apply your email preference.")}</p>{message ? <p role="status">{message}</p> : <button className="button" onClick={async () => {
      try {
        const d = await apiRequest('/newsletter/' + action, {
          account: q.get('account'),
          token: q.get('token')
        });
        setMessage(d.message);
      } catch (e) {
        setError((e as Error).message);
      }
    }}>{action === 'confirm' ? 'Confirm subscription' : 'Unsubscribe'}</button>}{error && <p className="error" role="alert">{error}</p>}</section>;
}
