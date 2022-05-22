function sound (arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

module.exports = {
  angy: () => sound([
    'MROW.',
    'MRRRrrrrRRR.',
    'HISS!',
    'GRRRWML!'
  ]),
  confused: () => sound([
    'Mrow?',
    'Mrr?',
    'Mrr-mrow?',
    'Hrrmrr?'
  ]),
  no: () => sound([
    'Mrowl.',
    'Mrmph.',
    'Merp.',
    'Ermph.'
  ]),
  working: () => sound([
    'Hrrm...',
    'Mrr...',
    'Ermph...',
    '*scratching sounds*...'
  ]),
  yes: () => sound([
    'Prr!',
    'Vrr.',
    'Ermp.'
  ])
}
