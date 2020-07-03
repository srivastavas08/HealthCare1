import os


class Config(object):
    SECRET_KEY = os.environ.get(
        "SECRET_KEY") or b'jdncknzkcncomcozjvoksijvchcckcmm'
    MONGODB_SETTINGS = {
    'db': 'Health_Care',
    'host': 'mongodb+srv://cluster-sigma.f042j.gcp.mongodb.net/Health_Care',
    'username':'mongoengine',
    'password':'SHIvam7426'
    }

