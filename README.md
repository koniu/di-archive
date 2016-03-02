### Description

Python script for scraping shows off of dissidentisland.org and
displaying them in a readable, searchable format.

### Dependencies

Chief dependencies are Python 2.x with the following libs:

* peewee
* bottle
* internetarchive
* dateutil

See requirements.txt for details.

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
