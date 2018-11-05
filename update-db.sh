#!/bin/sh
cd ~/di-archive
rm db/di.db db/rss.xml
. .virtualenv/bin/activate
python database.py
python scraper.py
