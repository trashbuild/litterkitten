const angy = [
  'MROW.',
  'MRRRrrrrRRR.',
  'HISS!'
]

const confused = [
  'Mrow?',
  'Mrr?',
  'Mrr-mrow?',
  'Hrrmrr?'
]

const no = [
  'Mrowl.',
  'Mrmph.',
  'Merp.'
]

// const yes = [
//   ''
// ]

function sound (arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

exports.angy = function () {
  return sound(angy)
}

exports.confused = function () {
  return sound(confused)
}

exports.no = function () {
  return sound(no)
}
