%if query:
  %include header.tpl title=" / "+query
%else:
  %include header.tpl title=""
%end

<!-- headline -->
<div class="row">
  <div class="col-md-7">
    <a href="http://dissidentisland.org" target="_blank">
      <img class="pull-left" style="padding-right: 1em" src="/static/boombox.png" title="Dissident Island website"/>
    </a>
    <h3>Dissident Island Radio Archive</h3>
  </div>
  <div class="col-md-5 text-right no-float">
    <br>
    <form method="get" action="/search" class="form-inline">
      <div class="input-group">
        <input name="s" type="text" value="{{query}}" class="form-control input-sm" placeholder="Search..." />
        <span class="input-group-btn">
          <button class="btn btn-default btn-sm" title="Search" type="Submit">&nbsp;<i class="fa fa-search"></i>&nbsp;</button>
        </span>
      </div>
        <a href="/tags" class="btn btn-default btn-sm" title="Tag browser">
            &nbsp;<i class="fa fa-tags"></i>&nbsp;
        </a>
    </form>
  </div>
</div>
<br>

<!-- search results -->
% if query:
  Found {{len(shows)}} results for <b>{{query}}</b> <a class="small"
  href="/">(show all)</a>
% end
<br>
<br>

<!-- list of shows -->
<div class="row">
<div class="col-md-12">
  <table class="table table-condensed">
  % for show in shows:
    <tr>
      <td><img src="{{show.thumb}}" height="48" width="48"></td>
      <td><a class="showlink player-target" href="/show/{{show.ident}}">{{show.title}}</a></td>
      <td class="listbuttons text-right">
        <a class="btn btn-default btn-sm playbtn">&nbsp;<i class="fa fa-play"></i>&nbsp;</a>
        <a href="{{show.orig_url}}" class="btn btn-default btn-sm">WWW</a>
        % if show.audio:
          <div class="dropdown">
            <a class="btn btn-default btn-sm dropdown-toggle" tabindex="0">
              Download
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
          </div>
        %end
      </td>
    </tr>
  % end
  </table>
</div>
</div>


%include footer
