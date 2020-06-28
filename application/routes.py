from application import app, db
from flask import render_template, request, json, Response, redirect, flash, url_for, session
from application.models import User, NewPatient, HelperCustomer, MasterDiagnosis, MasterPharmacy, PatientPharmacy, PatientDiagnosis
import random
from application.forms import LoginForm, RegisterForm, Patient
from random import randint
from datetime import datetime, timezone
import time

########################################################################################
#routes

#INDEX


@app.route("/")
@app.route("/index")  # all these will redirect to a single function index
@app.route("/home")
def index():
    return render_template("index.html", index=True)


# Login
@app.route("/login", methods=['GET', 'POST'])
def login():

    if session.get('username'):
        return redirect(url_for('index'))

    form = LoginForm()
    if form.validate_on_submit():
        email = form.email.data
        password = form.password.data

        user = User.objects(email=email).first()

        if user and user.get_password(password):
            flash(f"{user.first_name}, You are successfully logged in", "success")
            session['user_id'] = user.user_id
            session['username'] = user.first_name
            session['email'] = user.email
            return redirect('/index')
        else:
            flash("Sorry! something went wrong", "danger")
    return render_template("login.html", title="Login", form=form, login=True)


# Register new exective or pharmacist or diagnostic
@app.route("/register", methods=['POST', 'GET'])
def register():

    if session.get('username'):
        return redirect(url_for('index'))

    form = RegisterForm()
    if form.validate_on_submit():
        user_id = User.objects.count()
        user_id += 1

        email = form.email.data
        password = form.password.data
        first_name = form.first_name.data
        last_name = form.last_name.data

        user = User(user_id=user_id, email=email,
                    first_name=first_name, last_name=last_name)
        user.set_password(password)
        user.save()
        flash("You are successfully registered!", "success")
        return redirect(url_for('index'))
    return render_template("register.html", title="Register", form=form, register=True)


# Logout
@app.route("/logout")
def logout():
    session['user_id'] = False
    session.pop('username', None)
    return redirect(url_for('index'))


# createPatient
@app.route('/createpatient', methods=['GET', 'POST'])
def createpatient():

    if not session.get('username'):
        return redirect(url_for('index'))

    executive_flag = check_if_executive(session.get('email'))
    if(executive_flag != 1):
        flash(f"unprivilaged access as executive", "danger")
        return redirect(url_for('index'))

    # flag = session.get('executive_flag')
    # print(flag)
    # if(flag != 1):
    #     flash(f"unprivilaged access", "danger")
    #     return redirect(url_for('index'))

    form = Patient()
    if form.validate_on_submit():

        patient_id = NewPatient.objects.count() + 100000001
        patient_id += 1

        name = form.name.data
        age = form.age.data
        aadhar = form.aadhar.data
        address = form.address.data
        state = form.state.data
        city = form.city.data
        bedtype = request.form.get('bedtype')
        now_date = insert_now_time()
        dam = request.form['dam']

        status = 'Active'

        newpatient = NewPatient(aadhar=aadhar, patient_id=patient_id, bedtype=bedtype, name=name, age=age, address=address,
                                state=state, city=city, dam=dam, status=status)
        newpatient.save()

        flash("Patient record creation initiated successfully", "success")
        return redirect(url_for('index'))
    return render_template('create_patient.html', title="New Patient", form=form, creatpatient=True)

# UpdatePatient


@app.route('/update_patient', methods=['GET', 'POST'])
@app.route('/update_patient/', methods=['GET', 'POST'])
@app.route('/update_patient/<pid>', methods=['GET', 'POST'])
def UpdatePatient(pid=None):
    if not session.get('username'):
        return redirect(url_for('index'))

    executive_flag = check_if_executive(session.get('email'))
    if(executive_flag != 1):
        flash(f"unprivilaged access as executive", "danger")
        return redirect(url_for('index'))

    if request.method == 'GET':
        if (pid == None):
            flash("enter patient id", "danger")
            return render_template('display_searched_patient.html')
        else:
            helper_class = HelperCustomer()
            target_customer_object = helper_class.get_customer_for_update(pid)
            jdata = target_customer_object
            jdata = create_customer_account_dict(jdata)
        return render_template('update_patient.html', data=jdata)
    if request.method == 'POST':
        pid = request.form['PID']
        if (pid == None or pid is None):
            flash("enter patient id", "danger")
            return render_template('display_searched_patient.html')
        helper_class = HelperCustomer()
        target_customer_object = helper_class.get_customer_for_update(pid)

        jdata = create_customer_account_dict(target_customer_object)
        if(len(target_customer_object) > 0 and not None):
            Name = request.form['custName']
            Address = request.form['custAddress']
            bedtype = request.form.get('bedtype')
            Age = request.form['custAge']
            old_date = request.form['dam']

            try:
                target_customer_object.update(
                    age=Age,
                    name=Name,
                    address=Address,
                    bedtype=bedtype,
                    msg="successfully updated",
                    dam=old_date
                )
                target_customer_object.save()
            except:
                flash("Sorry! something went wrong", "danger")
                return render_template('update_patient.html', data=jdata)
        flash("update successful", "success")
        return render_template('update_patient.html', data=jdata)
    return render_template('update_patient.html', data=jdata, UpdatePatient=True)

# display patients Records status


@app.route('/view_record', methods=['GET', 'POST'])
def view_record():
    if not session.get('username'):
        return redirect(url_for('index'))
    executive_flag = check_if_executive(session.get('email'))
    if(executive_flag != 1):
        flash(f"unprivilaged access as executive", "danger")
        return redirect(url_for('index'))
    if request.method == "GET":
        record = []
        for x in NewPatient.objects():
            tmp = create_customer_account_dict(x)
            record.append(tmp)
        print(record)
    return render_template('view_record.html', data=record)


# discharge patient
@app.route('/delete_patient', methods=['GET', 'POST'])
@app.route('/delete_patient/<pid>', methods=['GET', 'POST'])
def DeletePatient(pid):
    if not session.get('username'):
        return redirect(url_for('index'))
    executive_flag = check_if_executive(session.get('email'))
    if(executive_flag != 1):
        flash(f"unprivilaged access as executive", "danger")
        return redirect(url_for('index'))
    if request.method == 'GET':
        if (pid == None):
            flash("enter patient id", "danger")
            return render_template('display_searched_patient.html')
        else:
            helper_class = HelperCustomer()
            target_customer_object = helper_class.get_customer_for_update(pid)
            jdata = target_customer_object
            jdata = create_customer_account_dict(jdata)
            return render_template('delete_customer.html', data=jdata)
    if request.method == 'POST':
        if (pid == None or pid is None):
            flash("enter patient id", "danger")
            return render_template('delete_customer.html', data=jdata)
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
@app.route('/search_patient', methods=['GET', 'POST'])
def search_patient():
    if not session.get('username'):
        return redirect(url_for('index'))
    executive_flag = check_if_executive(session.get('email'))
    if(executive_flag != 1):
        flash(f"unprivilaged access as executive", "danger")
        return redirect(url_for('index'))
    if request.method == 'GET':
        return render_template('display_searched_patient.html')
    if request.method == 'POST':
        pid = request.form['pid']
        helper_class = HelperCustomer()
        target_customer_object = helper_class.get_customer_for_update(pid)
        jdata = create_customer_account_dict(target_customer_object)
        if(len(target_customer_object) > 0 and not None):
            return render_template('display_searched_patient.html', data=jdata)
    return render_template('display_searched_patient.html', data=None)


# assign medicines
@app.route('/assign_medicines', methods=["GET", "POST"])
@app.route('/assign_medicines/', methods=["GET", "POST"])
@app.route('/assign_medicines/<pid>', methods=["GET", "POST"])
def assign_medicines(pid=None):
    if not session.get('username'):
        return redirect(url_for('index'))
    pharmacist_flag = check_if_pharmacist(session.get('email'))
    if(pharmacist_flag != 1):
        flash(f"unprivilaged access as pharmacist", "danger")
        return redirect(url_for('index'))
    if request.method == 'GET':
        if (pid == None or pid is None):
            try:
                pid = request.args['pid']
            except:
                flash("enter patient id", "danger")
                return redirect(url_for('search_patient_pharmacy'))

        if (pid == None or pid is None):
            flash("enter patient id", "danger")
            return redirect(url_for('search_patient_pharmacy'))
        if (pid is not None):
            helper_class = HelperCustomer()
            target_customer_object = helper_class.get_customer_for_update(pid)
            jdata = create_customer_account_dict(target_customer_object)

            issue_object = PatientPharmacy.objects.filter(patient_id=pid).all()
            issue_list = []
            for i in issue_object:
                issue_dict = create_issue_dict(i)
                issue_list.append(issue_dict)

            return render_template('transfer_medicines.html', data=jdata, issue_data=issue_list)

        return redirect(url_for('assign_medicines', pid=pid))

    if request.method == 'POST':
        # pid  = request.form['pid']
        if (pid == None):
            flash("no patient id found", "danger")
            return redirect(url_for('search_patient_pharmacy'))

        medicine_id = request.form.get('medicine_id', type=int)
        medicine_qty = request.form.get('medicine_qty', type=int)

        helper_class = HelperCustomer()

        target_customer_object = helper_class.get_customer_for_update(pid)
        jdata = create_customer_account_dict(target_customer_object)

        med_object = MasterPharmacy.objects(medicine_id=medicine_id).get()
        med_dict = create_medicine_dict(med_object)

        medicine_available = int(med_object.medicine_qty)
        if(medicine_available - medicine_qty <= 0):
            flash("medicine not available in sufficient quantity", "danger")
            return redirect(url_for('assign_medicines', pid=pid))
        else:
            new_qty = medicine_available - medicine_qty
            msg = 'Assigned medicines'
            try:
                issue_object = PatientPharmacy()
                issue_object.das = insert_now_time()
                issue_object.medicine_id = medicine_id
                issue_object.medicine_qty = medicine_qty
                issue_object.patient_id = pid
                target_customer_object.update(msg=msg)
                med_object.update(medicine_qty=new_qty)

                med_object.save()
                target_customer_object.save()
                issue_object.save()
                flash("Medicine Issued to Patient successful", "success")
            except:
                flash("update not successful", "danger")
                return redirect(url_for('assign_medicines', pid=pid))
            issue_object = PatientPharmacy.objects.filter(patient_id=pid).all()

            issue_list = []
            for i in issue_object:
                issue_dict = create_issue_dict(i)
                issue_list.append(issue_dict)

        if(len(target_customer_object) > 0 and not None):
            return render_template('transfer_medicines.html', data=jdata, med_data=med_dict, issue_data=issue_list)
    return render_template('transfer_medicines.html', data=None)

# display Available Medicine Records status


@app.route('/stock_medicines', methods=['GET', 'POST'])
def viewPharmacy():
    if not session.get('username'):
        return redirect(url_for('index'))
    pharmacist_flag = check_if_pharmacist(session.get('email'))
    if(pharmacist_flag != 1):
        flash(f"unprivilaged access as pharmacist", "danger")
        return redirect(url_for('index'))
    if request.method == "GET":
        record = []
        for x in MasterPharmacy.objects():
            tmp = create_medicine_dict(x)
            record.append(tmp)
        print(record)
    return render_template('view_pharmacy.html', data=record)


# display patients status for pharmacy
@app.route('/search_patient_pharmacy', methods=['GET', 'POST'])
def search_patient_pharmacy():
    if not session.get('username'):
        return redirect(url_for('index'))
    pharmacist_flag = check_if_pharmacist(session.get('email'))
    if(pharmacist_flag != 1):
        flash(f"unprivilaged access as pharmacist", "danger")
        return redirect(url_for('index'))
    if request.method == 'GET':
        return render_template('search_patient_pharmacy.html')
    if request.method == 'POST':
        pid = request.form['pid']
        helper_class = HelperCustomer()
        target_customer_object = helper_class.get_customer_for_update(pid)
        jdata = create_customer_account_dict(target_customer_object)
        if(len(target_customer_object) > 0 and not None):
            return render_template('search_patient_pharmacy.html', data=jdata)
    return render_template('search_patient_pharmacy.html', data=None)

# display patients status for Diagnosis


@app.route('/search_patient_diagnosis', methods=['GET', 'POST'])
def search_patient_diagnosis():
    if not session.get('username'):
        return redirect(url_for('index'))
    diagnostic_flag = check_if_diagnostic(session.get('email'))
    if(diagnostic_flag != 1):
        flash(f"unprivilaged access as diagnostic", "danger")
        return redirect(url_for('index'))
    if request.method == 'GET':
        return render_template('search_patient_diagnosis.html')
    if request.method == 'POST':
        pid = request.form['pid']
        helper_class = HelperCustomer()
        target_customer_object = helper_class.get_customer_for_update(pid)
        jdata = create_customer_account_dict(target_customer_object)
        if(len(target_customer_object) > 0 and not None):
            return render_template('search_patient_diagnosis.html', data=jdata)
    return render_template('search_patient_diagnosis.html', data=None)

# refer test


@app.route('/refer_test', methods=["GET", "POST"])
@app.route('/refer_test/', methods=["GET", "POST"])
@app.route('/refer_test/<pid>', methods=["GET", "POST"])
def refer_test(pid=None):
    if not session.get('username'):
        return redirect(url_for('index'))
    diagnostic_flag = check_if_diagnostic(session.get('email'))
    if(diagnostic_flag != 1):
        flash(f"unprivilaged access as diagnostic", "danger")
        return redirect(url_for('index'))
    if request.method == 'GET':
        if (pid == None or pid is None):
            try:
                pid = request.args['pid']
            except:
                flash("enter patient id", "danger")
                return redirect(url_for('search_patient_diagnosis'))

        if (pid == None or pid is None):
            flash("enter patient id", "danger")
            return redirect(url_for('search_patient_diagnosis'))
        if (pid is not None):
            helper_class = HelperCustomer()
            target_customer_object = helper_class.get_customer_for_update(pid)
            jdata = create_customer_account_dict(target_customer_object)

            issue_object = PatientDiagnosis.objects.filter(
                patient_id=pid).all()
            issue_list = []
            for i in issue_object:
                issue_dict = create_patient_diag_dict(i)
                issue_list.append(issue_dict)

            return render_template('refer_test.html', data=jdata, issue_data=issue_list)

        return redirect(url_for('refer_test', pid=pid))

    if request.method == 'POST':
        # pid  = request.form['pid']
        if (pid == None):
            flash("no patient id found", "danger")
            return redirect(url_for('search_patient_diagnosis'))

        test_id = request.form.get('test_id', type=int)

        helper_class = HelperCustomer()

        target_customer_object = helper_class.get_customer_for_update(pid)
        jdata = create_customer_account_dict(target_customer_object)

        test_object = MasterDiagnosis.objects(test_id=test_id).get()
        test_dict = create_diag_dict(test_object)

        msg = 'Refered test'
        test_name = test_dict['Name']

        try:
            issue_object = PatientDiagnosis()
            issue_object.das = insert_now_time()
            issue_object.test_id = test_id
            issue_object.patient_id = pid
            issue_object.test_name = test_name
            target_customer_object.update(msg=msg)
            test_object.save()
            target_customer_object.save()
            issue_object.save()
            flash("Test reffered to Patient successful", "success")
        except:
            flash("update not successful", "danger")
            return redirect(url_for('refer_test', pid=pid))
        issue_object = PatientDiagnosis.objects.filter(patient_id=pid).all()

        issue_list = []
        for i in issue_object:
            issue_dict = create_patient_diag_dict(i)
            issue_list.append(issue_dict)

        if(len(target_customer_object) > 0 and not None):
            return render_template('refer_test.html', data=jdata, test_data=test_dict, issue_data=issue_list)
    return render_template('refer_test.html', data=None)

# display Available test Records status


@app.route('/available_test', methods=['GET', 'POST'])
def TestAvailable():
    if not session.get('username'):
        return redirect(url_for('index'))
    diagnostic_flag = check_if_diagnostic(session.get('email'))
    if(diagnostic_flag != 1):
        flash(f"unprivilaged access as diagnostic", "danger")
        return redirect(url_for('index'))
    if request.method == "GET":
        record = []
        for x in MasterDiagnosis.objects():
            tmp = create_diag_dict(x)
            record.append(tmp)
        print(record)
    return render_template('diagnosis.html', data=record)

# Generate Bill customer Search


@app.route('/billing', methods=['GET', 'POST'])
def BillGeneration_customer_screen():
    if not session.get('username'):
        return redirect(url_for('index'))
    executive_flag = check_if_executive(session.get('email'))
    if(executive_flag != 1):
        flash(f"unprivilaged access as executive", "danger")
        return redirect(url_for('index'))
    if request.method == 'GET':
        return render_template('bill.html')
    if request.method == 'POST':
        pid = request.form['pid']
        helper_class = HelperCustomer()
        target_customer_object = helper_class.get_customer_for_update(pid)
        jdata = create_customer_account_dict(target_customer_object)
        if(len(target_customer_object) > 0 and not None):
            return render_template('bill.html', data=jdata)
    return render_template('bill.html', data=None)


# Bill Generation
@app.route('/generate_bill', methods=["GET", "POST"])
@app.route('/generate_bill/', methods=["GET", "POST"])
@app.route('/generate_bill/<pid>', methods=["GET", "POST"])
def BillGeneration(pid=None):
    if not session.get('username'):
        return redirect(url_for('index'))
    executive_flag = check_if_executive(session.get('email'))
    if(executive_flag != 1):
        flash(f"unprivilaged access as executive", "danger")
    if request.method == 'GET':
        if (pid == None or pid is None):
            try:
                pid = request.args['pid']
            except:
                flash("enter patient id", "danger")
                return redirect(url_for('BillGeneration_customer_search'))

        if (pid == None or pid is None):
            flash("enter patient id", "danger")
            return redirect(url_for('BillGeneration_customer_search'))
        if (pid is not None):
            helper_class = HelperCustomer()
            target_customer_object = helper_class.get_customer_for_update(pid)
            jdata = create_customer_account_dict(target_customer_object)
            dam = jdata['dam']
            bed = jdata['BedType']
            now_date = datetime.now(timezone.utc).replace(tzinfo=None)
            days_admitted = now_date - dam
            days_admitted = days_admitted.days
            bedcharges = check_bedtype(bed)

            # new join/merged methods used (unreviwed)
            issue_object_diagnosis = make_patient_diagnosis_join(pid)
            issue_diagnosis = []
            for i in issue_object_diagnosis:
                issue_diagnosis_dict = create_patient_diagnosis_dict(i)
                issue_diagnosis.append(issue_diagnosis_dict)

            # new join/merged methods used (unreviewed)
            issue_object_pharmacy = make_patient_pharmacy_join(pid)
            issue_pharmacy = []
            for i in issue_object_pharmacy:
                issue_dict_pharmacy = create_patient_pharmacy_dict(i)
                issue_pharmacy.append(issue_dict_pharmacy)

            total_admission_bill = get_total_admission_bill(jdata)
            if(total_admission_bill['Total_Bill'] <= 0):
                flash("error generating admission bill", "danger")
                return redirect(url_for('search_patient'))

            total_pharmacy_bill = get_total_pharmacy_bill(pid)
            if('Total_Bill' not in total_pharmacy_bill):
                total_pharmacy_bill['Total_Bill'] = 0
                try:
                    if(total_pharmacy_bill['Total_Bill'] < 0):
                        flash("error generating pharmacy bill", "danger")
                except:
                    flash("error generating pharmacy bill", "danger")

            total_diagnosis_bill = get_total_diagnosis_bill(pid)
            if('Total_Bill' not in total_diagnosis_bill):
                total_diagnosis_bill['Total_Bill'] = 0
                try:
                    if(total_diagnosis_bill['Total_Bill'] < 0):
                        flash("error generating diagnosis bill", "danger")
                except:
                    flash("error generating diagnosis bill", "danger")

            grand_total_bill = total_admission_bill['Total_Bill'] + \
                total_pharmacy_bill['Total_Bill'] + \
                total_diagnosis_bill['Total_Bill']

            return render_template('generate_bill.html', data=jdata, issue_diagnosis=issue_diagnosis, issue_pharmacy=issue_pharmacy, pharmacy_bill=total_pharmacy_bill, diagnosis_bill=total_diagnosis_bill, admission_bill=total_admission_bill, grand_bill=grand_total_bill, now_date=now_date, days_admitted=days_admitted, bedcharges=bedcharges)

        return redirect(url_for('generate_bill.html', pid=pid))

    return render_template('generate_bill.html', data=None)

#############################################################################################
##############################################################################
    # FUNCTIONS


def check_if_executive(email):
    is_login_flag = 0
    email = str(email).strip().lower()
    email = email.split('@')[1]
    email = email.split('.')[0]
    if (email == 'executive'):
        # print('YES')
        is_login_flag = 1
    return is_login_flag


def check_if_pharmacist(email):
    is_login_flag = 0
    email = str(email).strip().lower()
    email = email.split('@')[1]
    email = email.split('.')[0]
    if (email == 'pharmacy' or email == 'executive'):
        # print('YES')
        is_login_flag = 1
    return is_login_flag


def check_if_diagnostic(email):
    is_login_flag = 0
    email = str(email).strip().lower()
    email = email.split('@')[1]
    email = email.split('.')[0]
    if (email == 'diagnostic' or email == 'executive'):
        # print('YES')
        is_login_flag = 1
    return is_login_flag


def generate_unique():
    rn = randint(10, 99)
    return rn

# patient dict


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

# master pharmacy dict


def create_medicine_dict(med_object):
    data_dict = {}
    data_dict['Name'] = med_object.medicine_name
    data_dict['Medicine_ID'] = med_object.medicine_id
    data_dict['Price'] = med_object.medicine_price
    data_dict['Quantity_Available'] = med_object.medicine_qty
    return data_dict

# master diagnosis dict


def create_diag_dict(diag_object):
    data_dict = {}
    data_dict['Name'] = diag_object.test_name
    data_dict['Test_ID'] = diag_object.test_id
    data_dict['Price'] = diag_object.test_price
    return data_dict

# patient diagnosis dict to be merged


def create_patient_diag_dict(diag_object):
    data_dict = {}
    data_dict['Name'] = diag_object.test_name
    data_dict['Test_ID'] = diag_object.test_id
    data_dict['Message'] = diag_object.msg
    data_dict['Date'] = diag_object.das
    return data_dict

# patient medicine dict to be merged


def create_issue_dict(issue_object):
    data_dict = {}
    data_dict['Medicine_ID'] = issue_object.medicine_id
    data_dict['Patient_ID'] = issue_object.patient_id
    data_dict['Message'] = issue_object.msg
    data_dict['Quantity_Issued'] = issue_object.medicine_qty
    data_dict['das'] = issue_object.das

    # data_dict['Total_Amount'] = issue_object.medicine_qty*issue_object.medicine_price
    return data_dict

# patient diagnosis dict to be merged


def create_refered_test_dict(issue_object):
    data_dict = {}
    data_dict['Test_ID'] = issue_object.test_id
    data_dict['Patient_ID'] = issue_object.patient_id
    data_dict['Message'] = issue_object.msg
    data_dict['das'] = issue_object.das

    # data_dict['Total_Amount'] = issue_object.medicine_qty*issue_object.medicine_price
    return data_dict


def format_dates(date1):
    d1 = time.strptime(date1, "%Y-%m-%d")
    return d1


def format_time(time1):
    t1 = time.strptime(time1, "%H:%M:%S")
    return t1


def insert_now_time():
    now_time = datetime.now(timezone.utc).replace(
        second=0, microsecond=0, hour=0, minute=0).strftime("%Y-%m-%d %H:%M")
    return now_time


def format_date_with_time(dam):
    formatted_date_time = dam.replace(
        second=0, microsecond=0, hour=0, minute=0).strftime("%Y-%m-%d %H:%M")
    return formatted_date_time


def get_total_pharmacy_bill(pid):
    pid = int(pid)
    pharmacy_bill = [
        {
            '$match': {
                'patient_id': pid
            }
        }, {
            '$lookup': {
                'from': 'master_pharmacy',
                'localField': 'medicine_id',
                'foreignField': 'medicine_id',
                'as': 'r1'
            }
        }, {
            '$unwind': {
                'path': '$r1',
                'preserveNullAndEmptyArrays': False
            }
        }, {
            "$project": {
                "total_pharmacy": {"$multiply": ["$medicine_qty", "$r1.medicine_price"]}
            }
        }, {
            '$group': {
                '_id': '',
                'final_pharmacy': {
                    '$sum': '$total_pharmacy'
                }
            }
        }
    ]
    pharmacy_bill_object = PatientPharmacy.objects().aggregate(pharmacy_bill)
    pharmacy_bill_dict = {}
    for i in pharmacy_bill_object:
        pharmacy_bill_dict['Total_Bill'] = i['final_pharmacy']
    return pharmacy_bill_dict


def get_total_diagnosis_bill(pid):
    pid = int(pid)
    diagnosis_bill = [
        {
            '$match': {
                'patient_id': pid
            }
        }, {
            '$lookup': {
                'from': 'master_diagnosis',
                'localField': 'test_id',
                'foreignField': 'test_id',
                'as': 'r1'
            }
        }, {
            '$unwind': {
                'path': '$r1',
                'preserveNullAndEmptyArrays': False
            }
        }, {
            '$group': {
                '_id': '',
                'total_diagnosis': {
                    '$sum': '$r1.test_price'
                }
            }
        }
    ]
    total_diagnosis_object = PatientDiagnosis.objects().aggregate(diagnosis_bill)
    pharmacy_bill_dict = {}
    for i in total_diagnosis_object:
        pharmacy_bill_dict['Total_Bill'] = i['total_diagnosis']
    return pharmacy_bill_dict

# master pharmacy and patient_pharmacy merged


def make_patient_pharmacy_join(pid):
    pid = int(pid)
    pharmacy_join = [
        {
            '$match': {
                'patient_id': pid
            }
        }, {
            '$lookup': {
                'from': 'master_pharmacy',
                'localField': 'medicine_id',
                'foreignField': 'medicine_id',
                'as': 'r1'
            }
        }, {
            '$unwind': {
                'path': '$r1',
                'preserveNullAndEmptyArrays': False
            }
        }
    ]
    data_object = PatientPharmacy.objects().aggregate(pharmacy_join)
    return data_object

# master pharmacy and patient_pharmacy merged


def create_patient_pharmacy_dict(patient_pharmacy_object):
    data_dict = {}
    data_dict['Quantity'] = patient_pharmacy_object['medicine_qty']
    data_dict['Price'] = patient_pharmacy_object['r1']['medicine_price']
    data_dict['Name'] = patient_pharmacy_object['r1']['medicine_name']
    data_dict['Patient_ID'] = patient_pharmacy_object['patient_id']
    data_dict['Medicine_ID'] = patient_pharmacy_object['r1']['medicine_id']
    data_dict['das'] = patient_pharmacy_object['das']
    return data_dict


# master daignosis and patient_diagnosis merged
def make_patient_diagnosis_join(pid):
    pid = int(pid)
    diagnosis_join = [
        {
            '$match': {
                'patient_id': pid
            }
        }, {
            '$lookup': {
                'from': 'master_diagnosis',
                'localField': 'test_id',
                'foreignField': 'test_id',
                'as': 'r1'
            }
        }, {
            '$unwind': {
                'path': '$r1',
                'includeArrayIndex': 'limiter',
                'preserveNullAndEmptyArrays': False
            }
        }]
    data_object = PatientDiagnosis.objects().aggregate(diagnosis_join)
    return data_object

# master diagnosis and patient_diagnosis merged


def create_patient_diagnosis_dict(patient_diagnosis_object):

    data_dict = {}
    data_dict['Price'] = patient_diagnosis_object['r1']['test_price']
    data_dict['Name'] = patient_diagnosis_object['r1']['test_name']
    data_dict['Patient_ID'] = patient_diagnosis_object['patient_id']
    data_dict['Test_ID'] = patient_diagnosis_object['r1']['test_id']
    data_dict['das'] = patient_diagnosis_object['das']
    return data_dict

# calculate admission bill wrt now date


def get_total_admission_bill(patient_dict):
    dam = patient_dict['dam']
    bedtype = patient_dict['BedType'].strip().lower()
    admission_bill_dict = {}

    dam = dam.replace(tzinfo=None)
    now_date = datetime.now(timezone.utc).replace(tzinfo=None)
    days_admitted = now_date - dam
    days_admitted = days_admitted.days

    total_admission_bill = 1
    if(bedtype == "generalward" or bedtype == "general ward"):
        total_admission_bill = days_admitted*2000
    elif(bedtype == "semisharing" or bedtype == "semi sharing"):
        total_admission_bill = days_admitted*4000
    elif(bedtype == "singleroom" or bedtype == "single room"):
        total_admission_bill = days_admitted*8000
    else:
        total_admission_bill = 0
    admission_bill_dict['Total_Bill'] = int(total_admission_bill)
    return admission_bill_dict


def check_bedtype(bedtype):
    bedtype = bedtype.lower()
    bed_price = 1
    if(bedtype == "generalward" or bedtype == "general ward"):
        bed_price = 2000
    elif(bedtype == "semisharing" or bedtype == "semi sharing"):
        bed_price = 4000
    elif(bedtype == "singleroom" or bedtype == "single room"):
        bed_price = 8000
    return bed_price

##############################################################################
