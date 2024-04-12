from flask import Flask, render_template
from flask_mysqldb import MySQL 
app = Flask(__name__)



mysql = MySQL()

# MySQL configurations
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'root'
app.config['MYSQL_DB'] = 'fleco'

mysql.init_app(app)

@app.route('/')
def dashboard():
    
    return render_template(
        "index.html"
    )

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



if __name__ == '__main__':
    app.run(debug=True)