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
    age            = db.IntField( max_length=3 )
    aadhar            = db.IntField( max_length=12, unique=True )
    address        = db.StringField( max_length=30 )
    state          =  db.StringField( max_length=20 )
    city           = db.StringField( max_length=15 )
    msg            = db.StringField(max_length = 50)
    dam             = db.DateTimeField()   #dam= date of admission
    status         = db.StringField()
    bedtype         = db.StringField()
    

class MasterPharmacy(db.Document):
    medicine_id     = db.IntField(max_length = 4)
    medicine_name   = db.StringField()
    medicine_qty = db.IntField()
    medicine_price = db.FloatField()

class MasterDiagnosis(db.Document):
    test_id     = db.IntField(max_length = 4)
    test_name   = db.StringField()
    test_price = db.FloatField()

class PatientPharmacy(db.Document):
    patient_id = db.IntField()
    medicine_id = db.IntField()
    medicine_qty = db.IntField()


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
    def get_pharmacy_using_medid(self, medid):
        med_object = MasterPharmacy.objects(medicine_id = medid).get()
        return med_object
    def get_issued_medicines_using_patid(self,patid):
        issue_object = PatientPharmacy.objects(patient_id = patid).get()
        return issue_object

    ###################################################################################################################








   