%include header.tpl title=" / " + show.title

  <div class="row">
    <div class="col-md-10">
      <h3><a href="..">Dissident Island Radio Archive</a> / {{show.title}}</h3>
    </div>
    <div class="col-md-2 text-right">
    <a href="http://dissidentisland.org" target="_blank">
      <img src="/static/boombox.png" title="Dissident Island website"/>
    </a>
    </div>
  </div>

  <div class="row">

    <div class="col-md-4">
      <img src="{{show.image}}" class="img-responsive">
      <br>
    </div>
    <div class="col-md-6">
      <dl>
        <dd>
        <span class="prewrap small">{{show.blurb}}</span>
        </dd><br>
        <dt>Tags</dt>
        <dd>
            %for t in show.tags:
              <a class="small text-info" href="../search/tag:{{t.name}}">{{t.name}}</a>
            %end
        </dd>
      </dl>
    </div>

    <div class="col-md-2">
    <ul class="nav nav-pills nav-stacked text-center">
      <br><br>
      <b>Links</b>
      <br><br>
        <li><a href="{{show.orig_url}}" class="btn btn-default btn-sm">View on D*I website</a></li>
        <li><a href="{{show.ia_url}}" class="btn btn-default btn-sm">View on archive.org</a></li>
        <li><a href="{{show.ia_dir}}" class="btn btn-default btn-sm">Files on archive.org</a></li>
      <br><br>
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
                <a class="audiolink" href="{{dl.url}}">
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
    </ul>
    </div>
  </div>


%include footer
