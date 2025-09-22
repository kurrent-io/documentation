(function () {
    if (typeof window === 'undefined') return;
    if (typeof window.signals !== 'undefined') return;
    var script = document.createElement('script');
    script.src = 'https://cdn.cr-relay.com/v1/site/da9bc552-0721-4931-aae9-9706006d2986/signals.js';
    script.async = true;
    window.signals = Object.assign(
        [],
        ['page', 'identify', 'form'].reduce(function (acc, method) {
            acc[method] = function () {
                signals.push([method, arguments]);
                return signals;
            };
            return acc;
        }, {})
    );
    document.head.appendChild(script);
})();