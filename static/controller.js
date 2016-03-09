$(document).ready(function() {

  function player_kill() {
    // remove player div
    $('.player').parent().remove()

    // restore play buttons
    $('.audiobtn').show()

    // unset background
    background = false
    bg_unset()
  }

  function play() {
    // kill any other players
    player_kill()

    // get sources
    var sources = []
    var waveforms = []
    $(this).closest('tr').find('.audiolink').each(function(l,e) {
      var waveform = e.getAttribute('data-waveform')
      sources.push(e.href)
      waveforms.push(waveform)
    })

    // get cues
    var cues = []
    var cue_string= $(this).attr('data-chapters')
    if (cue_string) {
      cues = ('0,'+cue_string).split(',').map(function(c) { return parseInt(c) })
    }

    // hide our button
    $(this).hide()

    // initialize player
    var player = $('<div>').audioPlayer({
      sources: sources,
      cues: cues
    })

    // insert player
    $(this).parent().prepend(player)

    // clean up on kill
    player.on('killed', player_kill)

    // set background global to the show's thumbnail
    background = $(this).closest('tr').find('img').attr('src')
    bg_set(background)

    // trigger play
    $('audio').trigger('play')
  }

  function bg_set(image) {
    // set image src
    var img = $('#background img')
    img.attr('src', image)
    // stop other animations and fade in
    img.stop(true).fadeTo(2000, 0.3)
    return image
  }

  function bg_unset() {
    var img = $('#background img')
    // fadeout background and return tho the played one
    img.stop(true).fadeOut(1000, function() {
      if (background) { bg_set(background) }
    })
  }

  // show play-buttons and bind click
  $('.playbtn').show()
  $('.playbtn').click(play)

  // no bg set to begin with
  background = false

  // use thumbnail as page background when hovering over show
  // unless a persistent one is set
  $('.showlink').hover(
    function() { if (!background) { bg_set($(this).closest('tr').find('img').attr('src')) } },
    function() { if (!background) { bg_unset() } }
  )

  // popovers with show blurb when hovering over show
  $('body').on('mouseover', '.showlink', function() {
    var e = $(this);
    if (e.data('title') == undefined) {
      e.data('title', '');
      var ident = $(e).attr('href').split('/').reverse()[0]
      var url = '/showinfo/'+ident
      $.get(url, function(r) {
        var title = $(r).find('#title').text
        e.popover('destroy').popover({ html : true, trigger : 'hover', content: r, container: 'body'})
        if (e.is(':hover')) { e.popover('show') }
      })
    }
  })

})
