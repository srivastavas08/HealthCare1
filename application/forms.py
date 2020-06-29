from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, BooleanField, SelectField, IntegerField, DateTimeField
from wtforms.validators import DataRequired, Email, Length, EqualTo, ValidationError
from application.models import User, NewPatient
import datetime


class LoginForm(FlaskForm):
    email = StringField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password", validators=[
                             DataRequired(), Length(min=6, max=15)])
    remember_me = BooleanField("Remember Me")
    submit = SubmitField("Login")


class RegisterForm(FlaskForm):
    email = StringField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password", validators=[
                             DataRequired(), Length(min=6, max=15)])
    password_confirm = PasswordField("Confirm Password", validators=[
                                     DataRequired(), Length(min=6, max=15), EqualTo('password')])
    first_name = StringField("First Name", validators=[
                             DataRequired(), Length(min=2, max=55)])
    last_name = StringField("Last Name", validators=[
                            DataRequired(), Length(min=2, max=55)])
    submit = SubmitField("Register Now")

    def validate_email(self, email):
        user = User.objects(email=email.data).first()
        if user:
            raise ValidationError("Email is already in use. Pick another one.")


class Patient(FlaskForm):
    aadhar = StringField("Aadhar No.", validators=[DataRequired(), Length(min=12, max=12)])
    name = StringField("Name", validators=[DataRequired()])
    address = StringField("Address", validators=[DataRequired()])
    age = StringField("Age", validators=[DataRequired(), Length(min=1, max=3)])
    state = StringField("State", validators=[DataRequired()])
    bedtype = StringField("Bed Type", validators=[DataRequired()])
    city = StringField("City", validators=[DataRequired()])
    submit = SubmitField("Submit")
