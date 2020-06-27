from application import app, db
from flask import render_template, request, json, Response, redirect, flash, url_for, session
from application.models import User, NewPatient, HelperCustomer, MasterDiagnosis, MasterPharmacy, PatientPharmacy
import random
from application.forms import LoginForm, RegisterForm, Patient
from random import randint
from datetime import datetime, timezone 
import time

########################################################################################
                                    #routes

#INDEX
@app.route("/")
@app.route("/index") #all these will redirect to a single function index
@app.route("/home")
def index():
    return render_template("index.html", index=True)


#Login
@app.route("/login", methods=['GET','POST'])
def login():

    if session.get('username'):
            return redirect(url_for('index'))

    form = LoginForm()
    if form.validate_on_submit():
        email = form.email.data
        password = form.password.data

        user = User.objects(email=email).first()
        login_flag = check_if_pharmacist(email)

        if user and user.get_password(password):
            flash(f"{user.first_name}, You are successfully logged in", "success")
            session['user_id'] = user.user_id
            session['username'] = user.first_name
            session['email'] = user.email
            session['login_flag'] = login_flag
            return redirect('/index')
        else:
            flash("Sorry! something went wrong", "danger")
    return render_template("login.html", title="Login", form=form, login=True)


#Register new exective or pharmacist or diagnostic
@app.route("/register", methods=['POST','GET'])
def register():

    if session.get('username'):
        return redirect(url_for('index'))

    form = RegisterForm()
    if form.validate_on_submit():
        user_id     = User.objects.count()
        user_id    += 1
        

        email       = form.email.data
        password    = form.password.data
        first_name  = form.first_name.data
        last_name   = form.last_name.data

        user = User(user_id=user_id, email=email, first_name=first_name, last_name=last_name)
        user.set_password(password)
        user.save()
        flash("You are successfully registered!","success")
        return redirect(url_for('index'))
    return render_template("register.html", title="Register", form=form, register=True)


#Logout
@app.route("/logout")
def logout():
    session['user_id']=False
    session.pop('username',None)
    return redirect(url_for('index'))


#createPatient
@app.route('/createpatient', methods=['GET','POST'])
def createpatient():
    
    if not session.get('username'):
        return redirect(url_for('index'))

    form = Patient()
    if form.validate_on_submit():

        patient_id    = NewPatient.objects.count() + 100000001 
        patient_id         +=1
        
       
        name       = form.name.data
        age        = form.age.data
        aadhar     = form.aadhar.data
        address    = form.address.data
        state      = form.state.data
        city       = form.city.data
        bedtype = request.form.get('bedtype')
        now_date = insert_now_time()
        dam = request.form['dam']
        
    
        status      = 'Active'
           
        newpatient= NewPatient(aadhar=aadhar, patient_id=patient_id,bedtype=bedtype, name=name, age=age, address= address,
         state=state, city=city, dam = dam, status=status)
        newpatient.save()

        flash("Patient record creation initiated successfully","success")
        return redirect(url_for('index'))
    return render_template('create_patient.html', title="New Patient", form=form, creatpatient=True)

#UpdatePatient
@app.route('/update_patient', methods=['GET', 'POST'])
@app.route('/update_patient/', methods=['GET', 'POST'])
@app.route('/update_patient/<pid>', methods=['GET', 'POST'])
def UpdatePatient(pid=None):
    if not session.get('username'):
        return redirect(url_for('index'))
    if request.method == 'GET':
        if (pid == None) :
            flash("enter patient id", "danger")
            return render_template('display_searched_patient.html')
        else:
            helper_class = HelperCustomer()
            target_customer_object = helper_class.get_customer_for_update(pid)
            jdata=target_customer_object
            jdata = create_customer_account_dict(jdata)
        return render_template('update_patient.html', data=jdata)
    if request.method == 'POST':
        pid  = request.form['PID']
        if (pid == None or pid is None) :
            flash("enter patient id", "danger")
            return render_template('display_searched_patient.html')
        helper_class = HelperCustomer()
        target_customer_object = helper_class.get_customer_for_update(pid)

        jdata = create_customer_account_dict(target_customer_object)
        if(len(target_customer_object) > 0 and not None):
            Name = request.form['custName']
            Address = request.form['custAddress']
            bedtype =request.form.get('bedtype')
            Age = request.form['custAge']
            old_date = request.form['dam']
            
            try:
                target_customer_object.update(
                    age = Age,
                    name = Name,
                    address = Address,
                    bedtype = bedtype,
                    msg = "successfully updated",
                    dam = old_date
                )
                target_customer_object.save()
            except:
                flash("Sorry! something went wrong", "danger")
                return render_template('update_patient.html',data=jdata)
        flash("update successful", "success")
        return render_template('update_patient.html', data=jdata)
    return render_template('update_patient.html', data=jdata, UpdatePatient=True)

# display patients Records status
@app.route('/view_record', methods=['GET','POST'])
def view_record():
    if not session.get('username'):
        return redirect(url_for('index'))
    if request.method == "GET":
        record = []
        for x in NewPatient.objects():
            tmp = create_customer_account_dict(x)
            record.append(tmp)
        print(record)
    return render_template('view_record.html',data=record)



# discharge patient
@app.route('/delete_patient', methods=['GET', 'POST'])
@app.route('/delete_patient/<pid>', methods=['GET', 'POST'])
def DeletePatient(pid):
    if not session.get('username'):
        return redirect(url_for('index'))
    if request.method == 'GET':
        if (pid == None) :
            flash("enter patient id", "danger")
            return render_template('display_searched_patient.html')
        else:
            helper_class = HelperCustomer()
            target_customer_object = helper_class.get_customer_for_update(pid)
            jdata=target_customer_object
            jdata = create_customer_account_dict(jdata)
            return render_template('delete_customer.html', data=jdata)
    if request.method == 'POST':
        if (pid == None or pid is None) :
            flash("enter patient id", "danger")
            return render_template('delete_customer.html',data=jdata)
        helper_class = HelperCustomer()
        target_customer_object = helper_class.get_customer_for_update(pid)
        jdata = create_customer_account_dict(target_customer_object)
        if(len(target_customer_object) > 0 and not None):
            try:
                target_customer_object.delete()
                flash("delete successful", "success")
            except:
                flash("delete unsuccessful", "danger")
                return render_template('delete_customer.html', data=jdata) 
    return render_template('delete_customer.html', data=jdata, DeletePatient=True)


# display patients status
@app.route('/search_patient', methods=['GET','POST'])
def search_patient():
    if not session.get('username'):
        return redirect(url_for('index'))
    if request.method == 'GET':
        return render_template('display_searched_patient.html')
    if request.method == 'POST':
        pid  = request.form['pid']
        helper_class = HelperCustomer()
        target_customer_object = helper_class.get_customer_for_update(pid)
        jdata = create_customer_account_dict(target_customer_object)
        if(len(target_customer_object) > 0 and not None):
            return render_template('display_searched_patient.html',data = jdata)
    return render_template('display_searched_patient.html',data = None)


# assign medicines
@app.route('/assign_medicines', methods=["GET","POST"])
@app.route('/assign_medicines/', methods=["GET","POST"])
@app.route('/assign_medicines/<pid>', methods=["GET","POST"])
def assign_medicines(pid=None):
    if not session.get('username'):
        return redirect(url_for('index'))
    if request.method == 'GET':
        if (pid == None or pid is None):
            try:
                pid = request.args['pid']
            except:
                flash("enter patient id", "danger")
                return redirect(url_for('search_patient'))

        if (pid == None or pid is None) :
            flash("enter patient id", "danger")
            return redirect(url_for('search_patient'))
        if (pid is not None):
            helper_class = HelperCustomer()
            target_customer_object = helper_class.get_customer_for_update(pid)
            jdata = create_customer_account_dict(target_customer_object)
            return render_template('transfer_medicines.html',data=jdata)

        return redirect(url_for('assign_medicines',pid = pid))

    if request.method == 'POST':
    # pid  = request.form['pid']
        if (pid == None) :
            flash("no patient id found", "danger")
            return redirect(url_for('search_patient'))

        medicine_id = request.form.get('medicine_id', type = int)
        medicine_qty = request.form.get('medicine_qty', type = int)

        helper_class = HelperCustomer()

        target_customer_object = helper_class.get_customer_for_update(pid)
        jdata = create_customer_account_dict(target_customer_object)

        med_object = MasterPharmacy.objects(medicine_id = medicine_id).get()
        med_dict = create_medicine_dict(med_object)



        medicine_available = int(med_object.medicine_qty)
        if(medicine_available - medicine_qty <= 0):
            flash("medicine not available in sufficient quantity", "danger")
            return redirect(url_for('assign_medicines',pid = pid))
        else:
            new_qty = medicine_available - medicine_qty
            msg = 'Assigned medicines'
            try:
                issue_object = PatientPharmacy()
                issue_object.das = insert_now_time()
                issue_object.medicine_id = medicine_id
                issue_object.medicine_qty = medicine_qty
                issue_object.patient_id = pid
                target_customer_object.update(msg = msg)
                med_object.update(medicine_qty = new_qty)

                med_object.save()
                target_customer_object.save()
                issue_object.save()
                flash("update successful", "success")
            except:
                flash("update not successful", "danger")
                return redirect(url_for('assign_medicines',pid = pid))
            issue_object = PatientPharmacy.objects.filter(patient_id = pid).all()

            issue_list = []
            for i in issue_object:
                issue_dict = create_issue_dict(i)
                issue_list.append(issue_dict)


        if(len(target_customer_object) > 0 and not None):
            return render_template('transfer_medicines.html',data = jdata, med_data = med_dict, issue_data = issue_list)
    return render_template('transfer_medicines.html',data = None)


#############################################################################################
##############################################################################
                                #FUNCTIONS


def check_if_pharmacist(email):
    is_login_flag = 0
    email = str(email).strip().lower()
    email = email.split('@')[1]
    email = email.split('.')[0]
    if (email == 'pharmacy'):
        # print('YES')
        is_login_flag = 1
    return is_login_flag

def check_if_diagnostic(email):
    is_login_flag = 0
    email = str(email).strip().lower()
    email = email.split('@')[1]
    email = email.split('.')[0]
    if (email == 'diagnosis'):
        # print('YES')
        is_login_flag = 1
    return is_login_flag

def generate_unique():
    rn = randint(10, 99)
    return rn

def create_customer_account_dict(target_customer_object):
    data_dict = {}
    data_dict["PID"] = target_customer_object.patient_id
    data_dict["CustomerID"] = target_customer_object.aadhar
    data_dict["Name"] = target_customer_object.name
    data_dict["Age"] = target_customer_object.age
    data_dict["Address"] = target_customer_object.address
    data_dict["State"] = target_customer_object.state
    data_dict["City"] = target_customer_object.city
    data_dict["BedType"] = target_customer_object.bedtype
    data_dict["Status"] = target_customer_object.status
    data_dict["Message"] = target_customer_object.msg 
    data_dict["dam"] = target_customer_object.dam
    return data_dict

def create_medicine_dict(med_object):
    data_dict = {}
    data_dict['Name'] = med_object.medicine_name
    data_dict['Medicine_ID'] = med_object.medicine_id
    data_dict['Price'] = med_object.medicine_price
    data_dict['Quantity_Available'] = med_object.medicine_qty
    return data_dict

def create_issue_dict(issue_object):
    data_dict = {}
    data_dict['Medicine_ID'] = issue_object.medicine_id
    data_dict['Patient_ID'] = issue_object.patient_id
    data_dict['Message'] = issue_object.msg
    data_dict['Quantity_Issued'] = issue_object.medicine_qty
    data_dict['das'] = issue_object.das

    # data_dict['Total_Amount'] = issue_object.medicine_qty*issue_object.medicine_price
    return  data_dict


def format_dates(date1):
    d1 = time.strptime(date1, "%Y-%m-%d")
    return d1
def format_time(time1):
    t1 = time.strptime(time1,"%H:%M:%S")
    return t1
def insert_now_time():
    now_time = datetime.now(timezone.utc).replace(second=0,microsecond=0,hour=0,minute=0).strftime("%Y-%m-%d %H:%M")
    return now_time
def format_date_with_time(dam):
    formatted_date_time = dam.replace(second=0,microsecond=0,hour=0,minute=0).strftime("%Y-%m-%d %H:%M")
    return formatted_date_time


##############################################################################