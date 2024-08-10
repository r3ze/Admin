from flask import Flask, render_template, jsonify, request, redirect, url_for
from datetime import datetime
from appwrite.client import Client
from appwrite.services.databases import Databases

app = Flask(__name__)

client = Client()
client.set_endpoint('https://cloud.appwrite.io/v1')
client.set_project('662248657f5bd3dd103c')
client.set_key('207cd5fd8dc09632737a600005a611e179f5b0ed8d8049b385f4f396c97581599ee63732daca48d79ec51029363c8225280013a93e7509061c4adeddc8dfc7cf081a521301153811fc6625d57077dbcc7b8a0e048ce8d5ab0137000cd4af98155a1779fad9bed80c9714ee3bdced5a97b5c3ea5b3349f54abf3871ff10f70e0b')


database = Databases(client)

DATABASE_ID = '66224a152d9f9a67af78' 
COLLECTION_ID = '6626029b134a98006f77'  
USER_COLLECTION_ID = '662601d0b9e605665bb4'
LOG_COLLECTION_ID = '6657285700348815c3aa'
CREW_COLLECTION_ID = '66224a326e2395bfb265'
CREW_TASK_COLLECTION_ID = '666e7ae0000bcb6167a4'
#add registration

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username == 'admin' and password == 'admin':
            return redirect(url_for('dashboard'))
        else:
            return "Invalid credentials. Please try again."
    return render_template('login.html')


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
        # Assuming 'created_at' is a field in the document and sorting by it in descending order
        sorted_complaints = sorted(response['documents'], key=lambda x: x['createdAt'], reverse=True)
        
        total_users = count_users()
        total_complaints = count_complaints()
        
        complaints_data = sorted_complaints[:7]  # Limiting to the first 7 complaints after sorting
        
        return render_template("index.html", complaints=complaints_data, total_users=total_users, total_complaints=total_complaints)
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

        # Dictionary to map city and barangay to their coordinates
        location_coordinates = {
            #Pagsanjan
            ('Pagsanjan', 'San Isidro'): (14.2811, 121.4575),
            ('Pagsanjan', 'Maulawin'): (14.2669, 121.4528),
            ('Pagsanjan', 'Barangay I'): (14.2775, 121.4549),
            ('Pagsanjan', 'Barangay II'): (14.2754, 121.4520),
            ('Pagsanjan', 'Biñan'): (14.2679, 121.4370),
            ('Pagsanjan', 'Buboy'): (14.2347, 121.4270),
            ('Pagsanjan', 'Cabanbanan'): (14.2431, 121.4313),
            ('Pagsanjan', 'Calusiche'): (14.2527, 121.4442),
            ('Pagsanjan', 'Dingin'): (14.2397, 121.4542),

            #Lumban
            ('Lumban', 'Bagong Silang'): (14.2928, 121.4627),
            ('Lumban', 'Balubad'): (14.2835, 121.4713),

            #Cavinti
            ('Cavinti', 'Anglas'): (14.2835, 121.4713),
            #Paete
             ('Paete', 'Maytoong'): (14.3632, 121.4824),
             #Pakil
              ('Pakil', 'Dorado'): (14.3895, 121.3799),

        }

        processed_complaints = []
        for complaint in complaints_data:
            # Retrieve coordinates based on city and barangay
            coordinates = location_coordinates.get((complaint['city'], complaint['barangay']))
            latitude, longitude = coordinates if coordinates else (None, None)

            complaint_dict = {
                'complaint_description': complaint['description'],
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

        user_response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=CREW_COLLECTION_ID
        )
        # Assuming 'created_at' is a field in the document and sorting by it in descending order
        sorted_complaints = sorted(response['documents'], key=lambda x: x['createdAt'], reverse=True)
        users = user_response['documents']
        total_complaints = count_complaints()
        
        return render_template("complaints.html", complaints=sorted_complaints, total_complaints=total_complaints, users=users)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/update-status', methods=['POST'])
def update_status():
    data = request.get_json()
    complaint_id = data.get('complaintId')
    new_status = data.get('status')

    try:
        database.update_document(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID,
            document_id=complaint_id,
            data={
                'status': new_status
            }
        )
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error updating status: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/update-crew', methods=['POST'])
def update_crew():
    data = request.get_json()
    complaint_id = data.get('complaintId')
    assigned_crew = data.get('assigned_crew')
    crew_name = data.get('crew_name')
    try:
        assigned_at = datetime.now().isoformat()
        database.update_document(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID,
            document_id=complaint_id,
            data={
                'crews': assigned_crew,
                'crew_name': crew_name,
                'assignedAt': assigned_at
                
            }
        )
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error updating status: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500        



@app.route('/log-history')
def log_history():
    try:
        response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=LOG_COLLECTION_ID
        )
        sorted_logs = sorted(response['documents'], key=lambda x: x['time_stamp'], reverse=True)
        
        return render_template("log-history.html", logs=sorted_logs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/user-management')
def user_management():
    municipality = request.args.get('municipality')
    try:
        result = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=USER_COLLECTION_ID
        )
        users_list = result['documents']

        if municipality:
            users_list = [user for user in users_list if user.get('city') == municipality]
    except Exception as e:
        print(f"Error fetching users: {e}")
        users_list = []

    return render_template("user-management.html", users=users_list, municipality=municipality)

@app.route('/ticket-history')
def ticket_history():
    try:
        response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID
        )

        # Filter complaints to include only those with status 'Resolved' or 'Withdrawn'
        relevant_tickets = [
            doc for doc in response['documents'] 
            if doc['status'] in ['Withdrawn', 'Resolved']
        ]
    
        return render_template("ticket_history.html", tickets=relevant_tickets)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/maps')
def map():
    
    return render_template("map.html")



if __name__ == '__main__':
    app.run(debug=True)