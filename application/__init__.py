from flask import Flask
from config import Config
from flask_mongoengine import MongoEngine
import pymongo
from pymongo import MongoClient
from mongoengine import connect, disconnect_all, disconnect
from urllib.parse import quote_plus

disconnect()
disconnect_all()
disconnect(alias='default')
disconnect_all()
app = Flask(__name__)
app.config.from_object(Config)

db = MongoEngine()
db.init_app(app)


from application import routes

