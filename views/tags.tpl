%include _header title=""
%include _navbar query="tag:"

<hr>
<div class="row">
  <div class="col-md-12">
    <div class="tags">
      %for t in tags:
        <span class="tag">
          {{t.count}} <a href="/search/tag:{{t.name}}">{{t.name}}</a>
          <a class="archivetaglink small"
            href="https://archive.org/search.php?query=subject:{{t.name}}" title="Search tag on archive.org">
            <i class="fa fa-university"></i>
          </a>
          <br>
        </span>
      %end
    </div>
  </div>
</div>

%include _footer
