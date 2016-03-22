$(document).ready(function() {

    var sources = []
    var waveforms = []
    $('body').find('.audiolink').each(function(l,e) {
      var waveform = e.getAttribute('data-waveform')
      sources.push(e.href)
      waveforms.push(waveform)
    })

    // get cues
    var cues = []
    var cue_string= $('#player').attr('data-chapters')
    if (cue_string) {
      cues = ('0,'+cue_string).split(',').map(function(c) { return parseInt(c) })
    }

    // initialize player
    $('#player').audioPlayer({
      sources: sources,
      cues: cues
    })


})
