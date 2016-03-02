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

* set up the environment:
  1. apt-get install python-virtualenv
  2. clone this repository
  3. `cd di/`
  4. `virtualenv .venv`
  5. `source ./.venv/bin/activate`
  6. `pip install -r requirements.txt`

* populate with data:
  7. `mkdir db`
  8. `python database.py` creates the db
  9. `python scraper.py` populates the db


### Usage

* Run `python di.py` to start it. Go to http://localhost:8010 and see.
* To update the database repeat install step 9.
* To regenerate the database: `rm -r db/` and repeat install steps 7-9.


### Components

`database.py` describes the database schema. If run directly it creates the
empty database.

`scraper.py` pulls data from D*I RSS feed, parses it, pulls metadata from
archive.org and populates an SQLite database for future use.

`di.py` based on Bottle framework serves up a nice user interface.

`views/` HTML templates files used by Bottle to display files

`static/` a few static files for the web interface

`db/` has the SQLite database and the scraper's cache files
