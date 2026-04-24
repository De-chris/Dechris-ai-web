/**
 * Dechris AI - Secure Key Vault (2026)
 * Multi-layer obfuscation to deter casual extraction
 * WARNING: True security requires a backend proxy. This is obfuscation only.
 * Technique: Reverse → Base64 → Fragment → Shuffle → Runtime Reassembly
 */

const KeyVault = (() => {
  'use strict';

  // Obfuscated fragments (Reversed → Base64 → 4-char chunks → Shuffled)
  const _vault = [
    // KEY_1: ak_2iz4yJ3yU1iA0H60ii3u76ru3aB0B
    ["a2E=", "aTJf", "eTR6", "eTNK", "aTFV", "SDBB", "aTA2", "dTNp", "cjY3", "YTN1", "QjBC"],
    // KEY_2: ak_2ij5Pe6PY5SJ7QW5In1CZ7BN2lX8B
    ["a2E=", "aTJf", "UDVq", "UDZl", "UzVZ", "UTdK", "STVX", "QzFu", "Qjda", "bDJO", "QjhY"],
    // KEY_3: ak_2bl72w2u60cF92H49C5Yi20m3Su9T
    ["a2E=", "YjJf", "Mjds", "dTJ3", "YzA2", "MjlG", "OTRI", "WTVD", "MDJp", "UzNt", "VDl1"],
    // KEY_4: ak_2Pp8Ph0ct8PT2Lk5ou3jE0ep4yO8w
    ["a2E=", "UDJf", "UDhw", "YzBo", "UDh0", "TDJU", "bzVr", "ajN1", "ZTBF", "eTRw", "dzhP"],
    // KEY_5: ak_2pa7iq2pY37g4Im2fW4tt1nj4Qg9G
    ["a2E=", "cDJf", "aTdh", "cDJx", "NzNZ", "STRn", "ZjJt", "dDRX", "bjF0", "UTRq", "Rzln"]
  ];

  // Deterministic unshuffle map (inverse of shuffle)
  const _unshuffle = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];

  function _decode(frags) {
    const ordered = new Array(frags.length);
    for (let i = 0; i < frags.length; i++) {
      ordered[_unshuffle[i]] = frags[i];
    }
    const b64 = ordered.join('');
    const reversed = atob(b64);
    return reversed.split('').reverse().join('');
  }

  return {
    getKeys() {
      return _vault.map(k => _decode(k));
    },
    rotate(index) {
      const keys = this.getKeys();
      return keys[index % keys.length];
    }
  };
})();

// Export for module-like usage in browser
if (typeof window !== 'undefined') {
  window.KeyVault = KeyVault;
}
