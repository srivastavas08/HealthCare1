import flask
from application import db
from werkzeug.security import generate_password_hash, check_password_hash
import datetime


class User(db.Document):
    user_id = db.IntField(unique=True)
    user_name = db.StringField(max_length=30, unique=True)
    first_name = db.StringField(max_length=50)
    last_name = db.StringField(max_length=50)
    email = db.StringField(max_length=30)
    password = db.StringField()

    #For Generating password Hash
    def set_password(self, password):
        self.password = generate_password_hash(password)

    def get_password(self, password):
        return check_password_hash(self.password, password)

#For Creating New Patient Records
class NewPatient(db.Document):
    patient_id = db.IntField(unique=True)
    name = db.StringField(max_length=50)
    age = db.IntField(max_length=3)
    aadhar = db.IntField(max_length=12, unique=True)
    address = db.StringField(max_length=30)
    state = db.StringField(max_length=20)
    city = db.StringField(max_length=15)
    msg = db.StringField(max_length=50)
    dam = db.DateTimeField()  # dam= date of admission
    status = db.StringField()
    bedtype = db.StringField()

#For Available Medicines
class MasterPharmacy(db.Document):
    medicine_id = db.IntField(max_length=4, unique=True)
    medicine_name = db.StringField()
    medicine_qty = db.IntField()
    medicine_price = db.FloatField()

#For Available Diagnosis
class MasterDiagnosis(db.Document):
    test_id = db.IntField(max_length=4, unique=True)
    test_name = db.StringField()
    test_price = db.FloatField()

#For Assigned Medicines
class PatientPharmacy(db.Document):
    patient_id = db.IntField()
    medicine_id = db.IntField()
    medicine_qty = db.IntField()
    msg = db.StringField()
    das = db.DateTimeField()  # das = date of assignment

#For Assigned Test
class PatientDiagnosis(db.Document):
    test_name = db.StringField()
    patient_id = db.IntField()
    test_id = db.IntField()
    msg = db.StringField()
    das = db.DateTimeField()  # das = date of assignment


#HelperClass to read values from database
class HelperCustomer():
    def get_customer_for_update(self, pid):
        update_customer = NewPatient.objects(patient_id=pid).get()
        return update_customer

    def get_customer_for_delete(self, pid, aadhar, pname):
        delete_customer = NewPatient.objects(
            patient_id=pid, aadhar=aadhar, name=pname).get()
        return delete_customer

    def get_customer_using_pid(self, pid):
        update_customer = NewPatient.objects(patient_id=pid).get()
        return update_customer

    def get_customer_using_aadhar(self, aadhar):
        update_customer = NewPatient.objects(aadhar=aadhar).get()
        return update_customer

    def get_pharmacy_using_medid(self, medid):
        med_object = MasterPharmacy.objects(medicine_id=medid).get()
        return med_object

    def get_diagnosis_using_testid(self, testid):
        test_object = MasterDiagnosis.objects(test_id=testid).get()
        return test_object

    ###################################################################################################################
