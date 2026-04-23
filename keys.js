/**
 * 🔐 Havenova-X Key Vault (2026)
 * Keys are XOR-obfuscated + Base64 encoded.
 * This is NOT encryption — it stops casual inspection only.
 * For production, use a backend proxy (BFF pattern).
 * @see https://securityboulevard.com/2026/01/stop-leaking-api-keys-the-backend-for-frontend-bff-pattern-explained/
 */
(function (global) {
    'use strict';

    const _SEED = "HavenovaX2026";

    function _xor(s, k) {
        let r = '';
        for (let i = 0; i < s.length; i++) {
            r += String.fromCharCode(s.charCodeAt(i) ^ k.charCodeAt(i % k.length));
        }
        return r;
    }

    function _dec(b64) {
        try {
            const s = atob(b64);
            return _xor(s, _SEED);
        } catch (e) {
            console.error('[KeyVault] Decode failed');
            return '';
        }
    }

    const _ENCODED = [
        "KQopVwcVQhgSAUlnByEgRi1YXx8Ia0cHBEQ9UhcnXi0=",
        "KQopVwcFQzE9BGBrAxsrQTQ5Wj8PaXFqBXQGUxo9Vi0=",
        "KQopVwwDQVMvAEUEBisnT1cmW08ibWtZAAYlUiUQVzs=",
        "KQopVz4fTjEwAlNGDhg1RCkFWhkUa1h1AlM4VQ8qVhg=",
        "KQopVx4OQQgpAEBrBX8GQiwDXRA2bEZEA1giVScCVyg="
    ];

    const _POOL = _ENCODED.map(_dec).filter(Boolean);

    // Rotate keys on each access to distribute load
    let _idx = Math.floor(Math.random() * _POOL.length);

    global.__KEY_VAULT = {
        getAll() { return [..._POOL]; },
        getNext() {
            const k = _POOL[_idx % _POOL.length];
            _idx = (_idx + 1) % _POOL.length;
            return k;
        },
        get length() { return _POOL.length; }
    };

    // Seal to prevent tampering
    if (Object.freeze) Object.freeze(global.__KEY_VAULT);
})(typeof window !== 'undefined' ? window : this);
