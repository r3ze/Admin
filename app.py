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
    
# Count new complaints
def count_new_complaints():
    try:
        # Fetch all documents from the 'complaints' collection
        response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID
        )

        # Filter and count only complaints with status = 'New'
        total_new_complaints = sum(1 for complaint in response['documents'] if complaint.get('status') == 'New')
        
        return total_new_complaints
    except Exception as e:
        print(f"Error counting new complaints: {str(e)}")
        return 0  # Return 0 if there's an error
    
# Count new complaints
def count_assigned_complaints():
    try:
        # Fetch all documents from the 'complaints' collection
        response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID
        )

        # Filter and count only complaints with status = 'New'
        total_assigned_complaints = sum(1 for complaint in response['documents'] if complaint.get('status') == 'Assigned')
        
        return total_assigned_complaints
    except Exception as e:
        print(f"Error counting new complaints: {str(e)}")
        return 0  # Return 0 if there's an error



# Count new complaints
def count_resolved_complaints():
    try:
        # Fetch all documents from the 'complaints' collection
        response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID
        )

        # Filter and count only complaints with status = 'New'
        total_resolved_complaints = sum(1 for complaint in response['documents'] if complaint.get('status') == 'Resolved')
        
        return total_resolved_complaints
    except Exception as e:
        print(f"Error counting new complaints: {str(e)}")
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
        total_new_complaints = count_new_complaints()
        total_assigned_complaints = count_assigned_complaints()
        total_resolved_complaints = count_resolved_complaints()
        complaints_data = sorted_complaints[:7]  # Limiting to the first 7 complaints after sorting
        
        return render_template("index.html", complaints=complaints_data, total_users=total_users, total_complaints=total_complaints, count_new_complaints = total_new_complaints,
                               count_assigned_complaints = total_assigned_complaints, count_resolved_complaints = total_resolved_complaints)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/complaints_data')
def get_complaints_data():
    try:
        response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID
        )
        complaints_data = response['documents']

        processed_complaints = []
        for complaint in complaints_data:
            # Assuming 'location' is a string like "14.2811, 121.4575"
            if 'Location' in complaint and complaint['Location']:
                try:
                    # Split the location string and convert to float
                    latitude, longitude = [float(coord) for coord in complaint['Location'].split(',')]
                except ValueError:
                    latitude, longitude = None, None
            else:
                latitude, longitude = None, None

            complaint_dict = {
                'complaint_description': complaint['description'],
                'city': complaint['city'],
                'barangay': complaint['barangay'],
                'date_reported': complaint['createdAt'],
                'latitude': latitude,
                'longitude': longitude,
                'status': complaint['status']
            }
            processed_complaints.append(complaint_dict)

        return jsonify(processed_complaints)

    except Exception as e:
        print(f"Error: {e}")
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

        # Parse the createdAt field into datetime objects
        for complaint in response['documents']:
            # Check if 'createdAt' and 'assignedAt' are not None before replacing
            if complaint.get('createdAt'):
                complaint['createdAt_dt'] = datetime.fromisoformat(complaint['createdAt'].replace('Z', '+00:00'))
            else:
                complaint['createdAt_dt'] = None

            if complaint.get('assignedAt'):
                complaint['assignedAt_dt'] = datetime.fromisoformat(complaint['assignedAt'].replace('Z', '+00:00'))
            else:
                complaint['assignedAt_dt'] = None


        # Filter out complaints with 'resolved' status
        filtered_complaints = [
            complaint for complaint in response['documents'] if complaint.get('status') != 'Resolved'
        ]


           # Sort using the datetime objects, handle None values if necessary
        sorted_complaints = sorted(
             filtered_complaints,
            key=lambda x: (x['createdAt_dt'] is not None, x['createdAt_dt']),
            reverse=True
        )

        users = user_response['documents']
        total_complaints = count_complaints()
        total_new_complaints = count_new_complaints()
        total_assigned_complaints = count_assigned_complaints()
        total_resolved_complaints = count_resolved_complaints()
        
        return render_template("complaints.html", complaints=sorted_complaints, total_complaints=total_complaints, users=users, count_new_complaints = total_new_complaints,
                               count_assigned_complaints = total_assigned_complaints, count_resolved_complaints = total_resolved_complaints)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        user_response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=CREW_COLLECTION_ID
        )
        users = user_response['documents']
        return jsonify(users)
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

        # Parse the createdAt, assignedAt, and resolvedAt fields into datetime objects
        for ticket in relevant_tickets:
            # Check if 'createdAt' is not None before replacing
            if ticket.get('createdAt'):
                ticket['createdAt_dt'] = datetime.fromisoformat(ticket['createdAt'].replace('Z', '+00:00'))
            else:
                ticket['createdAt_dt'] = None

            # Check if 'assignedAt' is not None before replacing
            if ticket.get('assignedAt'):
                ticket['assignedAt_dt'] = datetime.fromisoformat(ticket['assignedAt'].replace('Z', '+00:00'))
            else:
                ticket['assignedAt_dt'] = None

            # Check if 'resolvedAt' is not None before replacing
            if ticket.get('resolvedAt'):
                ticket['resolvedAt_dt'] = datetime.fromisoformat(ticket['resolvedAt'].replace('Z', '+00:00'))
            else:
                ticket['resolvedAt_dt'] = None

        # Sort using the datetime objects, handle None values if necessary
        sorted_tickets = sorted(
            relevant_tickets,
            key=lambda x: (x['createdAt_dt'] is not None, x['createdAt_dt']),
            reverse=True
        )
        
        # Format the datetime for display after sorting
        for ticket in sorted_tickets:
            if ticket['createdAt_dt']:
                ticket['createdAt'] = ticket['createdAt_dt'].strftime('%Y/%m/%d %H:%M')
            if ticket['assignedAt_dt']:
                ticket['assignedAt'] = ticket['assignedAt_dt'].strftime('%Y/%m/%d %H:%M')
            if ticket['resolvedAt_dt']:
                ticket['resolvedAt'] = ticket['resolvedAt_dt'].strftime('%Y/%m/%d %H:%M')

        return render_template("ticket_history.html", tickets=sorted_tickets)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/maps')
def map():
    
    return render_template("map.html")



if __name__ == '__main__':
    app.run(debug=True)