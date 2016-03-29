#!/usr/bin/env python
from bottle import *
from database import *
import shlex
import operator

CACHE_TIMEOUT = 86400 # 1d

def linkify(text):
    subs = [
        # canonical url
        ( re.compile(r"(^|[\n ])(([\w]+?://[\w\#$%&~.\-;:=,?@\[\]+]*)(/[\w\#$%&~/.\-;:=,?@\[\]+]*)?)", re.IGNORECASE | re.DOTALL),
            r'\1<a href="\2" target="_blank">\2</a>' ),
        # url without protocol
        ( re.compile(r"(^|[\n ])(((www|ftp)\.[\w\#$%&~.\-;:=,?@\[\]+]*)(/[\w\#$%&~/.\-;:=,?@\[\]+]*)?)", re.IGNORECASE | re.DOTALL),
            r'\1<a href="http://\2" target="_blank">\2</a>' ),
        # twitter hashtag
        ( re.compile(r'(\A|\s)@(\w+)'),
            r'\1@<a href="http://www.twitter.com/\2" target="_blank">\2</a>' ),
        # twitter username
        ( re.compile(r'(\A|\s)#(\w+)'),
            r'\1#<a href="http://search.twitter.com/search?q=%23\2" target="_blank">\2</a>' ),
    ]
    for p, s in subs:
        text = p.sub(s, text)
    return text

@route('/tags')
@view('tags')
def tag_view():
    response.set_header("Cache-Control", "public, max-age=%d" % CACHE_TIMEOUT)
    db.connect()
    # select all tags, count how many shows they have and sort by that
    count = fn.COUNT(ShowTag.id)
    tags = (
        Tag.select(Tag, count.alias('count'))
        .join(ShowTag)
        .join(Show)
        .group_by(Tag)
        .order_by(count.desc(), Tag.name)
    )
    db.close()
    return  {'tags': tags}

def show(ident):
    response.set_header("Cache-Control", "public, max-age=%d" % CACHE_TIMEOUT)
    db.connect()
    try:
       show = Show.get(ident = ident)
    except:
        abort(404)
    db.close()
    show.blurb = linkify(show.blurb)
    return  {'show': show}

@route('/show/<ident>')
@view('show')
def show_view(ident):
    return show(ident)

@route('/showinfo/<ident>')
@view('popup')
def popup(ident):
    return show(ident)

@route('/')
@route('/search/')
@view('index')
def index():
    response.set_header("Cache-Control", "public, max-age=%d" % CACHE_TIMEOUT)
    db.connect()
    shows = Show.select()
    db.close()
    return  {'shows': shows, 'query': ''}

@route('/search/<query>')
@view('index')
def search(query):
    db.connect()
    # split the user input
    terms = shlex.split(query)

    # build expressions
    expressions = []
    for term in terms:
        if term.startswith('tag:'):
            term = term.replace('tag:', '')
            expr = Tag.name.contains(term)
        else:
            expr = TextField.concat(Show.blurb, Show.title).contains(term)
        expressions.append(expr)

    # join the expressions
    sql_query = reduce(operator.and_, expressions)

    # execute query
    results = (Show.select()
        .join(ShowTag)
        .join(Tag)
        .where(sql_query)
        .group_by(Show)
    )

    # close db connection and return
    db.close()
    return {'shows': results, 'query': query}

@route('/search')
def search_redir():
    query = request.query.s
    redirect("/search/%s" % query)

@route('/favicon.ico')
def favicon():
    return static_file('favicon.ico', root='./static')

@route('/static/:path#.+#')
def server_static(path):
    return static_file(path, root='./static')

@error(404)
@route('/404')
@view('error404')
def error404(error):
    return { 'error': error, 'request': request }

run(host='', port=8010, debug=True, reloader=True)
