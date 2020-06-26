import flask
from application import db
from werkzeug.security import generate_password_hash, check_password_hash
import datetime


class User(db.Document):
    user_id     = db.IntField( unique=True )
    first_name  = db.StringField( max_length=50 )
    last_name   = db.StringField( max_length=50 )
    email       = db.StringField( max_length=30, unique=True )
    password    = db.StringField( )

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def get_password(self, password):
        return check_password_hash(self.password, password)  

class NewPatient(db.Document):
    patient_id     = db.IntField( unique=True )
    name           = db.StringField( max_length=50 )
    age            = db.IntField( max_length=50 )
    aadhar            = db.IntField( max_length=50, unique=True )
    address        = db.StringField( max_length=30 )
    state          =  db.StringField( max_length=20 )
    city           = db.StringField( max_length=15 )
    msg            = db.StringField(max_length = 50)
    dam             = db.DateTimeField()   #dam= date of admission
    status         = db.StringField()
    bedtype         = db.StringField()
    

class BankTransfers(db.Document):
    to_cust_id     = db.IntField()
    from_cust_id   = db.IntField()
    transaction_date = db.DateTimeField()
    transaction_amt = db.FloatField()
    transaction_type = db.StringField()
    transaction_id = db.IntField(max_length=15)


class HelperCustomer(db.Document):
    def get_customer_for_update(self, pid):
        update_customer = NewPatient.objects(patient_id=pid).get()
        return update_customer
    def get_customer_for_delete(self, pid, aadhar, pname):
        delete_customer = NewPatient.objects(patient_id=ssnid, aadhar = aadhar, name = pname).get()
        return delete_customer
    def get_customer_using_pid(self, pid):
        update_customer = NewPatient.objects(patient_id=pid).get()
        return update_customer
    def get_customer_using_aadhar(self, aadhar):
        update_customer = NewPatient.objects(aadhar=aadhar).get()
        return update_customer

    ###################################################################################################################








   