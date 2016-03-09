%if query:
  %include _header title=" / "+query
%else:
  %include _header title=""
%end
%include _navbar

<!-- search results -->
%if query:
  Found {{len(shows)}} results for <b>{{query}}</b> <a class="small" href="/">(show all)</a>
%end
<br>
<br>

<!-- list of shows -->
<div class="row">
<div class="col-md-12">
  <table class="table table-condensed table-responsive">
  % for show in shows:
    <tr>
      <td style="width: 60">
        <img src="{{show.thumb}}" height="48" width="48">
      </td>
      <td>
        <a class="showlink player-target" href="/show/{{show.ident}}">{{show.title}}</a>
      </td>
      <td class="listbuttons text-right">
        <div class="btn-group audioctl">
          <button title="Play" class="btn btn-default playbtn audiobtn" data-chapters="{{show.chapters}}"><i class="fa fa-play"></i></button>
        </div>
        <div class="btn-group">
          <a href="{{show.orig_url}}" title="View on D*I website" class="btn btn-default"><i class="fa fa-globe"></i></a>
          % if show.audio:
            <div class="dropdown input-group-btn">
              <a title="Downloads" class="btn btn-default dropdown-toggle" tabindex="0"><i class="fa fa-download"></i><span class="caret"></span></a>
              <ul class="dropdown-menu pull-right">
                % for dl in show.audio:
                  <li>
                    <a class="audiolink" href="{{dl.url}}" data-waveform="{{dl.waveform}}">
                      <span>{{dl.format}}</span>
                      <small class="text-muted">{{dl.size/(1024*1024)}}MB</small><br/>
                      <small class="text-info">{{dl.name}}</small>
                    </a>
                  </li>
                % end
              </ul>
            </div>
          %end
        </div>
      </td>
    </tr>
  % end
  </table>
</div>
</div>

%include _footer
