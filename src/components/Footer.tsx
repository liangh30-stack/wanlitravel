import { useLanguage } from '../context';

/* ─────────────────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────────────── */
const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer style={{ background: '#05080F', color: 'white', paddingTop: 80, paddingBottom: 48 }}>
      <div className="container">
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-5">
            <img src="/logo-dark-bg.jpeg" alt="Wanlitravel" loading="lazy" decoding="async"
              style={{ height: 52, objectFit:'contain', borderRadius:10, opacity:0.88, marginBottom:20 }} />
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.32)', lineHeight:1.7, maxWidth:320 }}>
              {t.footer.description}
            </p>
          </div>
          <div className="lg:col-span-3 lg:col-start-7">
            <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.2)', marginBottom:20 }}>
              {t.footer.solutions}
            </p>
            <div className="space-y-3">
              {[t.footer.wholesale, t.footer.groundHandling, t.footer.apiIntegration, t.footer.bespoke].map((item,i)=>(
                <a key={i} href="#" style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', transition:'color 0.2s' }}
                  onMouseEnter={e=>(e.currentTarget.style.color='#C4923A')}
                  onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.35)')}>
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.2)', marginBottom:20 }}>
              {t.footer.connect}
            </p>
            <div className="space-y-3">
              {[t.footer.linkedin, t.footer.partnerPortal, t.footer.contactUs].map((item,i)=>(
                <a key={i} href="#" style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', transition:'color 0.2s' }}
                  onMouseEnter={e=>(e.currentTarget.style.color='#C4923A')}
                  onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.35)')}>
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="divider-gold mb-8" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.25em', textTransform:'uppercase', color:'rgba(255,255,255,0.15)' }}>
            {t.footer.rights}
          </p>
          <p style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:14, color:'rgba(255,255,255,0.1)' }}>
            {t.footer.globalPartnerships}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
