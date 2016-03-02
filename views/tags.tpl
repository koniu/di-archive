%include header.tpl title=""

<div class="row">
  <div class="col-md-10">
    <h3><a href="..">Dissident Island Radio Archive</a> / Tags</h3>
  </div>
  <div class="col-md-2 text-right">
  <a href="http://dissidentisland.org" target="_blank">
    <img src="/static/boombox.png" title="Dissident Island website"/>
  </a>
  </div>
</div>

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

%include footer
