import React, { useEffect, useState } from 'react';
import { SocialLinksAPI } from '../services/socialLinks';
import SocialIcon from './SocialIcon';

export default function SocialFloating() {
  const [links, setLinks] = useState([]);
  useEffect(()=>{
    (async()=>{
      try{ const { items } = await SocialLinksAPI.listPublic(); setLinks(items||[]); }catch(_e){}
    })();
  },[]);

  if (!links.length) return null;
  return (
    <aside className="social-float" aria-label="Social links">
      {links.map(link => (
        <a key={link._id} href={link.url} target="_blank" rel="noreferrer" className="sf-btn" aria-label={link.platform}>
          <SocialIcon name={link.platform} size={18} />
        </a>
      ))}
    </aside>
  );
}
