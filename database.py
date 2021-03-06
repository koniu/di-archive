from peewee import *
from playhouse.fields import ManyToManyField

db_file = 'db/di.db'
db = SqliteDatabase(db_file)


class BaseModel(Model):
    class Meta:
        database = db


class Tag(BaseModel):
    name = CharField()

class Show(BaseModel):
    title = CharField()
    image = CharField(null = True)
    thumb = CharField()
    blurb = TextField()
    ia_url = CharField()
    ia_dir = CharField()
    ident = CharField(null = True) #FIXME: we don't want null really
    orig_url = CharField()
    tags = ManyToManyField(Tag, related_name='shows')
    chapters = CharField(null = True)

ShowTag = Show.tags.get_through_model()

class Audio(BaseModel):
    url = CharField()
    format = CharField()
    size = IntegerField()
    name = CharField()
    waveform = CharField(null=True)
    show = ForeignKeyField(Show, related_name='audio')

    class Meta:
        order_by = ['format', 'name']

def create_tables():
    db.connect()
    db.create_tables([
        Show,
        Tag,
        ShowTag,
        Audio,
    ])
    db.close()

if __name__ == "__main__":
    create_tables()
