(function($) {
  //{{{ utility functions
  var timesplit = function(a) {
    if (isNaN(a)) { return "..." }
    var hours = Math.floor(a / 3600);
    var minutes = Math.floor(a / 60) - (hours * 60);
    var seconds = Math.floor(a) - (hours * 3600) - (minutes * 60);
    if (seconds < 10) { seconds = '0' + seconds }
    if (minutes < 10) { minutes = '0' + minutes }
    if (hours < 10) { hours = '0' + hours }
    return hours + ':' + minutes + ':' + seconds
  }
  //}}}
  //{{{ player code
  $.audioPlayer = function(element, options) {
      //{{{ settings
      var defaults = {
        html: '<div class="kplayer"><div class="seekbar"><div class="waveform"></div><input class="slider" type="range"></input><div class="time">...</div><div class="title"></div><div class="track"></div></div><div class="buttons"><button class="kbd_toggle"><i class="fa fa-keyboard-o"></i></button><button class="prev"><i class="fa fa-step-backward"></i></button><button class="next"><i class="fa fa-step-forward"></i></button><button class="toggle"><i class="fa fa-play"></i></button><button class="kill"><i class="fa fa-stop"></i></button></div></div>',
        sources: [],
        controls: {
          toggle: { title: 'Play/Pause',      keys: '⌨ Space'     },
          next:   { title: 'Next piece',      keys: '⌨ ]'         },
          prev:   { title: 'Previous piece',  keys: '⌨ ['         },
          kill:   { title: 'Stop',            keys: '⌨ Delete'    },
          slider: {
            title: 'Seek',
            keys: '⧗\t\t⌨\n±1s\t\tCtrl+Left/Right\n±5s\t\tLeft/Right\n±15s\tUp/Down\n±5m\tPageUp/Down\n'
          },
          kbd_toggle: {
            title: 'Toggle keyboard controls',
            keys: '⌨ Escape\n\nHover over controls to see keyboard shortcuts'
          }
        },
        bar_colors: {
          buffered: '#ebebeb',
          played:   '#c8c8c8',
          cue:      '#aaa',
          normal:   '#ffffff'
        }
      }
      var player = this // FIXME: make local again
      player._target = element
      //}}}
      //{{{ private methods
      //{{{ update_time
      var update_time = function() {
        player.time.html(
          '<small>' +
          timesplit(player.audio.prop('currentTime')) +
          ' / ' +
          timesplit(player.audio.prop('duration')) +
          '</small>'
        )
      }
      //}}}
      //{{{ update_slider
      var update_slider = function() {
        var current = player.audio.prop('currentTime')
        var duration = player.audio.prop('duration')
        player.slider.attr({ max: duration })
        player.slider.val(current)
        update_slider_bg()
      }
      //}}}
      //{{{ update_slider_bg
      var update_slider_bg = function() {
        var arr = []
        var a = player.audio.get(0)
        // fill with '1' for what's buffered
        for (i = 0; i < a.buffered.length; i++) {
          var bufstart = (a.buffered.start(i)/a.duration)*1000
          var bufend = (a.buffered.end(i)/a.duration)*1000
          for (j = bufstart; j < bufend; j++) { arr[j] = 1 }
        }
        // fill with '2' for what's played
        for (i = 0; i < (a.currentTime/a.duration)*1000; i++) { arr[i] = 2 }
        // fill with '4' for cue markers
        var cues = player.source.cues
        for (i = 0; i < cues.length; i++) {
          if (cues[i] > 0 && cues[i] < a.duration - 10) {
            var marker = parseInt((cues[i]/a.duration)*1000)
            arr[marker] = 4
            arr[marker-1] = 4
          }
        }
        // stringify arr
        var bg = ''
        var cols = player.settings.bar_colors
        for (i = 0; i < 1000; i++) {
          switch(arr[i]) {
            case 1: bg += cols.buffered; break;
            case 2: bg += cols.played; break;
            case 4: bg += cols.cue; break;
            default: bg += cols.normal;
          }
          if (i<999) { bg +=',' }
        }

        player.slider.css('background', '-webkit-linear-gradient(left, ' + bg + ')');
        player.slider.css('background','-o-linear-gradient(left,  ' + bg + ')');
        player.slider.css('background','-moz-linear-gradient(left,  ' + bg + ')');
        player.slider.css('background','linear-gradient(left,  ' + bg + ')');
        player.slider.css('background-color', '#fff');
      }
      //}}}
      //{{{ update
      var update = function() {
        update_slider()
        update_time()
      }
      //}}}
      //{{{ slider_seek
      var slider_seek = function(e) {
        var target = player.slider.val()
        player.audio.prop('currentTime', target)
      }
      //}}}
        //{{{ kbd_parse
        var kbd_parse = function(event) {
          if (!player.keyboard_control) return true;
          event.preventDefault()
          var a = player.audio.get(0)
          switch(event.keyCode) {
            // escape
            case 27: player.kbd_off(); break
            // delete
            case 46: player.kill(); break
            // space
            case 32: player.toggle(); break
            // down
            case 38: player.seek(15); break
            // up
            case 40: player.seek(-15); break
            // page up
            case 33: (event.ctrlKey) || player.seek(300); break
            // page down
            case 34: (event.ctrlKey) || player.seek(-300); break
            // home
            case 36: a.currentTime = 0; break
            // end
            case 35: a.currentTime = a.duration; break
            // [
            case 219: player.prev(); break
            // ]
            case 221: player.next(); break
            // left
            case 37:
              if (event.ctrlKey) { player.seek(-1) } else { player.seek(-5) }; break;
            // right
            case 39:
              if (event.ctrlKey) { player.seek(1) } else { player.seek(5) }; break;
          }
          return false
        }
        //}}}
      //}}}
      //{{{ public methods
      //{{{ kbd_on|off|toggle
      player.kbd_on = function() {
        player.slider.focus()
        player.keyboard_control = true
        player.target.css({'background': '#B7FF6F'})
        $.each(player.controls, function(k,v) {
          var title = player.settings.controls[k].title
          var title_help = player.settings.controls[k].keys
          v.attr('title', title + '\n\n' + title_help)
        })
      }
      player.kbd_off = function() {
        if (document.activeElement !== this) {
          player.keyboard_control = false
          player.target.css({'background': 'none'})
          $.each(player.controls, function(k,v) {
            v.attr('title', player.settings.controls[k].title)
          })
        }
      }
      player.kbd_toggle = function() {
        if (player.keyboard_control) { player.kbd_off() } else { player.kbd_on() }
      }
      //}}}
      //{{{ play|pause|toggle
      player.play = function() { player.audio.trigger('play') }
      player.pause = function() { player.audio.trigger('pause') }
      player.toggle = function() {
        var paused = player.audio.prop('paused')
        if (paused) { player.play() } else {  player.pause() }
      }
      //}}}
      //{{{ next|prev
      player.next = function() {
        // try jump to next cue
        var current = player.audio.prop('currentTime')
        for (i = 0; i < player.source.cues.length; i++) {
          var marker = player.source.cues[i]
          if (marker > current ) {
            player.audio.prop('currentTime', marker)
            player.slider.val(marker)
            return
          }
        }
        // try jump to next track
        var idx = player.settings.sources.indexOf(player.source)
        var next = player.settings.sources[idx + 1]
        if (next) { player.load(next); player.play(); return true }
      }
      player.prev = function() {
        var current = player.audio.prop('currentTime')
        for (i = player.source.cues.length; i >= 0; i--) {
          var marker = player.source.cues[i]
          if (marker < current - 3 ) {
            player.audio.prop('currentTime', marker)
            return
          }
        }
        if (player.audio.prop('currentTime') > 5) {
          // jump to beginning of track if past 5s
          player.audio.prop('currentTime', 0)
        } else {
          // otherwise try to jump to previous track
          var idx = player.settings.sources.indexOf(player.source)
          var prev = player.settings.sources[idx - 1]
          if (prev) { player.load(prev); player.play() }
        }
      }
      //}}}
      //{{{ seek
      player.seek = function(t) {
        var current = player.audio.prop('currentTime')
        player.audio.prop('currentTime', current + t)
        update_slider()
      }
      //}}}
      //{{{ kill
      player.kill = function() {
        $(element).trigger('killed')
        player.pause()
        player.audio.prop("currentTime", 0)
        player.kbd_off()
      }
      //}}}
      //{{{ load
      player.load = function(src) {
        // set track title
        if (player.track) {
          var cur = player.settings.sources.indexOf(src) + 1
          var total = player.settings.sources.length
          var track = cur + ' / ' + total + ' ' + src.ident
          player.track.html(track)
        }
        // reset
        player.pause()
        player.audio.prop("currentTime", 0)
        // add source
        player.audio.attr('src', src.urls[0])
        // load waveform
        player.waveform.css('background-image', 'url("'+src.waveform+'")')
        // save src
        player.source = src
      }

      //}}}
      //{{{ init
      player.init = function() {

        // settings merge
        player.settings = $.extend({}, defaults, options)
        player.keyboard_control = false

        // audio et al
        player.target = $(player._target)
        player.div = $(player.settings.html)
        player.audio = $('<audio/>')
        player.div.append(player.audio)
        player.target.append(player.div)

        // controls
        player.controls = {}
        $.each(player.settings.controls, function(ctl,v) {
          player.controls[ctl] = player.target.find('.'+ctl)
          player.controls[ctl].click(player[ctl])
          player.controls[ctl].attr({ title: v.title })
        })
        // remove next/prev if only one file and no cues
        if (player.settings.sources.length == 1 && player.settings.sources[0].cues.length == 0) {
          player.controls.prev.remove()
          player.controls.next.remove()
        }

        // slider
        player.slider = player.target.find('.slider')
        player.slider.attr({ min: 0, value: 0, step: 1 })
        player.slider.change(slider_seek)

        // waveform
        player.waveform = player.target.find('.waveform')

        // time
        player.time = player.target.find('.time')

        // title
        player.title = player.target.find('.title')
        if (player.settings.url) {
          var title_html = '<a href="'+player.settings.url+'">'+player.settings.title+'</a>'
        } else {
          var title_html = player.settings.title
        }
        player.title.html(title_html)

        // track
        if (player.settings.sources.length > 1) {
          player.track = player.target.find('.track')
        }

        // load audio etc
        player.load(player.settings.sources[0])

        // event bindings
        player.target.find('*').keydown(kbd_parse)
        player.target.find('*').blur(player.kbd_off)
        player.audio.on('loadedmetadata', update);
        player.audio.on('loadeddata', update);
        player.audio.on('progress', update);
        player.audio.on('canplay', update);
        player.audio.on('canplaythrough', update);
        player.audio.on('timeupdate', update);
        player.audio.on('ended', function() { if (!player.next()) player.pause() })
        player.audio.on('play',  function() { player.controls.toggle.html('<i class="fa fa-pause"></i>') })
        player.audio.on('pause',  function() { player.controls.toggle.html('<i class="fa fa-play"></i>') })

      }
      //}}}
      //}}}
      player.init()
  //}}}
  }
  //{{{ jquery function add
  $.fn.audioPlayer = function(options) {
    return this.each(function() {
      if (undefined == $(this).data('audioPlayer')) {
        var player = new $.audioPlayer(this, options);
        $(this).data('audioPlayer', player);
      }
    });
  }
  //}}}
})(jQuery);
