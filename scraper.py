#!/usr/bin/python

from dateutil import parser as date_parser
from xml.etree import cElementTree as ET
import os.path, os
import urllib
import re
import shelve
import internetarchive
import peewee
import requests

import database

IA_CACHE='db/ia.cache'
RSS_CACHE='db/rss.xml'
RSS_URL='http://www.dissidentisland.org/?feed=show'

#{{{ Feed
class Feed(object):
    def __init__(self):
        if not os.path.isfile(RSS_CACHE):
            urllib.urlretrieve(RSS_URL, RSS_CACHE)
        rss = ET.parse(RSS_CACHE)
        self.xml_items = rss.find('channel').findall('item')

    def get_items(self):
        return [FeedItem(i) for i in self.xml_items]
#}}}
#{{{ FeedItem
class FeedItem(object):
    def __init__(self, xml_item):
        self.title = xml_item.find('title').text
        self.url = xml_item.find('guid').text
        self.blurb = xml_item.find('description').text
        self.ident = xml_item.find('enclosure').attrib['url'].split('/')[-2]
        self.date = xml_item.find('pubDate').text
#}}}
##{{{ CachedObject
class CachedObject(object):
    def __init__(self, cache, key):
        # generate a key
        cache = shelve.open(cache)
        k = str(key)
        # save key in the object
        self._cache_key = k
        if cache.has_key(k):
            # get content from cache
            self._cached_value = cache[k]
        else:
            # get content from callback
            self._cached_value = self._cache_cb(k)
            # save retrieved content in cache
            cache[k] = self._cached_value
        cache.close()
##}}}
#{{{ Show
class Show(CachedObject):
    def __init__(self, rss_item):
        self.ident = rss_item.ident
        self.rss_item = rss_item
        super(Show, self).__init__(IA_CACHE, rss_item.ident)
        self.ia = self._cached_value

        self.orig_url = rss_item.url
        self.audio = self.get_audio_urls()
        self.title = self.get_title()
        self.blurb = self.get_blurb()
        self.date = self.get_date()
        self.thumb = self.get_thumb()
        self.image = self.get_image()
        self.number = self.get_number()
        self.ia_url = self.get_ia_url()
        self.ia_dir = self.get_ia_dir()
        self.tags = self.get_tags()
        self.chapters = self.get_chapters()
        self.waveforms = self.get_waveforms()

    def _cache_cb(self, ident):
        return internetarchive.Item(self.ident)

    def get_ia_url(self):
        return "https://archive.org/details/%s" % self.ident

    def get_ia_dir(self):
        return "https://archive.org/download/%s" % self.ident

    def get_audio_urls(self):
        return self.ia.get_files(formats=['Ogg Vorbis', 'VBR MP3'])

    def get_waveforms(self):
        pngs = self.ia.get_files(formats=['PNG'])
        return [f for f in pngs if f.source == 'derivative']

    def get_blurb(self):
        try:
           blurb = self.ia.metadata['description']
        except KeyError:
            blurb = self.rss_item.blurb
        blurb = re.sub('<br *\/*>', '\n', blurb)
        blurb = re.sub('<\/*div *\/*>', '\n', blurb)
        blurb = re.sub('\n\n+', '\n', blurb)
        return blurb.strip()

    def get_tags(self):
        tags = []
        if self.ia.exists and self.ia.identifier != 'None':
            subject = self.ia.metadata['subject']
            if type(subject) == type(u''):
                subject = [subject]
            for s in subject:
                split = re.split('; *|, *|: *', s)
                tags.extend(split)
        return [t.lower() for t in tags]

    def get_title(self):
        if self.ia.exists and self.ia.identifier != 'None':
            return self.ia.metadata['title']
        else:
            return self.rss_item.title

    def get_date(self):
        # try get the date from title
        try:
            t = re.sub(r'[Ee]pisode \d+', '', self.get_title())
            date = date_parser.parse(t, fuzzy=True).date()
            return date
        except:
            pass

        # fallback onto IA metadata
        try:
            pubdate = self.ia.metadata['publicdate']
            date = date_parser.parse(pubdate).date()
            return date
        except:
            pass

        # return
        return None

    def get_thumb(self):
        thumbs = self.ia.get_files(formats=['JPEG Thumb'])
        if thumbs:
            thumb_url = thumbs[0].url
            thumb_path = self.download_thumb(thumb_url)
            return "/%s" % thumb_path
        else:
            return "/static/dot.png"

    def download_thumb(self, url):
        thumb_dir = 'static/thumbs'
        thumb_path = "%s/%s.jpg" % (thumb_dir, self.ident)
        if not os.path.exists(thumb_path):
            r = requests.get(url, stream=True)
            if r.status_code == 200:
                try:
                    os.mkdir(thumb_dir)
                except:
                    pass
                with open(thumb_path, 'wb') as f:
                    for chunk in r:
                        f.write(chunk)
        return thumb_path

    def get_image(self):
        # try get img from archive.org
        originals = self.ia.get_files(source='original')
        for f in originals:
            if f.format == 'JPEG':
                return f.url
        return None

    def get_number(self):
        try:
            regex = re.search(r'[Ee]pisode (\d+)', self.title)
            return regex.group(1)
        except:
            return None

    def get_chapters(self):
        regex = re.compile(r'\d+:\d+:\d+')
        chapters = regex.findall(self.blurb)
        chapters = [re.split(':', t) for t in chapters]
        chapters = ",".join([
                str(
                int(parts[0])*(60*60) +
                int(parts[1])*60 +
                int(parts[2])) for parts in chapters])
        return chapters
#}}}

if __name__ == "__main__":
    print "Getting info from D*I RSS..."
    rss = Feed()

    print "Getting info from archive.org..."
    shows = []
    for rss_item in rss.get_items():
        show = Show(rss_item)
        shows.append(show)

    print "Populating the database..."
    with database.db.atomic():
        for s in shows:
            try:
                show = database.Show.get(title = s.title)
            except database.Show.DoesNotExist:
                # create a Show record
                show = database.Show.create(
                    title = s.title,
                    image = s.image,
                    thumb = s.thumb,
                    blurb = s.blurb,
                    ia_url = s.ia_url,
                    ia_dir = s.ia_dir,
                    ident = s.ident,
                    orig_url = s.orig_url,
                    chapters = s.chapters
                )

                # create Audio records
                for a in s.audio:
                    waveform = None
                    for w in s.waveforms:
                        if os.path.splitext(w.original)[0] == os.path.splitext(a.name)[0]:
                            waveform = w.url
                            break
                    audio, created = database.Audio.get_or_create(
                        show = show,
                        url = a.url,
                        format = a.format,
                        name = a.name,
                        size = a.size,
                        waveform = waveform
                    )

                # create Tag records
                for t in s.tags:
                    tag, created = database.Tag.get_or_create(name = t)
                    try:
                        show.tags.add(tag)
                    except:
                        # needed when duplicate tags are assigned to a show
                        pass
