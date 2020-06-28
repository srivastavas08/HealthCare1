import os


class Config(object):
    SECRET_KEY = os.environ.get(
        "SECRET_KEY") or b'jdncknzkcncomcozjvoksijvchcckcmm'

    MONGODB_SETTINGS = {'db': 'Health_Care'}
