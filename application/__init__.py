from flask import Flask
from config import Config
from flask_mongoengine import MongoEngine
import pymongo
from pymongo import MongoClient


app = Flask(__name__)
app.config.from_object(Config)

client = MongoClient("mongodb://db:27017")
db = client.UTA_Enrollment
db = MongoEngine()
db.init_app(app)



from application import routes
