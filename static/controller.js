$(document).ready(function() {

  function kill_audio() {
    // stop audio
    $('audio').trigger("stop");
    // remove player
    $('#player').remove()
    // return buttons to 'play' icon
    $('.playbtn').html('<i class="fa fa-play"></i>')
    // remove skip btns
    $('.skipbtn').remove()
    // unset background and clear the global
    background = false
    bg_unset()
  }

  function audio_fwd() {
    var a = $('audio')
    var current = parseInt(a.prop('currentTime'))
    var chapters = a.data.chapters
    for (i = 0; i < chapters.length; i++) {
      var marker = chapters[i]
      if (marker > current) {
        a.prop('currentTime', marker)
        break
      }
    }
  }

  function audio_back() {
    var a = $('audio')
    var current = parseInt(a.prop('currentTime'))
    var chapters = a.data.chapters
    for (i = chapters.length; i >= 0; i--) {
      var marker = chapters[i]
      if (marker < current) {
        a.prop('currentTime', marker)
        break
      }
    }
  }

  function toggle_play(e) {
    // find if we're stopped or playing
    var isthisstopped = $(this).find('.fa-play').length
    // stop any other audio in any case
    kill_audio()
    // start audio if we're not playing
    if (isthisstopped) {
      // find target placement for the player
      var row = $(this).closest('tr')
      var target = row.find('.showlink').parent()
      // insert div for the player
      var playerdiv = $('<div id="player"></div>').appendTo(target);
      // insert audio into the div
      playerdiv.html('<audio controls autoplay></audio>');
      // insert sources into the audio
      $(this).closest('tr').find('.audiolink').each(function(l,e) {
        $('audio').append('<source src="'+e.href+'">')
      })
      // show player
      $(playerdiv).show()
      // start audio
      $('audio').trigger("play");
      // change button icon to 'stop'
      $(this).html('<i class="fa fa-stop"></i>')
      // set audio to hide and die if ended or problems
      $('audio').on('error abort ended', kill_audio)
      // set background global to the show's thumbnail
      background = $(this).closest('tr').find('img').attr('src')
      bg_set(background)
      // chapter support #FIXME: well messy
      var chapters = $(this).attr('data-chapters')
      if (chapters) {
        $('audio').data.chapters = [for (t of ('0,'+chapters).split(',')) parseInt(t)]
        var backbtn = $('<button title="Previous piece" class="btn btn-default skipbtn"><i class="fa fa-step-backward"></i></button>')
        var fwdbtn = $('<button title="Next piece" class="btn btn-default skipbtn"><i class="fa fa-step-forward"></i></button>')
        var btns = backbtn.add(fwdbtn)
        btns.prependTo($(this).parent())
        btns.wrapAll('<div class="btn-group skipbtn" role="group"></div>')
        backbtn.click(audio_back)
        fwdbtn.click(audio_fwd)
      }
    }
  }

  background = false
  function bg_set(image) {
    var img = $('#background img')
    img.attr('src', image)
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

  // show play-buttons and bind click event
  $('.playbtn').show()
  $('.playbtn').click(toggle_play)

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
