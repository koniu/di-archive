### Description

Dirty quick project to make Dissident Island Radio archive searchable.


### Dependencies

You will need Python 2.x with the following libs:

* peewee
* bottle
* internetarchive
* dateutil

See `requirements.txt` for full details.


### Installation

```

# set up the environment

apt-get install python-virtualenv
git clone https://github.com/koniu/di-archive.git
cd di-archive/
virtualenv .virtualenv
source ./.virtualenv/bin/activate
pip install -r requirements.txt

# populate with data

mkdir db
python database.py      # creates the db
python scraper.py       # populates the db

```

### Usage

* Run `python di.py` to start it. Go to http://localhost:8010 and see.
* To update the database repeat install step 9.
* To regenerate the database: `rm -r db/` and repeat last 3 install steps.


### Components

`database.py` describes the database schema. If run directly it creates the
empty database.

`scraper.py` pulls data from D*I RSS feed, parses it, pulls metadata from
archive.org and populates an SQLite database for future use.

`di.py` based on Bottle framework serves up a nice user interface.

`views/` HTML templates files used by Bottle to display files

`static/` a few static files for the web interface

`db/` has the SQLite database and the scraper's cache files
