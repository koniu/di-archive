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
        background: false,
        sources: [],
        controls: [ 'kbd', 'seekbar', 'cue_prev', 'cue_next', 'toggle', 'kill' ],
        btn_class: 'btn btn-default',
        seek_class: 'btn btn-default disabled',
        kbd_help: {
          toggle: '\n\nkey: Space',
          cue_next: '\n\nkey: ]',
          cue_prev: '\n\nkey: [',
          kill: '\n\nkey: Delete',
          seekbar: '\n\n1s\t\tCtrl+Left/Right\n5s\t\tLeft/Right\n15s\t\tUp/Down\n5m\t\tPageUp/Down\n',
          kbd: '\n\nHover over controls to see keyboard shortcuts'
        },
        bar_colors: {
          buffered: '#ebebeb',
          played:   '#c8c8c8',
          cue:      '#d8d8d8',
          normal:   '#ffffff'
        }
      }
      var player = this
      //}}}
      //{{{ private methods
      //{{{ button
      var button = function(action, icon, title) {
        var btn = $('<button />')
        btn.attr({
          title: title,
          class: 'btn-player-control'
        })
        btn.addClass(player.settings.btn_class)
        btn.data({title: btn.attr('title')})
        btn.html('<i class="fa fa-'+icon+'"></i>')
        btn.click(action)
        return btn
      }
      //}}}
      //{{{ seekbar
      var seekbar = function() {
        // div wrapper
        player.seekbar = $('<div />')
        player.seekbar.attr({
          title: 'Seek',
          class: 'seekbar'
        })
        player.seekbar.addClass(player.settings.seek_class)
        player.seekbar.data({title: player.seekbar.attr('title')})
        // background
        if (player.settings.background) {
          player.seekbar_bg = $('<div class="seekbar_bg" />')
          player.seekbar_bg.css('background', 'rgb(224,224,224) url("'+player.settings.background+'")')
        }
        // slider
        player.slider = $('<input />')
        player.slider.attr({
          type: 'range',
          min: 0,
          value: 0,
          step: 1
        })
        player.slider.on('input', slider_seek)
        // time
        player.time = $('<div class="time" /></div>')
        // assemble div and return
        player.seekbar.append(player.seekbar_bg, player.slider, player.time)


        return player.seekbar
      }
      //}}}
      //{{{ time_update
      var time_update = function() {
        player.time.html(
          '<small>' +
          timesplit(player.audio.prop('currentTime')) +
          ' / ' +
          timesplit(player.audio.prop('duration')) +
          '</small>'
        )
      }
      //}}}
      //{{{ seek_update
      var seek_update = function() {
        var current = player.audio.prop('currentTime')
        var duration = player.audio.prop('duration')
        player.slider.attr({ max: duration })
        player.slider.val(current)
        slider_bg_update()
      }
      //}}}
      //{{{ slider_bg_update
      var slider_bg_update = function() {
        var arr = []
        var a = player.audio.get(0)
        // fill with '1' for what's buffered
        for (i = 0; i < a.buffered.length; i++) {
          var bufstart = (a.buffered.start(i)/a.duration)*100
          var bufend = (a.buffered.end(i)/a.duration)*100
          for (j = bufstart; j < bufend; j++) { arr[j] = 1 }
        }
        // fill with '2' for what's played
        for (i = 0; i < (a.currentTime/a.duration)*100; i++) { arr[i] = 2 }
        // fill with '4' for cue markers
        var cues = player.settings.cues
        for (i = 0; i < cues.length; i++) {
          if (cues[i] > 0) {
            var marker = parseInt((cues[i]/a.duration)*100)
            arr[marker] = 4
          }
        }
        // stringify arr
        var bg = ''
        var cols = player.settings.bar_colors
        for (i = 0; i < 100; i++) {
          switch(arr[i]) {
            case 1: bg += cols.buffered; break;
            case 2: bg += cols.played; break;
            case 4: bg += cols.cue; break;
            default: bg += cols.normal;
          }
          if (i<99) { bg +=',' }
        }

        player.slider.css('background', '-webkit-linear-gradient(left, ' + bg + ')');
        player.slider.css('background','-o-linear-gradient(left,  ' + bg + ')');
        player.slider.css('background','-moz-linear-gradient(left,  ' + bg + ')');
        player.slider.css('background','-ms-linear-gradient(left,  ' + bg + ')');
        player.slider.css('background','linear-gradient(left,  ' + bg + ')');
        player.slider.css('background-color', '#fff');
      }
      //}}}
      //{{{ update
      var update = function() {
        seek_update()
        time_update()
      }
      //}}}
      //{{{ slider_seek
      var slider_seek = function() {
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
            case 27: player.kbd_off(); break            // escape
            case 46: player.kill(); break               // delete
            case 32: player.toggle(); break             // space
            case 38: player.seek(15); break             // down
            case 40: player.seek(-15); break            // up
            case 33: player.seek(300); break            // page up
            case 34: player.seek(-300); break           // page down
            case 36: a.currentTime = 0; break           // home
            case 35: a.currentTime = a.duration; break  // end
            case 219: player.cue_prev(); break          // [
            case 221: player.cue_next(); break          // ]
            case 37:                            // left
              if (event.ctrlKey) { player.seek(-1) } else { player.seek(-5) }; break;
            case 39:                            // right
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
        player.controls_div.children().addClass('btn-success')
        $.each(player.controls, function(k,v) {
          var title = v.data('title')
          var title_help = player.settings.kbd_help[k]
          v.attr('title', title + title_help)
        })
      }
      player.kbd_off = function() {
        if (document.activeElement !== this) {
          player.keyboard_control = false
          player.controls_div.children().removeClass('btn-success')
          $.each(player.controls, function(k,v) {
            v.attr('title', v.data('title'))
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
      //{{{ cue_next|prev
      player.cue_next = function() {
        var current = player.audio.prop('currentTime')
        var cues = player.settings.cues
        for (i = 0; i < cues.length; i++) {
          var marker = cues[i]
          if (marker > current ) {
            player.audio.prop('currentTime', marker)
            player.slider.val(marker)
            break
          }
        }
      }
      player.cue_prev = function() {
        var current = player.audio.prop('currentTime')
        var cues = player.settings.cues
        for (i = cues.length; i >= 0; i--) {
          var marker = cues[i]
          if (marker < current - 2 ) {
            player.audio.prop('currentTime', marker)
            break
          }
        }
      }
      //}}}
      //{{{ seek
      player.seek = function(t) {
        var current = player.audio.prop('currentTime')
        player.audio.prop('currentTime', current + t)
        seek_update()
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
      //{{{ init
      player.init = function() {

        // settings merge
        player.settings = $.extend({}, defaults, options)
        player.keyboard_control = false

        // audio
        player.audio = $('<audio autoplay />')
        $.each(player.settings.sources, function(k,v) {
          player.audio.append('<source src="'+v+'">')
        })

        // controls
        player.controls = {}
        player.controls.toggle = button(player.toggle, 'play', 'Play/Pause')
        if (player.settings.cues.length > 0) {
          player.controls.cue_next = button(player.cue_next, 'step-forward', 'Next cue')
          player.controls.cue_prev = button(player.cue_prev, 'step-backward', 'Previous cue')
        }
        player.controls.kill = button(player.kill, 'stop', 'Stop')
        player.controls.kbd = button(player.kbd_toggle, 'keyboard-o', 'Toggle keyboard controls')
        player.controls.seekbar = seekbar()

        // controls div
        player.controls_div = $('<div class="player-controls btn-group" />')
        $.each(player.settings.controls, function(k,v) {
          player.controls_div.append(player.controls[v])
        })
        player.controls_div.children().keydown(kbd_parse)
        player.controls_div.find('*').blur(player.kbd_off)


        // assemble and insert main div
        player.div = $('<div class="player" />')
        player.div.append(player.audio)
        player.div.append(player.controls_div)
        $(element).append(player.div)
      }
      //}}}
      //}}}
      //{{{ initialization + event bindings
      player.init()
      player.audio.on('loadedmetadata', update);
      player.audio.on('loadeddata', update);
      player.audio.on('progress', update);
      player.audio.on('canplay', update);
      player.audio.on('canplaythrough', update);
      player.audio.on('timeupdate', update);
      player.audio.on('ended', player.pause);
      player.audio.on('play',  function() { player.controls.toggle.html('<i class="fa fa-pause"></i>') })
      player.audio.on('pause',  function() { player.controls.toggle.html('<i class="fa fa-play"></i>') })

  //}}}
  }
  //}}}
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
