$(document).ready(function() {

  //{{{ player

  function update_played() {
    var history = history_get()
    $('.item').each(function(i, item){
      var ident = basename_url($(item).find('.showlink').attr('href'))
      if (history[ident] != undefined) $(item).find('.playbtn').css({'color': '#B000FF' })
    })
  }
  update_played()

  function player_kill() {
    // remove player div
    $('.kplayer').remove()
    $('.main').removeData('audioPlayer')

    // restore play buttons
    $('.audiobtn').show()
    $('.showlink').show()

    // restore borders and undim rows
    $('.item').css({'border-color': '#ddd'})
    $('.item').off('mouseenter mouseleave')
    $('.item').stop().animate({'opacity': '1'}, 500)
    $('.item').children().removeClass('grayscale')

    // update played status
    update_played()

    // unset background
    background = false
    bg_unset()
  }

  function play() {
    // get some vars together
    var row = $(this).closest('.item')
    var showlink = $(row.find('.showlink'))
    var ident = basename_url(showlink.attr('href'))

    // kill any other players
    player_kill()

    // get sources
    var links = $(this).closest('.item').find('.audiolink')
    sources = get_sources(links)

    // initialize player
    var target = $(row.children('.main').get())
    player = player_init(target, ident, {
      sources: sources,
      title: showlink.html(),
      url: showlink.attr('href')
    })

    // hide button and showlink
    $(this).hide()
    showlink.hide()

    // row dimming + border removal
    row.css({'opacity': '1'})
    $('.item').css({'border-color': 'transparent'})
    $('.item').stop().not(row).animate({'opacity': '0.3'}, 2000,
        function() { $('.item').not(row).children().addClass('grayscale') })
    $('.item').not(row).hover(
      function() {
        $(this).css({'opacity': '1'})
        $(this).children().removeClass('grayscale')
      },
      function() {
        $(this).css({'opacity': '0.3'})
        $(this).children().addClass('grayscale')
      }
    )

    // show popover for the in-player title
    $('.kplayer .title a').hover(pop)

    // clean up on kill
    target.on('killed', player_kill)

    // set background global to the show's thumbnail
    background = row.find('img').attr('src')
    bg_set(background)

    // start playback
    player.play()
  }

  // show play-buttons and bind click
  $('.playbtn').show()
  $('.playbtn').click(play)

  //}}}
  //{{{ background

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

  // no bg set to begin with
  background = false

  // use thumbnail as page background when hovering over show
  // unless a persistent one is set
  $('.showlink').hover(
    function() { if (!background) { bg_set($(this).closest('.item').find('img').attr('src')) } },
    function() { if (!background) { bg_unset() } }
  )

  //}}}
  //{{{ popovers

  function pop() {
    var e = $(this);
    if (e.data('title') == undefined) {
      e.data('title', '');
      var ident = basename_url($(e).attr('href'))
      var url = '/showinfo/'+ident
      $.get(url, function(r) {
        var title = $(r).find('#title').text
        e.popover('destroy').popover({ html : true, trigger : 'hover', content: r, container: 'body'})
        if (e.is(':hover')) { e.popover('show') }
      })
    }
  }
  $('body').on('mouseover', '.showlink', pop)

  //}}}
})
