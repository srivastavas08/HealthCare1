from application import app, db
from flask import render_template, request, json, Response, redirect, flash, url_for, session
from application.models import User, NewPatient, HelperCustomer
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
        now_date = datetime.now(timezone.utc)
        
    
        status      = 'Active'
           
        newpatient= NewPatient(aadhar=aadhar, patient_id=patient_id,bedtype=bedtype, name=name, age=age, address= address,
         state=state, city=city, dam = now_date, status=status)
        newpatient.save()

        flash("Patient record creation initiated successfully","success")
        return redirect(url_for('index'))
    return render_template('create_patient.html', title="New Patient", form=form, creatpatient=True)


#UpdatePatient
@app.route('/update_customer', methods=['GET', 'POST'])
@app.route('/update_customer/', methods=['GET', 'POST'])
@app.route('/update_customer/<pid>', methods=['GET', 'POST'])
def UpdatePatient(pid=None):
    if not session.get('username'):
        return redirect(url_for('index'))

    if request.method == 'GET':
        helper_class = HelperCustomer()
        target_customer_object = helper_class.get_customer_for_update(pid)
        if pid==None :
            jdata=target_customer_object
        else:
            jdata=target_customer_object
            jdata = create_customer_account_dict(jdata)
        return render_template('update_customer.html', data=jdata)
    if request.method == 'POST':
        pid  = request.form['PID']
        helper_class = HelperCustomer()
        target_customer_object = helper_class.get_customer_for_update(pid)
        if(len(target_customer_object) > 0 and not None):
            Name = request.form['Name']
            Address = request.form['Address']
            Age = request.form['Age']
            
            try:
                now_date = datetime.now(timezone.utc)
                target_customer_object.update(
                    age = Age,
                    name = Name,
                    address = Address,
                    msg = "successfully updated",
                    dam = now_date
                )
                target_customer_object.save()
                # msg = 'success'
            except:
                flash("Sorry! something went wrong", "danger")
                # msg = 'Sorry! something went wrong'
                return render_template('update_customer.html')
        flash("update successful", "success")
        return render_template('update_customer.html')
        
    return render_template('update_customer.html', data=jdata, UpdatePatient=True)


@app.route("/api/")
@app.route("/api/<pid>") #pid is patient id
def api(pid): #if no data is passed to idx it will take none
    if not session.get('username'):
        return redirect(url_for('index'))
    helper_class = HelperCustomer()
    target_customer_object = helper_class.get_customer_for_update(pid)

    
    

  
# delete customer
@app.route('/delete_customer', methods=['GET', 'POST'])
def deleteCust():
    if not session.get('username'):
        return redirect(url_for('index'))

    if request.method == 'GET':
        return render_template('delete_customer.html')
    if request.method == 'POST':
        ssnid  = request.form['ssnID']
        custid = request.form['custID']
        custname = request.form['custName']
        helper_class = HelperCustomer()
        target_customer_object = helper_class.get_customer_for_delete(ssnid, custid, custname)
        if(len(target_customer_object) > 0 and not None):
            try:
                target_customer_object.delete()
                flash("delete successful", "success")
            except:
                flash("delete unsuccessful", "danger")
                return render_template('delete_customer.html') 
    return render_template('delete_customer.html')



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
    data_dict["AccountStatus"] = "Active"
    data_dict["Message"] = target_customer_object.msg 
    return data_dict

def format_dates(date1):
    d1 = time.strptime(date1, "%Y-%m-%d")
    return d1


##############################################################################