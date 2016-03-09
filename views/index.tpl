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
    % include _index-item show=show
  % end
  </table>
</div>
</div>

%include _footer
