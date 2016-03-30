/* util */

function basename_url(url) { return url.split('/').reverse()[0].split('.')[0] }

/* cookies */

function cookie_set(key, value) {
  var expires = new Date();
  expires.setFullYear(expires.getFullYear() + 10);
  document.cookie = key + '=' + value + ';path=/;expires=' + expires.toGMTString();
}

function cookie_get(key) {
  var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
  return keyValue ? keyValue[2] : null;
}

/* history */

function history_get(ident) {
  var h = JSON.parse(cookie_get('history') || '{}')
  if (ident) { return h[ident] } else { return h }
}

function history_save(h) { cookie_set('history', JSON.stringify(h)) }

function history_update(ident, tuple) {
  var h = history_get()
  h[ident] = tuple
  history_save(h)
}

/* player */

function get_sources(links) {
  // get sources from links
  var sourcesh = {}
  links.each(function(l,e) {
    var ident = e.href.split('/').reverse()[0].split('.')[0]
    if (sourcesh[ident]) {
      sourcesh[ident].urls.push(e.href)
    } else {
      var src = {}
      src.waveform = e.getAttribute('data-waveform')
      src.urls = [ e.href ]
      var cue_string = e.getAttribute('data-cues')
      if (cue_string) { src.cues = ('0,'+cue_string).split(',').map(function(c) { return parseInt(c) }) } else { src.cues = [] } //FIXME: pretty hacky getting cues undefined otherwise
    sourcesh[ident] = src
    }
  })
  // turn dict into array and return
  var sources = []
  $.each(sourcesh, function(id,s) {
    s.ident = id
    sources.push(s)
  })
  return sources
}

function player_init(target, ident, attrs) {
  var player = $(target).audioPlayer(attrs)

  // bind history update events
  var player = $(player).data('audioPlayer')
  player.audio.on('timeupdate', function() {
    var track = player.settings.sources.indexOf(player.source)
    var time = this.currentTime
    history_update(ident, [track, time])
  })
  player.audio.on('ended', function() {
    var track = player.settings.sources.indexOf(player.source)
    history_update(ident, [track, 'ended'])
  })

  // read history & restore track/position
  var h = history_get(ident) || [0, 0]
  if (h[1] == 'ended') h[1] = 0
  player.load(player.settings.sources[h[0]])
  player.seek(h[1])
  return player
}
