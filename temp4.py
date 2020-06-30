#%%
from mongoengine import connect

DB_URI = "mongodb+srv://<username>:<password>@<database-name>.mongodb.net/test?retryWrites=true&w=majority"

connect(host=DB_URI)