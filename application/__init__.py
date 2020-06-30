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

# client = MongoClient("mongodb://db:27017")
# db = client.Health_Care

# db = MongoEngine()
# # db.init_app(app)

db = MongoEngine()
db.init_app(app)
# # DB_URI = "mongodb+srv://mongoengine:SHIvam7426@cluster-sigma.f042j.gcp.mongodb.net/Health_Care?retryWrites=true&w=majority"

# # connect('Health_Care', host='mongodb+srv://cluster-sigma.f042j.gcp.mongodb.net/Health_Care',username='mongoengine',password='SHIvam7426')


# # connect(host=DB_URI)

# # MONGODB_SETTINGS = {'db': 'Health_Care'}


# client = MongoClient(DB_URI)
# db = client.Health_Care
# db = MongoEngine()
# db.init_app(app)


from application import routes

# app = Flask(__name__)
# app.config.from_object(Config)
# DB_URI = "mongodb+srv://mongoengine:SHIvam7426@cluster-sigma.f042j.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority"
# client = MongoClient(DB_URI,connect=True)


# # db = client.Health_Care
# db = MongoEngine()
# # print(type(db))
# db.init_app(app)



# from application import routes
