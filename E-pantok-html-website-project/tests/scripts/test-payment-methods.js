const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('src/payment-methods.html', 'utf8');

async function runTest(methodName) {
    const dom = new JSDOM(html, {
        runScripts: 'dangerously',
        resources: 'usable',
        url: 'http://localhost/',
        beforeParse(window) {
            // Ensure paymentInfo.service exists before scripts run
            window.localStorage.setItem('paymentInfo', JSON.stringify({ service: 'Barangay Clearance' }));
        }
    });
    const { window } = dom;

    await new Promise(resolve => window.addEventListener('load', resolve));

    const amountEl = window.document.getElementById('amount-display');
    const amountText = amountEl ? amountEl.textContent : null;

    const radio = window.document.querySelector(`input[value="${methodName}"]`);
    if (!radio) return { methodName, error: 'radio-not-found' };

    // Select and trigger change
    radio.checked = true;
    radio.dispatchEvent(new window.Event('change', { bubbles: true }));

    // Submit the form
    const form = window.document.querySelector('form');
    if (!form) return { methodName, error: 'form-not-found' };
    form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));

    // Wait for any redirects (the page uses a 500ms timeout)
    await new Promise(res => setTimeout(res, 800));

    let paymentObj = null;
    try {
        paymentObj = JSON.parse(window.localStorage.getItem('paymentInfo'));
    } catch (e) { /* ignore */ }

    const redirect = typeof window.location.href === 'string' && window.location.href.endsWith('payment-success.html');

    return { methodName, amountText, paymentObj, redirect };
}

(async () => {
    const methods = ['gcash', 'paymaya'];
    for (const m of methods) {
        const res = await runTest(m);
        console.log('TEST RESULT:', JSON.stringify(res, null, 2));
    }
})();
