$(document).ready(function() {
  // get sources
  var links = $('body').find('.audiolink')
  var sources = get_sources(links)
  var ident = links[0].href.split('/').reverse()[1]

  // initialize player
  player_init('#player', ident, { sources: sources })
})
