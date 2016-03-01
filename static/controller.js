$(document).ready(function() {

  function kill_audio() {
    // stop audio
    $('audio').trigger("stop");
    // remove player
    $('#player').remove()
    // return buttons to 'play' icon
    $('.playbtn').html('&nbsp;<i class="fa fa-play"></i>&nbsp;')
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
      $(this).html('&nbsp;<i class="fa fa-stop"></i>&nbsp;')
      // set audio to hide and die if ended or problems
      $('audio').on('error abort ended', kill_audio)
    }
  }

  function bg_set(image) {
    var img = $('#background img')
    img.attr('src', image)
    img.stop(true).fadeTo(2000, 0.3)
  }

  function bg_unset() {
    var img = $('#background img')
    img.stop(true).fadeOut(1000)
  }

  // show play-buttons and bind click event
  $('.playbtn').show()
  $('.playbtn').click(toggle_play)

  // use thumbnail as page background when hovering over show
  $('.showlink').hover(
    function() { bg_set($(this).closest('tr').find('img').attr('src')) },
    bg_unset
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
