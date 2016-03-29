% include('_header', js='show.js', title=' / ' + show.title)
% include('_navbar', query='')

  <div class="row">
    <div class="col-md-12 text-center">
      <h3>{{show.title}}</h3>
      <br>
    </div>
  </div>

  <div class="row">
    <div class="col-md-4">
      <img src="{{show.image}}" style="width: 100% !important"><br><br>
    </div>
    <div class="col-md-6">
      <dl>
        <dd>
        <div id="player"></div><br>
        <span class="prewrap small">{{!show.blurb}}</span>
        </dd>
        <dd><br>
            %for t in show.tags:
              <a class="small text-info" href="../search/tag:{{t.name}}">{{t.name}}</a>
            %end
        </dd>
      </dl>
    </div>

    <div class="col-md-2">
    <ul class="nav nav-pills nav-stacked text-center">
      <b>Download</b>
      <br><br>
      <li role="presentation">
        % if show.audio:
        <li class="dropdown" role="presentation">
          <a class="btn btn-default btn-sm dropdown-toggle" tabindex="0">
            Audio
            <span class="caret"></span>
          </a>
          <ul class="dropdown-menu pull-right">
            % for dl in show.audio:
              <li>
                <a class="audiolink" href="{{dl.url}}"
                    data-waveform="{{dl.waveform}}"
                    data-cues="{{show.chapters}}">
                  <span>{{dl.format}}</span>
                  <small class="text-muted">{{dl.size/(1024*1024)}}MB</small><br/>
                  <small class="text-info">{{dl.name}}</small>
                </a>
              </li>
            % end
          </ul>
        </li>
        %end
      </li>
      <br>
      <b>Links</b>
      <br><br>
        <li><a href="{{show.orig_url}}" class="btn btn-default btn-sm">View on D*I website</a></li>
        <li><a href="{{show.ia_url}}" class="btn btn-default btn-sm">View on archive.org</a></li>
        <li><a href="{{show.ia_dir}}" class="btn btn-default btn-sm">Files on archive.org</a></li>
    </ul>
    </div>
  </div>


% include('_footer')
