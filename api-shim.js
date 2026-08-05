// Preview offline: simula /api con datos REALES exportados de TourDiez (entorno test).
(function () {
  var REAL = {"4": [{"code": "Mlg1295", "name": "ROYAL COSTA", "category": "3", "mealPlan": "TI", "pvp": "235.20", "currencyCode": "EUR", "status": "SALE", "cancelPoliciesPending": true}, {"code": "Mlg0902", "name": "ROC COSTA PARK", "category": "4", "mealPlan": "MP", "pvp": "235.20", "currencyCode": "EUR", "status": "SALE", "cancelPoliciesPending": true}], "5": [{"code": "Mlg1295", "name": "ROYAL COSTA", "category": "3", "mealPlan": "TI", "pvp": "294.00", "currencyCode": "EUR", "status": "SALE", "cancelPoliciesPending": true}, {"code": "Mlg0902", "name": "ROC COSTA PARK", "category": "4", "mealPlan": "MP", "pvp": "294.00", "currencyCode": "EUR", "status": "SALE", "cancelPoliciesPending": true}], "6": [{"code": "Mlg1295", "name": "ROYAL COSTA", "category": "3", "mealPlan": "TI", "pvp": "352.80", "currencyCode": "EUR", "status": "SALE", "cancelPoliciesPending": true}, {"code": "Mlg0902", "name": "ROC COSTA PARK", "category": "4", "mealPlan": "MP", "pvp": "352.80", "currencyCode": "EUR", "status": "SALE", "cancelPoliciesPending": true}]};
  var DESTINATIONS = [{ code: 'ES00634', label: 'Málaga · Costa del Sol' }];
  function nights(ci, co) {
    return Math.max(1, Math.round((new Date(co) - new Date(ci)) / 86400000));
  }
  function availability(input) {
    var n = nights(input.checkIn, input.checkOut);
    var key = REAL[String(n)] ? String(n) : '5';
    var base = REAL[key];
    var factor = n / Number(key);
    var rooms = input.rooms || [{ adults: 2, children: 0, units: 1 }];
    var pax = rooms.reduce(function (s, r) { return s + (r.adults + (r.children || 0)) * r.units; }, 0);
    var paxFactor = 1 + Math.max(0, pax - 2) * 0.28;
    return {
      demo: true,
      idOperation: 'preview-' + n,
      accommodations: base.map(function (h) {
        return {
          code: h.code, name: h.name, category: h.category, mealPlan: h.mealPlan,
          pvp: (Number(h.pvp) * factor * paxFactor).toFixed(2),
          currencyCode: h.currencyCode, status: h.status,
          cancelPoliciesPending: h.cancelPoliciesPending,
          idDistributions: 'preview.' + h.code,
          rooms: rooms.map(function (r, i) {
            return { code: 'RM' + (i + 1), name: r.adults === 2 ? 'DOBLE' : r.adults === 1 ? 'INDIVIDUAL' : 'FAMILIAR',
                     units: r.units, adults: r.adults, children: r.children };
          })
        };
      })
    };
  }
  function json(obj, delay) {
    return new Promise(function (res) {
      setTimeout(function () {
        res(new Response(JSON.stringify(obj), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }, delay || 350);
    });
  }
  var realFetch = window.fetch.bind(window);
  window.fetch = function (url, opts) {
    var u = typeof url === 'string' ? url : (url && url.url) || '';
    if (u.indexOf('/api/hotels/destinations') === 0) return json({ demo: true, destinations: DESTINATIONS }, 120);
    if (u.indexOf('/api/hotels/search') === 0) {
      var body = {};
      try { body = JSON.parse((opts && opts.body) || '{}'); } catch (e) {}
      return json(availability(body));
    }
    if (u.indexOf('/api/inquiries') === 0) return json({ ok: true, id: 'preview' });
    return realFetch(url, opts);
  };
})();
