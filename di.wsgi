import os,sys
# cwd so our relative paths work
os.chdir(os.path.dirname(__file__))
sys.path.append(os.path.dirname(__file__))

# import the app
import di

# start
import bottle
application = bottle.default_app()
