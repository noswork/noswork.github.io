// local-app.js - lightweight stubs to make UI interactive without server
(function(){
  console.log('local-app.js loaded');

  // Simple router/module shim for route imports used by the page
  window.__reactRouterRouteModules = window.__reactRouterRouteModules || {};

  // Provide minimal implementations for API endpoints the UI may call
  function stubFetch(url, options){
    console.info('stubFetch', url);
    if(url.endsWith('/api/auth/providers')){
      return Promise.resolve(new Response(JSON.stringify({providers:[]}),{status:200,headers:{'Content-Type':'application/json'}}));
    }
    if(url.includes('/api/auth')){
      return Promise.resolve(new Response(JSON.stringify({status:'ok'}),{status:200,headers:{'Content-Type':'application/json'}}));
    }
    // default empty
    return Promise.resolve(new Response('{}',{status:200,headers:{'Content-Type':'application/json'}}));
  }

  if(!window.fetch._isStubbed){
    var realFetch = window.fetch.bind(window);
    window.fetch = function(url,opts){
      // allow local asset loads through
      if(typeof url==='string' && (url.startsWith('./assets') || url.startsWith('/assets') || url.match(/^https?:\/\//))) {
        // if it's a remote call to /api or to auth endpoints, stub
        if(url.indexOf('/api/')!==-1 || url.indexOf('/cdn-cgi/')!==-1) return stubFetch(url,opts);
        return realFetch(url,opts);
      }
      return realFetch(url,opts);
    };
    window.fetch._isStubbed = true;
  }

  // Enable basic interactivity for buttons that were failing: simulate click handlers
  document.addEventListener('click', function(e){
    var btn = e.target.closest('button, a');
    if(!btn) return;
    if(btn.dataset.testid && btn.dataset.testid.includes('login')){
      alert('Login is stubbed in this local build');
      e.preventDefault();
    }
  });

  // Provide minimal console-safe no-op for telemetry calls
  window.__oai_logHTML = window.__oai_logHTML || function(){};
  window.__oai_logTTI = window.__oai_logTTI || function(){};

  // Replace unreachable cookie challenge script insertion (Cloudflare) to avoid errors
  try{
    var iframes = document.querySelectorAll('iframe');
    iframes.forEach(function(f){ if(f.style && f.style.visibility==='hidden') f.remove(); });
  }catch(e){}

})();
