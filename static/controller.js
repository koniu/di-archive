$(document).ready(function() {

  function timesplit(a) {
    if (isNaN(a)) { return "..." }
    var hours = Math.floor(a / 3600);
    var minutes = Math.floor(a / 60) - (hours * 60);
    var seconds = Math.floor(a) - (hours * 3600) - (minutes * 60);
    if (seconds < 10) { seconds = '0' + seconds }
    if (minutes < 10) { minutes = '0' + minutes }
    if (hours < 10) { hours = '0' + hours }
    return hours + ':' + minutes + ':' + seconds
  }

  function audio_kill(e) {
    if (e) { console.log(e) }
    // stop audio
    $('audio').trigger("stop");
    // remove player
    $('#player').remove()
    // return buttons to 'play' icon
    $('.playbtn').html('<i class="fa fa-play"></i>')
    $('.playbtn').attr('title', 'Play')
    // remove extra btns
    $('.pausebtn').remove()
    $('.seekdiv').remove()
    $('.backfwd').remove()
    // kill green highlight
    $('.audiobtn').removeClass('btn-success')
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
      if (marker < current - 2 ) {
        a.prop('currentTime', marker)
        break
      }
    }
  }

  function audio_toggle() {
    var a = $('audio')
    if (a.prop('paused')) {
      $('.pausebtn').html('<i class="fa fa-pause"></i>');
      $('audio').trigger("play")
    } else {
      $('.pausebtn').html('<i class="fa fa-play"></i>');
      $('audio').trigger("pause")
    }
  }

  function audio_time() {
    var a = $('audio')
    $('.playtime').html(
      '<small>' +
      timesplit(a.prop('currentTime')) +
      ' / ' +
      timesplit(a.prop('duration')) +
      '</small>'
    )
    audio_buffer()
  }

  function audio_skip(v) {
    var a = $('audio')
    var step = 5
    var current = a.prop('currentTime')
    $('#seek').val(current + v*step)
    $('#seek').trigger('change')
  }

  function audio_seek() {
    var a = $('audio')
    var val = $('#seek').val()
    a.prop('currentTime', val)
    audio_buffer()
  }

  function audio_buffer() {
    // shamelessly stolen and adapted from:
    // https://github.com/iainhouston/bootstrap3_player
    // you crazy hack :)
    var i, bufferedstart, bufferedend;
    var audio = $('audio')[0]
    var seek = $('#seek')
    var passd = 'rgba(200, 200, 200, '
    var buffd = 'rgba(235, 235, 235, '
    var bg = passd+'1) 0%';
    bg += ', '+passd+'1) ' + ((audio.currentTime / audio.duration) * 100) + '%';
    bg += ', '+passd+'0) ' + ((audio.currentTime / audio.duration) * 100) + '%';
    for (i = 0; i < audio.buffered.length; i++) {
        if (audio.buffered.end(i) > audio.currentTime &&
            isNaN(audio.buffered.end(i)) === false &&
            isNaN(audio.buffered.start(i)) === false) {

            if (audio.buffered.end(i) < audio.duration) {
                bufferedend = ((audio.buffered.end(i) / audio.duration) * 100);
            } else {
                bufferedend = 100;
            }
            if (audio.buffered.start(i) > audio.currentTime) {
                bufferedstart = ((audio.buffered.start(i) / audio.duration) * 100);
            } else {
                bufferedstart = ((audio.currentTime / audio.duration) * 100);
            }
            bg += ', '+buffd+'0) ' + bufferedstart + '%';
            bg += ', '+buffd+'1) ' + bufferedstart + '%';
            bg += ', '+buffd+'1) ' + bufferedend + '%';
            bg += ', '+buffd+'0) ' + bufferedend + '%';
        }
    }
    seek.css('background', '-webkit-linear-gradient(left, ' + bg + ')');
    seek.css('background','-o-linear-gradient(left,  ' + bg + ')');
    seek.css('background','-moz-linear-gradient(left,  ' + bg + ')');
    seek.css('background','-ms-linear-gradient(left,  ' + bg + ')');
    seek.css('background','linear-gradient(to right,  ' + bg + ')');
    seek.css('background-color', '#fff');
};

  function toggle_play(e) {
    // find if we're stopped or playing
    var isthisstopped = $(this).find('.fa-play').length
    // stop any other audio in any case
    audio_kill()
    // start audio if we're not playing
    if (isthisstopped) {
      // find target placement for the player
      var row = $(this).closest('tr')
      //var target = row.find('.showlink').parent()
      var target = $(this).closest('td')
      // insert div for the player
      var playerdiv = $('<div id="player"></div>').prependTo(target);
      // insert audio into the div
      playerdiv.html('<audio autoplay></audio>')
      var a = $('audio')
      // insert sources into the audio
      $(this).closest('tr').find('.audiolink').each(function(l,e) {
        a.append('<source src="'+e.href+'">')
      })
      // start audio
      a.trigger("play");
      // change button icon to 'stop'
      $(this).html('<i class="fa fa-stop"></i>')
      $(this).attr('title', 'Stop: Escape')
      // replace button icon if audio ended
      a.on('ended', function() { $('.pausebtn').html('<i class="fa fa-play"></i>') })
      // set background global to the show's thumbnail
      background = $(this).closest('tr').find('img').attr('src')
      bg_set(background)

      // play/pause
      var pause = $('<button title="Play/Pause: Enter" class="btn btn-default pausebtn audiobtn"><i class="fa fa-pause"></i></button>')
      pause.prependTo($(this).parent())
      pause.click(audio_toggle)

      // chapter support
      var chapters = $(this).attr('data-chapters')
      if (chapters) {
        a.data.chapters = ('0,'+chapters).split(',').map(function(c) { return parseInt(c) })
        var backbtn = $('<button title="Previous piece: [" class="btn btn-default audiobtn"><i class="fa fa-step-backward"></i></button>')
        var fwdbtn = $('<button title="Next piece: ]" class="btn btn-default audiobtn"><i class="fa fa-step-forward"></i></button>')
        var btns = backbtn.add(fwdbtn)
        btns.prependTo($(this).parent())
        btns.wrapAll('<div class="btn-group audiobtn backfwd" role="group"></div>')
        backbtn.click(audio_back)
        fwdbtn.click(audio_fwd)
      }

      // seekbar
      var seek = $('<div class="btn btn-default disabled hidden-sm hidden-xs audiobtn seekdiv"><input title="Seek:   Left/Right  5s    Up/Down  15s    PageUp/Down  5m" type="range" min=0 value=0 class="audiobtn" id="seek"></input></div>')
      var focus_seekbar = function(e) { e.stopPropagation(); $('#seek').focus(); $('.audiobtn').trigger('focus')}
      seek.prependTo($(this).parent())
      seek_init = function () {
        var a = $('audio')
        var s = $('#seek')
        s.attr({
          'max': a.prop('duration'),
          'step': 5
        })
        var cur = a.prop('currentTime')
        s.val(cur);
      }
      a.on('timeupdate', seek_init)
      a.on('loadedmetadata', seek_init)
      a.on('loadeddata', seek_init)
      a.on('progress', seek_init)
      a.on('canplay', seek_init)
      a.on('canplaythrough', seek_init)
      $('#seek').on('change', audio_seek)
      $('#seek').on('input', audio_seek)

      // time counter
      var time = $('<div class="playtime"><small>...</small></div>')
      $('.seekdiv').append(time)
      a.on('loadedmetadata', audio_time);
      a.on('loadeddata', audio_time);
      a.on('progress', audio_time);
      a.on('canplay', audio_time);
      a.on('canplaythrough', audio_time);
      a.on('timeupdate', audio_time);

      // kbd controls
      $('.audiobtn').keydown(function(event){
        var a = $('audio')[0]
        switch(event.keyCode) {
          case 27:
            audio_kill(); return false
          case 13:
            event.preventDefault(); audio_toggle(); return false
          case 37:  // left
            event.preventDefault(); audio_skip(-1); return false
          case 39:  // right
            event.preventDefault(); audio_skip(1); return false
          case 38:  // down
            event.preventDefault(); audio_skip(3); return false
          case 40:  // up
            event.preventDefault(); audio_skip(-3); return false
          case 33: // page up
            event.preventDefault(); audio_skip(60); return false
          case 34: // page down
            event.preventDefault(); audio_skip(-60); return false
          case 36: // home
            event.preventDefault();
            a.currentTime = 0
            return false
          case 35: // end
            event.preventDefault();
            a.currentTime = a.duration
            return false
          case 219: // [
            audio_back(); return false
          case 221: // ]
            audio_fwd(); return false
        }
      })

      $('.audiobtn').focus(function() {$(this).parent().parent().find('.audiobtn').addClass('btn-success') })
      $('.audiobtn').blur(function() {$(this).parent().parent().find('.audiobtn').removeClass('btn-success') })
      $('#seek').focus()
    }
  }

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

  // show play-buttons and bind click event for play
  $('.playbtn').show()
  $('.playbtn').click(toggle_play)

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
