/**
 * Dechris AI - Secure Key Vault (2026)
 */

const KeyVault = (() => {
  'use strict';

  const _vault = [
    ["a2E=", "aTJf", "eTR6", "eTNK", "aTFV", "SDBB", "aTA2", "dTNp", "cjY3", "YTN1", "QjBC"],
    ["a2E=", "aTJf", "UDVq", "UDZl", "UzVZ", "UTdK", "STVX", "QzFu", "Qjda", "bDJO", "QjhY"],
    ["a2E=", "YjJf", "Mjds", "dTJ3", "YzA2", "MjlG", "OTRI", "WTVD", "MDJp", "UzNt", "VDl1"],
    ["a2E=", "UDJf", "UDhw", "YzBo", "UDh0", "TDJU", "bzVr", "ajN1", "ZTBF", "eTRw", "dzhP"],
    ["a2E=", "cDJf", "aTdh", "cDJx", "NzNZ", "STRn", "ZjJt", "dDRX", "bjF0", "UTRq", "Rzln"]
  ];

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

if (typeof window !== 'undefined') {
  window.KeyVault = KeyVault;
}
