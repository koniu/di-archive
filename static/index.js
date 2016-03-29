$(document).ready(function() {

  function player_kill() {
    // remove player div
    $('.kplayer').remove()
    $('.main').removeData('audioPlayer')

    // restore play buttons
    $('.audiobtn').show()
    $('.showlink').show()

    // unset background
    background = false
    bg_unset()
  }

  function play() {
    // kill any other players
    player_kill()

    // get sources
    var sourcesh = {}
    $(this).closest('.item').find('.audiolink').each(function(l,e) {
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

    // hide our button
    $(this).hide()

    // initialize player
    var row = $(this).closest('.item')
    var target = $(row.children('.main').get())
    var showlink = $(row.find('.showlink'))
    player = target.audioPlayer({
      sources: sources,
      title: showlink.html(),
      url: showlink.attr('href')
    })
    showlink.hide()
    // show popover for the in-plauer title
    $('.kplayer .title a').hover(pop)
    // clean up on kill
    player.on('killed', player_kill)

    // set background global to the show's thumbnail
    background = $(this).closest('.item').find('img').attr('src')
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
    function() { if (!background) { bg_set($(this).closest('.item').find('img').attr('src')) } },
    function() { if (!background) { bg_unset() } }
  )

  // popovers with show blurb when hovering over show
  function pop() {
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
  }
  $('body').on('mouseover', '.showlink', pop)

})
