    <div class="item">
      <div class="thumb"><img src="{{show.thumb}}" height="48" width="48"></div>
      <div class="main"><a class="showlink" href="/show/{{show.ident}}">{{show.title}}</a></div>
      <div class="ctls">
        <button title="Play" class="playbtn audiobtn"><i class="fa fa-play"></i></button>
        <div class="dropdown">
          <a title="Downloads" class="btn dropdown-toggle" tabindex="0"><i class="fa fa-download"></i> <span class="caret"></span></a>
          <ul class="dropdown-menu dropdown-menu-right">
            % for dl in show.audio:
              <li>
                <a class="audiolink" href="{{dl.url}}"
                    data-waveform="{{dl.waveform}}"
                    data-cues="{{dl.cues}}">
                  <span>{{dl.format}}</span>
                  <small class="text-muted">{{dl.size/(1024*1024)}}MB</small><br/>
                  <small class="text-info">{{dl.name}}</small>
                </a>
              </li>
            % end
          </ul>
        </div>
      </div>
    </div>
