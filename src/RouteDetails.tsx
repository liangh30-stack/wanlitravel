import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Calendar, Users, Star, CheckCircle2 } from 'lucide-react';
import { allRoutes } from './data';
import { useLanguage } from './App';

const RouteDetails = () => {
  const { id } = useParams();
  const route = allRoutes.find(r => r.id === id);
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!route) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-ink">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">{t.routeDetails.routeNotFound}</h1>
          <Link to="/" className="text-accent hover:underline">{t.routeDetails.returnHome}</Link>
        </div>
      </div>
    );
  }

  const translatedRoute = t.routes[route.id as keyof typeof t.routes];

  return (
    <div className="min-h-screen bg-bg text-ink font-sans">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full z-[100] py-6 px-12 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-ink/5">
        <Link to="/" className="flex items-center gap-2 hover:text-accent transition-colors">
          <ArrowLeft size={20} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t.routeDetails.backToCollections}</span>
        </Link>
        <img src="/logo-light-bg.jpeg" alt="Wanli - Bridging China and Europe" className="h-12 object-contain" />
      </nav>

      {/* Hero Section */}
      <div className="relative h-[70vh] w-full">
        <img 
          src={route.img} 
          alt={translatedRoute.title} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-12 md:p-24 text-white">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <p className="text-[12px] font-bold uppercase tracking-[0.4em] text-accent mb-4">{translatedRoute.region}</p>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-none">{translatedRoute.title}</h1>
            <p className="text-xl md:text-2xl font-medium opacity-80 max-w-2xl">{translatedRoute.description}</p>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-12 py-24 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Column: Itinerary */}
        <div className="lg:col-span-8">
          <h2 className="text-3xl font-black tracking-tighter mb-12">{t.routeDetails.theJourney}</h2>
          
          <div className="space-y-16">
            {translatedRoute.itinerary.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row gap-8 group"
              >
                <div className="w-full md:w-1/3 aspect-[4/3] rounded-2xl overflow-hidden relative">
                  <img 
                    src={route.itinerary[index].img} 
                    alt={step.location} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-ink">
                    {t.routeDetails.day} {index + 1}
                  </div>
                </div>
                <div className="w-full md:w-2/3 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-accent mb-3">
                    <MapPin size={16} />
                    <h3 className="text-xl font-bold">{step.location}</h3>
                  </div>
                  <p className="text-ink/70 leading-relaxed text-lg">{step.activity}</p>
                  
                  <div className="mt-6 flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-ink/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-ink/60">{t.routeDetails.guidedTour}</span>
                    <span className="px-4 py-2 bg-ink/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-ink/60">{t.routeDetails.premium}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Details & Booking */}
        <div className="lg:col-span-4">
          <div className="sticky top-32 bg-surface p-8 rounded-3xl border border-ink/5">
            <h3 className="text-2xl font-black tracking-tighter mb-8">{t.routeDetails.routeOverview}</h3>
            
            <div className="space-y-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{t.routeDetails.duration}</p>
                  <p className="font-bold">{route.itinerary.length} {t.routeDetails.days} / {route.itinerary.length - 1} {t.routeDetails.nights}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{t.routeDetails.groupSize}</p>
                  <p className="font-bold">{t.routeDetails.groupSizeValue}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Star size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{t.routeDetails.serviceLevel}</p>
                  <p className="font-bold">{t.routeDetails.serviceLevelValue}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-ink/10 pt-8 mb-8">
              <h4 className="font-bold mb-4">{t.routeDetails.includedInThisRoute}</h4>
              <ul className="space-y-3">
                {t.routeDetails.includedItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-ink/70">
                    <CheckCircle2 size={18} className="text-accent shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button className="w-full bg-ink text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-accent transition-colors">
              {t.routeDetails.requestQuote}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RouteDetails;
