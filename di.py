#!/usr/bin/env python
from bottle import *
from database import *

@route('/tags')
@view('tags')
def tag_view():
    db.connect()
    tags = Tag.select()
    db.close()
    return  {'tags': tags}

@route('/show/<ident>')
@view('show')
def show_view(ident):
    db.connect()
    try:
       show = Show.get(ident = ident)
    except:
        pass #FIXME: we want to handle this as 404
    db.close()
    return  {'show': show}

@route('/showinfo/<ident>')
@view('popup')
def popup(ident): #FIXME: reuse the above
    db.connect()
    try:
       show = Show.get(ident = ident)
    except:
        pass #FIXME: we want to handle this as 404
    db.close()
    return  {'show': show}


@route('/')
@route('/search/')
@view('index')
def index():
    db.connect()
    shows = Show.select()
    db.close()
    return  {'shows': shows, 'query': ''}

@route('/search/<query>')
@view('index')
def search(query):
    db.connect()
    shows = Show.select() #FIXME: actually implement a lookup
    terms = query.split(' ')
    results = []
    for show in shows:
        hit = True
        for term in terms:
            scope = " ".join([t.name for t in show.tags])
            if term.startswith('tag:'):
                term = term.replace('tag:', '')
            else:
                scope += show.blurb

            if term.lower() not in scope.lower():
                hit = False
                break
        if hit:
            results.append(show)
    db.close()
    return {'shows': results, 'query': query}

@route('/search')
def search_redir():
    query = request.query.s
    redirect("/search/%s" % query)

@route('/static/:path#.+#')
def server_static(path):
    return static_file(path, root='./static')

run(host='', port=8010, debug=True, reloader=True)
