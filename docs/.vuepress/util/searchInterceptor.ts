// Export the interceptor as a string for VuePress
// Reads from meta tags to ensure it matches the server-side calculated values
export const searchInterceptor = `
(function() {
  function getFilters() {
    // Read from meta tags to ensure we match what's in the HTML
    // This includes "latest" when applicable, which is calculated server-side
    const productMeta = document.querySelector('meta[name="docsearch:product"]');
    const versionMeta = document.querySelector('meta[name="docsearch:version"]');
    
    const product = productMeta ? productMeta.getAttribute('content') : null;
    const version = versionMeta ? versionMeta.getAttribute('content') : null;

    return { 
      product: product, 
      version: version 
    };
  }

  function buildOptionalFilters(product, version) {
    const optionalFilters = [];
    if (product) {
      optionalFilters.push("product:" + product);
    }
    if (version) {
      const versionParts = version.split(',');
      versionParts.forEach(v => {
        optionalFilters.push("version:" + v.trim());
      });
    }
    return optionalFilters;
  }

  function applyFiltersToBody(body, optionalFilters) {
    if (optionalFilters.length > 0) {
      body.requests = body.requests || [];
      body.requests.forEach(req => {
        // Set optionalFilters directly on the request
        req.optionalFilters = optionalFilters;
      });
    }
  }

  // Intercept XMLHttpRequest (XHR)
  // Service workers won't work here because they only intercept fetch(), not XMLHttpRequest
  const proxied = window.XMLHttpRequest.prototype.open;
  window.XMLHttpRequest.prototype.open = function(method, url) {
    const urlString = typeof url === 'string' ? url : url.toString();
    if (urlString.includes('algolia.net')) {
      const send = this.send;
      this.send = function(data) {
        // Only process if data is a string (JSON payload)
        if (typeof data === 'string' && data.trim()) {
          try {
            const body = JSON.parse(data);
            const { product, version } = getFilters();
            const optionalFilters = buildOptionalFilters(product, version);
            
            if (optionalFilters.length > 0) {
              applyFiltersToBody(body, optionalFilters);
              const modifiedData = JSON.stringify(body);
              return send.apply(this, [modifiedData]);
            }
          } catch(e) {
            // Silently fall through to original send if parsing fails
            // (might be non-JSON data or malformed JSON)
          }
        }
        return send.apply(this, [data]);
      };
    }
    return proxied.apply(this, [].slice.call(arguments));
  };
})();
`;
