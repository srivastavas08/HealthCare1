mongoimport --db HealthCare1 --collection master_diagnosis --file ./database_scripts/master_diagnosis.json --jsonArray
mongoimport --db HealthCare1 --collection master_pharmacy --file ./database_scripts/master_pharmacy.json --jsonArray
mongoimport --db HealthCare1 --collection new_patient --file ./database_scripts/new_patient.json --jsonArray
mongoimport --db HealthCare1 --collection patient_diagnosis --file ./database_scripts/patient_diagnosis.json --jsonArray
mongoimport --db HealthCare1 --collection patient_pharmacy --file ./database_scripts/patient_pharmacy.json --jsonArray

