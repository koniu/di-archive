$(document).ready(function() {

  function kill_audio() {
    $('audio').trigger("stop");
    //r btn = $('audio').parent().parent().parent().find('.playbtn')
    $('#player').remove()
    $('.playbtn').html('&nbsp;<i class="fa fa-play"></i>&nbsp;')
    $('.playbtn').closest('tr').removeClass('bg-success')
    $('.showlink').show()
  }


  function toggle_play(e, target) {
    var isthisstopped = e.find('.fa-play').length
    kill_audio()
    if (isthisstopped) {
      // row.find('.showlink').hide()
      var playerdiv = $('<div id="player"></div>').appendTo(target);
      playerdiv.html('<audio controls autoplay></audio>');
      e.closest('tr').find('.audiolink').each(function(l,e) {
        $('audio').append('<source src="'+e.href+'">')
      })
      $(playerdiv).show()
      $('audio').trigger("play");
      e.html('&nbsp;<i class="fa fa-stop"></i>&nbsp;')
    }
  }


  $('.playbtn').show()
  $('.playbtn').click(function(e){
    var row = $(this).closest('tr')
    var target = row.find('.showlink').parent()
    toggle_play($(this),target)
  })
  $('audio').on('error abort ended', kill_audio)

  $('.showlink').hover(function() {
    var thumb = $(this).closest('tr').find('img')
    var img = $('#background img')
    img.attr('src', thumb.attr('src'))
    img.stop(true).fadeTo(2000, 0.3)

  }, function(){
    var img = $('#background img')
    img.stop(true).fadeOut(1000)
  }
  )

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
       // $('#background img').attr('src', $(r)[4].src)
      })
    }
  })

})
