from peewee import *
from playhouse.fields import ManyToManyField

db_file = 'db/di.db'
db = SqliteDatabase(db_file)


class Tag(Model):
    name = CharField()
    class Meta:
        database = db

class Show(Model):
    title = CharField()
    image = CharField(null = True)
    thumb = CharField()
    blurb = TextField()
    ia_url = CharField()
    ia_dir = CharField()
    ident = CharField(null = True) #FIXME: we don't want null really
    orig_url = CharField()
    tags = ManyToManyField(Tag, related_name='shows')
    class Meta:
        database = db

ShowTag = Show.tags.get_through_model()

class Audio(Model):
    url = CharField()
    format = CharField()
    size = IntegerField()
    name = CharField()
    show = ForeignKeyField(Show, related_name='audio')
    class Meta:
        database = db

# class ShowTag(Model):
#     tag = ForeignKeyField(Tag)
#     show = ForeignKeyField(Show)

#     class Meta:
#         database = db



def create_tables():
    db.connect()
    db.create_tables([
        Show,
        Tag,
        ShowTag,
        Audio,
    ])
    db.close()
