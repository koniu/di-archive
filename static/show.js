$(document).ready(function() {
    $('#background').hide()
    // get sources
    var sourcesh = {}
    $('body').find('.audiolink').each(function(l,e) {
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
    // turn dict into array
    var sources = []
    $.each(sourcesh, function(id,s) {
      s.ident = id
      sources.push(s)
    })

    // initialize player
    $('#player').audioPlayer({
      sources: sources,
    })

})
