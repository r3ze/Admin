from flask import Flask, render_template, jsonify
from flask_mysqldb import MySQL 
from geopy.geocoders import Nominatim
from appwrite.client import Client
from appwrite.services.databases import Databases

app = Flask(__name__)

client = Client()
client.set_endpoint('https://cloud.appwrite.io/v1')
client.set_project('662248657f5bd3dd103c')
client.set_key('207cd5fd8dc09632737a600005a611e179f5b0ed8d8049b385f4f396c97581599ee63732daca48d79ec51029363c8225280013a93e7509061c4adeddc8dfc7cf081a521301153811fc6625d57077dbcc7b8a0e048ce8d5ab0137000cd4af98155a1779fad9bed80c9714ee3bdced5a97b5c3ea5b3349f54abf3871ff10f70e0b')


database = Databases(client)

DATABASE_ID = '66224a152d9f9a67af78'  # Replace with your Appwrite database ID
COLLECTION_ID = '6626029b134a98006f77'  # Replace with your collection ID
USER_COLLECTION_ID = '662601d0b9e605665bb4'
#add registration


#count users
def count_users():
    try:
        # Fetch all documents from the 'users' collection
        response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=USER_COLLECTION_ID
        )
        total_users = len(response['documents'])
        return total_users
    except Exception as e:
        print(f"Error counting users: {str(e)}")
        return 0  # Return 0 if there's an error

#count complaints
def count_complaints():
    try:
        # Fetch all documents from the 'users' collection
        response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID
        )
        total_complaints = len(response['documents'])
        return total_complaints
    except Exception as e:
        print(f"Error counting users: {str(e)}")
        return 0  # Return 0 if there's an error

@app.route('/')
def dashboard():
    
 try:
        # Fetch all documents from the 'complaints' collection
        response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID
        )
        total_users = count_users()
        total_complaints = count_complaints()
        complaints_data = response['documents'][:7]  # Limiting to the first 5 complaints
        return render_template("index.html", complaints=complaints_data, total_users=total_users, total_complaints = total_complaints)
 except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/complaints_data')
def get_complaints_data():
    try:
        # Fetch all documents from the 'complaints' collection
        response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID
        
        )
        complaints_data = response['documents']

        processed_complaints = []
        for complaint in complaints_data:
            latitude = None
            longitude = None

            
            if complaint['city'] == 'Pagsanjan' and complaint['barangay'] =='san isidro':
                latitude = 14.2811
                longitude = 121.4575
            elif complaint['city'] == 'Siniloan' and complaint['barangay'] =='ni':
                latitude = 14.2775
                longitude = 121.4549

            complaint_dict = {
               
            
      
                'city': complaint['city'],
                'barangay': complaint['barangay'],
                'date_reported': complaint['createdAt'],
                'latitude': latitude,
                'longitude': longitude
            }
            processed_complaints.append(complaint_dict)

        return jsonify(processed_complaints)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/complaints')
def complaints():
    try:
        # Fetch all documents from the 'complaints' collection
        response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID

        )
        complaints_data = response['documents']
        return render_template("complaints.html", complaints=complaints_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/complaints-tracking')
def complaintsTracking():
  
    return render_template(
        "complaints-tracking.html"
    )
@app.route('/user-registration')
def userRegistration():
    
    return render_template("user-registration.html")
    
@app.route('/maps')
def map():
    
    return render_template("map.html")



if __name__ == '__main__':
    app.run(debug=True)