from flask import Flask, render_template, jsonify
from flask_mysqldb import MySQL 
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut

app = Flask(__name__)



mysql = MySQL()

# MySQL configurations
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'root'
app.config['MYSQL_DB'] = 'fleco'

mysql.init_app(app)

#add registration

geolocator = Nominatim(user_agent="complaints_mapping", timeout=10) 
@app.route('/')
def dashboard():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM complaints")
    complaints_data = cursor.fetchall()
    cursor.close()

    return render_template("index.html", complaints_data=complaints_data)

@app.route('/complaints_data')
def get_complaints_data():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM complaints")
    complaints_data = cursor.fetchall()
    cursor.close()

    processed_complaints = []
    latitude = None
    longitude = None
    for complaint in complaints_data:
        

        if complaint[5] == 'San Isidro':
            latitude = 14.2811
            longitude = 121.4575
        elif complaint[5] == 'Barangay 2':
            latitude = 14.2775
            longitude = 121.4549

        
        complaint_dict = {
            'id': complaint[0],
            'user_id': complaint[1],
            'complaint_description': complaint[2],
            'consumer': complaint[3],
            'city': complaint[4],
            'street': complaint[5],
            'barangay': complaint[6],
            'date_reported': complaint[7],
            'prioritization_level': complaint[8],
            'latitude': latitude,
            'longitude': longitude
        }
        processed_complaints.append(complaint_dict)

    return jsonify(processed_complaints)

@app.route('/complaints')
def complaints():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM complaints")
    complaints_data = cursor.fetchall()
    cursor.close()
    return render_template(
        "complaints.html", complaints=complaints_data
    )

@app.route('/complaints-tracking')
def complaintsTracking():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM complaints_tracking")
    complaints_tracking_data = cursor.fetchall()
    cursor.close()
    
    return render_template(
        "complaints-tracking.html",complaints_tracking_data = complaints_tracking_data
    )
@app.route('/user-registration')
def userRegistration():
    
    return render_template("user-registration.html")



if __name__ == '__main__':
    app.run(debug=True)