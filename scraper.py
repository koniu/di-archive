#!/usr/bin/python

from BeautifulSoup import BeautifulSoup
from HTMLParser import HTMLParser
from dateutil import parser as date_parser
import re
import requests
import shelve
import internetarchive
import database
import peewee

PAGE_CACHE='db/cache_pages.shelve'
SHOW_CACHE='db/cache_shows.shelve'
ARCHIVE_CACHE='db/cache_archive.shelve'

PAGE_RANGE = [1,2,3,10,20]
PAGE_RANGE = range(1,40)

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
##{{{ Scraper
class Scraper(object):
    def __init__(self, pages=range(1,50)):
        self.scraped_shows = []
        for i in pages:
            page = PageScraper(i)
            show_scrapes = page.scrape_shows()
            self.scraped_shows.extend(show_scrapes)

    def get_shows(self):
        return [(s.ident, s.url, s.image, s.blurb, s.title) for s in self.scraped_shows]
##}}}
##{{{ PageScraper
class PageScraper(CachedObject):
    def _cache_cb(self, page):
        base_url = "http://www.dissidentisland.org/archive/page/%s"
        return requests.get(base_url % page).text

    def __init__(self, page):
        # get page content from cache or callback method
        super(PageScraper, self).__init__(PAGE_CACHE, page)
        self.soup = BeautifulSoup(self._cached_value)

    def scrape_shows(self):
        shows = []
        soup_shows = self.soup.findAll('h3')
        for s in soup_shows[5:]:
            show_url = s.find('a')['href']
            show = ShowScraper(show_url)
            shows.append(show)
        return shows
##}}}
##{{{ ShowScraper
class ShowScraper(CachedObject):
    def _cache_cb(self, url):
        return requests.get(url).text

    def __init__(self, url):
        # get page text from cache or callback method
        super(ShowScraper, self).__init__(SHOW_CACHE, url)
        self.__page_text = self._cached_value
        self.__soup = BeautifulSoup(self.__page_text)
        self.url = url
        self.image = self.get_image()
        self.blurb = self.get_blurb()
        self.title = self.get_title()
        self.ident = self.__get_ident()

    def get_image(self):
        soup = self.__soup
        try:
            return soup.find('div', {'id': 'main-column' }).find('img')['src']
        except TypeError:
            return None

    def get_title(self):
        soup = self.__soup
        title = soup.find('title').text
        title = HTMLParser().unescape(title)
        return title

    def get_blurb(self):
        soup = self.__soup.find('div', {'id': 'main-column'})
        text = "".join(soup.findAll('p', text=True)).strip()
        text = HTMLParser().unescape(text)
        text = text.replace('LISTEN\nDOWNLOAD MP3\nDOWNLOAD OGG', '')
        text = "<br>".join(text.split('\n'))
        return text

    def __get_ident(self):
        try:
            soup = BeautifulSoup(self.__page_text)
            download_links = soup.findAll('li',
                    {'class': re.compile('download-')})
            download_url = download_links[0].find('a')['href']
            ident = download_url.split('/')[-2]
            return ident
        except:
            pass
##}}}

#{{{ Show
class Show(CachedObject):
    def __init__(self, ident, url, image, blurb, title):
        super(Show, self).__init__(ARCHIVE_CACHE, ident)
        self.orig_url = url
        self.orig_image = image
        self.orig_blurb = blurb
        self.orig_title = title
        self.ident = ident
        self.ia = self._cached_value

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

    def _cache_cb(self, ident):
        return internetarchive.Item(ident)

    # def get_urlbase(self):
    #     return "%s//%s/%s/" % (self.ia.protocol, self.ia.server, self.ia.dir)

    def get_ia_url(self):
        return "https://archive.org/details/%s" % self.ident

    def get_ia_dir(self):
        return "https://archive.org/download/%s" % self.ident

    def get_audio_urls(self):
        files = self.ia.get_files(formats=['Ogg Vorbis', 'VBR MP3'])
        return [(f.format, f.url, f.size, f.name) for f in files]

    def get_blurb(self):
        try:
           blurb = self.ia.metadata['description']
        except KeyError:
            blurb = self.orig_blurb
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
            return self.orig_title

    def get_date(self):
        # try get the date from title
        try:
            t = re.sub(r'[Ee]pisode \d+', '', self.get_title())
            date = date_parser.parse(t, fuzzy=True).date()
        except:
            date = None

        # fallback onto IA metadata
        if not date:
            pubdate = self.ia.metadata['publicdate']
            date = date_parser.parse(pubdate).date()

        # return
        return date

    def get_thumb(self):
        thumbs = self.ia.get_files(formats=['JPEG Thumb'])
        if thumbs:
            return thumbs[0].url
        elif self.orig_image:
            return self.orig_image
        else:
            return "/static/dot.png"

    def get_image(self):
        # try get img from archive.org
        originals = self.ia.get_files(source='original')
        for f in originals:
            if f.format == 'JPEG':
                return f.url
        # fall back on d*i web
        return self.orig_image

    def get_number(self):
        try:
            regex = re.search(r'[Ee]pisode (\d+)', self.title)
            return regex.group(1)
        except:
            return ""

#}}}

if __name__ == "__main__":


    print "Scraping %d pages..." % len(PAGE_RANGE)
    scraper = Scraper(pages=PAGE_RANGE)
    scraped_shows = scraper.get_shows()

    print "Retrieving data from archive.org and populating the db..."
    database.db.connect()

    for ident, url, image, blurb, title in scraped_shows:
        try:
            show = database.Show.get(orig_url = url)
        except database.Show.DoesNotExist:
            # generate Show object (retrieves IA data and resolves)
            s = Show(ident, url, image, blurb, title)

            # populate db
            show, created = database.Show.get_or_create(
                title = s.title,
                image = s.image,
                thumb = s.thumb,
                blurb = s.blurb,
                ia_url = s.ia_url,
                ia_dir = s.ia_dir,
                ident = s.ident,
                orig_url = s.orig_url
            )
            print '-----', show.title
            show.save()
            print show.id
            for a in s.audio:
                # a == (f.format, f.url, f.size, f.name)
                # FIXME: fuck these positional[2] args[1]
                audio, created = database.Audio.get_or_create(
                    show = show,
                    url = a[1],
                    format = a[0],
                    name = a[3],
                    size = a[2]
                )
                print audio.name, created

            for t in s.tags:
                tag, created = database.Tag.get_or_create(name = t)
                try:
                    show.tags.add(tag)
                except:
                    # needed when duplicate tags are assigned to a show
                    pass
