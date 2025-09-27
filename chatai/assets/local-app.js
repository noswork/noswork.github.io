// local-app.js - enhanced stubs to make UI interactive without server
(function(){
  console.log('local-app.js loaded');

  // swallow global errors from third-party scripts to avoid app crash
  window.addEventListener('error', function(e){
    // ignore errors from external scripts we don't control
    try{
      var src = (e && e.filename) || (e && e.error && e.error.stack) || '';
      if(src && (src.indexOf('cdn.oaistatic.com')!==-1 || src.indexOf('ab.chatgpt.com')!==-1 || src.indexOf('chatgpt.com')!==-1)){
        console.warn('Suppressed external script error:', e.message || e);
        e.preventDefault && e.preventDefault();
        return true;
      }
    }catch(err){}
    // allow other errors to surface
  }, true);

  window.addEventListener('unhandledrejection', function(ev){
    console.warn('Suppressed unhandledrejection:', ev.reason);
    ev.preventDefault && ev.preventDefault();
  });

  // Simple router/module shim for route imports used by the page
  window.__reactRouterRouteModules = window.__reactRouterRouteModules || {};

  function createJsonResponse(obj){
    return new Response(JSON.stringify(obj),{status:200,headers:{'Content-Type':'application/json'}});
  }

  // Provide minimal implementations for API endpoints the UI may call
  function stubFetch(url, options){
    console.info('stubFetch', url);
    try{
      var s = typeof url === 'string' ? url : (url && url.url) || '';
      // common ChatGPT backend endpoints
      if(s.includes('/backend-anon/') || s.includes('/backend-api/') || s.includes('/backend-')){
        return Promise.resolve(createJsonResponse({}));
      }
      if(s.includes('/api/auth') || s.endsWith('/api/auth/providers')){
        return Promise.resolve(createJsonResponse({providers:[]}));
      }
      if(s.includes('ab.chatgpt.com') || s.includes('ab.')){
        return Promise.resolve(createJsonResponse({}));
      }
      if(s.indexOf('/cdn-cgi/')!==-1){
        return Promise.resolve(createJsonResponse({}));
      }
    }catch(e){
      return Promise.resolve(createJsonResponse({}));
    }
    return Promise.resolve(createJsonResponse({}));
  }

  if(!window.fetch._isStubbed){
    var realFetch = window.fetch.bind(window);
    window.fetch = function(url,opts){
      var s = typeof url === 'string' ? url : (url && url.url) || '';
      // Intercept remote ChatGPT telemetry and backend calls to avoid CORS and 403
      if(s && (s.indexOf('chatgpt.com')!==-1 || s.indexOf('ab.chatgpt.com')!==-1 || s.indexOf('/backend-')!==-1 || s.indexOf('/backend-anon/')!==-1 || s.indexOf('/backend-api/')!==-1 || s.indexOf('/cdn-cgi/')!==-1 || s.indexOf('/api/auth')!==-1)){
        return stubFetch(url,opts);
      }
      // allow local asset fetches and other URLs
      try{ return realFetch(url,opts); }catch(e){ return stubFetch(url,opts); }
    };
    window.fetch._isStubbed = true;
  }

  // create no-op placeholders for common global libs to prevent runtime errors
  window.__oai_logHTML = window.__oai_logHTML || function(){};
  window.__oai_logTTI = window.__oai_logTTI || function(){};

  // intercept certain global telemetry/analytics initializers if present
  window._datadog = window._datadog || {};
  window.DD_RUM && (window.DD_RUM.onReady = window.DD_RUM.onReady || function(){});

  // simple click handlers for Login/Signup buttons
  document.addEventListener('click', function(e){
    try{
      var btn = e.target.closest && e.target.closest('button, a');
      if(!btn) return;
      if(btn.dataset.testid && btn.dataset.testid.toLowerCase().includes('login')){
        alert('Login is stubbed in this local build');
        e.preventDefault();
      }
      if(btn.dataset.testid && btn.dataset.testid.toLowerCase().includes('signup')){
        alert('Signup is stubbed in this local build');
        e.preventDefault();
      }
    }catch(err){}
  });

  // remove hidden cloudflare iframe (if exists) to avoid cross-document access errors
  try{ var ifr = document.querySelector('iframe'); if(ifr && ifr.style && ifr.style.visibility==='hidden') ifr.remove(); }catch(e){}

})();
