from flask import Flask, render_template, jsonify, request, redirect, url_for
from datetime import datetime
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.users import Users
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from datetime import datetime, timezone
# nltk.download('vader_lexicon') 
sia = SentimentIntensityAnalyzer()
app = Flask(__name__)

client = Client()
client.set_endpoint('https://cloud.appwrite.io/v1')
client.set_project('662248657f5bd3dd103c')
client.set_key('207cd5fd8dc09632737a600005a611e179f5b0ed8d8049b385f4f396c97581599ee63732daca48d79ec51029363c8225280013a93e7509061c4adeddc8dfc7cf081a521301153811fc6625d57077dbcc7b8a0e048ce8d5ab0137000cd4af98155a1779fad9bed80c9714ee3bdced5a97b5c3ea5b3349f54abf3871ff10f70e0b')

users_service = Users(client)

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

def count_complaints_by_status(complaints):
    total_complaints = len(complaints)
    resolved_complaints = sum(1 for complaint in complaints if complaint.get('status') == 'Resolved')
    pending_complaints = sum(1 for complaint in complaints if complaint.get('status') in ['In Progress', 'New', 'Assigned'])  # Assuming these statuses are "pending"
    cancelled_complaints = sum(1 for complaint in complaints if complaint.get('status') == 'Withdrawn')

    return {
        'total_complaints': total_complaints,
        'resolved_complaints': resolved_complaints,
        'pending_complaints': pending_complaints,
        'cancelled_complaints': cancelled_complaints
    }



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
def count_new_user_complaints(consumer_id):
    try:
        # Fetch all documents from the 'complaints' collection
        response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID
        )

        # Filter and count only complaints with status = 'New'
        total_new_user_complaints = sum(1 for complaint in response['documents'] if complaint.get('consumer_id') == consumer_id)
        
        return total_new_user_complaints
    except Exception as e:
        print(f"Error counting new complaints: {str(e)}")
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

        # Calculate priority and format dates
        for complaint in sorted_complaints:
            complaint['formattedCreatedAt'] = format_date(complaint.get('createdAt'))
            complaint['priority'] = calculate_priority(complaint)
        
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


# Function to calculate priority
def calculate_priority(complaint):
    # Define severity based on complaint type
    severity_map = {
        'No Power': 'High',
        'Loose Connection/Sparking of Wire': 'High',
        'Low Voltage': 'Medium',
        'Defective Meter': 'Medium',
        'No Reading': 'Low',
        'Detached Meter': 'Low'
    }

    # Severity-based prioritization
    complaint_type = complaint.get('description', 'Others')
    severity = severity_map.get(complaint_type, 'Medium')
    severity_score = {
        'High': 3,
        'Medium': 2,
        'Low': 1
    }.get(severity, 2)

    # Time-based prioritization (older complaints get higher priority)
    submitted_at = complaint.get('createdAt')
    if submitted_at:
        time_submitted = datetime.fromisoformat(submitted_at).replace(tzinfo=timezone.utc)
        hours_since_submission = (datetime.now(timezone.utc) - time_submitted).total_seconds() / 3600
        time_score = min(int(hours_since_submission / 48), 3)  # Score based on age (max score 3)
    else:
        time_score = 0

    # Location-based prioritization (higher priority for critical locations)
    critical_locations = ['hospital', 'school']
    complaint_location = complaint.get('locationName', '').lower()
    location_score = 3 if any(loc in complaint_location for loc in critical_locations) else 0
 # NLP-based severity for 'Other' complaints
    if complaint_type == 'Others':
        additional_details = complaint.get('additionalDetails', '')  # Get additional details or an empty string if not present
        sentiment_scores = sia.polarity_scores(additional_details)
        compound_score = sentiment_scores['compound']

        if compound_score >= 0.5:  # Positive sentiment (less urgent)
            severity = 'Low'
        elif compound_score <= -0.5:  # Negative sentiment (more urgent)
            severity = 'High'
        else:  # Neutral sentiment
            severity = 'Medium'

        severity_score = {
            'High': 3,
            'Medium': 2,
            'Low': 1
        }.get(severity, 2)
    # Total priority score
    total_score = severity_score + time_score + location_score
    print(severity_score, time_score, location_score)
    # Determine priority level based on the score
    if total_score >= 6:
        return 'High'
    elif total_score >= 3:
        return 'Medium'
    else:
        return 'Low'

@app.route('/calculate-priority', methods=['POST'])
def calculate_priority_endpoint():
    complaint = request.json  # Receive the complaint JSON from the request
    priority = calculate_priority(complaint)
    return jsonify({'priority': priority})  # Return the result as JSON


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

        # Filter out complaints with 'resolved' status
        filtered_complaints = [
            complaint for complaint in response['documents'] if complaint.get('status') != 'Resolved'
        ]

        # Sort complaints by 'createdAt' field in descending order
        sorted_complaints = sorted(
            filtered_complaints,
            key=lambda x: (x['createdAt'] is not None, x['createdAt']),
            reverse=True
        )

        # Calculate priority and format dates
        for complaint in sorted_complaints:
            complaint['formattedCreatedAt'] = format_date(complaint.get('createdAt'))
            complaint['formattedAssignedAt'] = format_date(complaint.get('assignedAt'))
            complaint['priority'] = calculate_priority(complaint)

        users = user_response['documents']
        total_complaints = count_complaints()
        total_new_complaints = count_new_complaints()
        total_assigned_complaints = count_assigned_complaints()
        total_resolved_complaints = count_resolved_complaints()

        return render_template("complaints.html", complaints=sorted_complaints, total_complaints=total_complaints, users=users, count_new_complaints=total_new_complaints,
                               count_assigned_complaints=total_assigned_complaints, count_resolved_complaints=total_resolved_complaints)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def format_date(iso_date):
    if iso_date:
        try:
            # Try parsing with milliseconds and 'Z' (UTC timezone)
            dt = datetime.strptime(iso_date, '%Y-%m-%dT%H:%M:%S.%fZ')
        except ValueError:
            try:
                # Try parsing with timezone offset (e.g., +00:00)
                dt = datetime.strptime(iso_date, '%Y-%m-%dT%H:%M:%S.%f%z')
            except ValueError:
                try:
                    # Handle cases without milliseconds (e.g., '2024-09-06T05:10:29+00:00')
                    dt = datetime.strptime(iso_date, '%Y-%m-%dT%H:%M:%S%z')
                except ValueError:
                    # Final fallback, if there's no timezone or milliseconds
                    dt = datetime.strptime(iso_date, '%Y-%m-%dT%H:%M:%S')
        
        return dt.strftime('%d/%m/%Y %I:%M %p')  # Formats as "DD/MM/YYYY HH:MM AM/PM"
    return None  # Return None if date is missing


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
                'assignedAt': assigned_at,
                'crew_id': assigned_crew
            }
        )
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error updating status: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500        


@app.route('/crews/add', methods=['POST'])
def add_crew_member():
    data = request.get_json()
    
    email = data.get('email')
    password = data.get('password')
    team = data.get('team')

    # Validate the data
    if not email or not password or not team:
        return jsonify({"error": "Email, password, and team are required."}), 400

    try:
        # Create user in Appwrite
        user = users_service.create(
            user_id='unique()',  # Let Appwrite generate a unique ID
            email=email,
            password=password
        )


        new_crew = database.create_document(
            database_id=DATABASE_ID,
            collection_id=CREW_COLLECTION_ID,
            document_id='unique()',
            data={
                'accountId': user['$id'],
                'email': email,
                'name_team': team,
                'password': password
            }
        )

        return jsonify({"success": "Crew member added successfully."}), 200
    except Exception as e:
        print(f"Error creating crew member: {e}")
        return jsonify({"error": "Error creating crew member."}), 500
        

@app.route('/crews/update', methods=['POST'])
def update_crew_member():
    data = request.get_json()
    doc_id = data.get('doc_id')
    user_id = data.get('user_id')
    email = data.get('email')
    resolution_team = data.get('resolution_team')

    if not doc_id or not user_id:
        return jsonify({"error": "Document ID and User ID are required."}), 400

    try:
        # Log for debugging purposes
        print(f"Updating document with doc_id: {doc_id}, user_id: {user_id}")

        # Check if the document exists before updating
        document = database.get_document(DATABASE_ID, CREW_COLLECTION_ID, doc_id)
        if document is None:
            return jsonify({"error": "Document not found."}), 404

        # Prepare the data for updating
        update_data = {}
        
        # Update email only if it's changed
        if email and email != document.get('email'):
            update_data['email'] = email
            users_service.update_email(user_id=user_id, email=email)

        # Update the team name only if it's changed
        if resolution_team and resolution_team != document.get('name_team'):
            update_data['name_team'] = resolution_team

        # Perform the update only if there's data to update
        if update_data:
            database.update_document(
                database_id=DATABASE_ID,
                collection_id=CREW_COLLECTION_ID,
                document_id=doc_id,
                data=update_data
            )

        return jsonify({"success": "Crew member updated successfully."}), 200

    except Exception as e:
        print(f"Error updating crew member: {e}")
        return jsonify({"error": "Error updating crew member."}), 500
    
@app.route('/consumer/update', methods=['POST'])
def update_consumer():
    data = request.get_json()
    doc_id = data.get('doc_id')
    user_id = data.get('user_id')
    email = data.get('email')
    name = data.get('name')
    account_number = data.get('account_number')
    municipality = data.get('municipality')
    barangay = data.get('barangay')
    street = data.get('street')
    if not doc_id or not user_id:
        return jsonify({"error": "Document ID and User ID are required."}), 400

    try:
        # Log for debugging purposes
        print(f"Updating document with doc_id: {doc_id}, user_id: {user_id}")

        # Check if the document exists before updating
        document = database.get_document(DATABASE_ID, USER_COLLECTION_ID, doc_id)
        if document is None:
            return jsonify({"error": "Document not found."}), 404

        # Prepare the data for updating
        update_data = {}
        
        # Update email only if it's changed
        if email and email != document.get('email'):
            update_data['email'] = email
            users_service.update_email(user_id=user_id, email=email)




        if name and name != document.get('name'):
            update_data['name'] = name
        
        if account_number and account_number != document.get('account_number'):
            update_data['account_number'] = account_number

        if municipality and municipality != document.get('municipality'):
            update_data['city'] = municipality

        if barangay and barangay != document.get('barangay'):
            update_data['barangay'] = barangay

        if street and street != document.get('street'):
            update_data['street'] = street

        # Perform the update only if there's data to update
        if update_data:
            database.update_document(
                database_id=DATABASE_ID,
                collection_id=USER_COLLECTION_ID,
                document_id=doc_id,
                data=update_data
            )

        return jsonify({"success": "consumer updated successfully."}), 200

    except Exception as e:
        print(f"Error updating consumer: {e}")
        return jsonify({"error": "Error updating consumer."}), 500



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
        response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=LOG_COLLECTION_ID
        )

        sorted_logs = sorted(response['documents'], key=lambda x: x['time_stamp'], reverse=True)
        
        users_list = result['documents']
        
        if municipality:
            users_list = [user for user in users_list if user.get('city') == municipality]
    except Exception as e:
        print(f"Error fetching users: {e}")
        users_list = []

    return render_template("user-management.html", users=users_list, municipality=municipality, logs = sorted_logs)

@app.route('/crews')
def crews():
  
    try:
        result = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=CREW_COLLECTION_ID
        )

     
        
        users_list = result['documents']
   
    except Exception as e:
        print(f"Error fetching users: {e}")
        users_list = []

    return render_template("crews.html", users=users_list)
@app.route('/user-history/<user_id>')
def consumerHistory(user_id):
    try:
        # Fetch all documents from the 'complaints' collection
        response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID
        )

        # Filter complaints based on consumer_id
        filtered_complaints = [
            complaint for complaint in response['documents']
            if complaint.get('consumer_id') == user_id
        ]

        # Sort complaints by 'createdAt' field in descending order
        sorted_complaints = sorted(
            filtered_complaints,
            key=lambda x: (x['createdAt'] is not None, x['createdAt']),
            reverse=True
        )

        # Format date and calculate priority
        for complaint in sorted_complaints:
            complaint['formattedCreatedAt'] = format_date(complaint.get('createdAt'))
            complaint['formattedAssignedAt'] = format_date(complaint.get('assignedAt'))
            complaint['formattedResolvedAt'] = format_date(complaint.get('resolvedAt'))
            complaint['priority'] = calculate_priority(complaint)

        # Count complaints by status
        complaint_counts = count_complaints_by_status(filtered_complaints)

        # Fetch user information
        user_response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=CREW_COLLECTION_ID
        )
        users = user_response['documents']

        return render_template(
            "consumer-history.html",
            complaints=sorted_complaints,
            users=users,
            total_complaints=complaint_counts['total_complaints'],
            resolved_complaints=complaint_counts['resolved_complaints'],
            pending_complaints=complaint_counts['pending_complaints'],
            cancelled_complaints=complaint_counts['cancelled_complaints']
        )
    except Exception as e:
        print(f"Error: {e}")  # Print the error for debugging
        return jsonify({'error': str(e)}), 500

    
@app.route('/crew-history/<user_id>')
def crewHistory(user_id):
    try:
        # Fetch all documents from the 'complaints' collection
        response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID
        )

        # Fetch crew information
        user_response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=CREW_COLLECTION_ID
        )

        # Filter complaints based on crew_id
        filtered_complaints = [
            complaint for complaint in response['documents']
            if complaint.get('crew_id') == user_id
        ]

        # Sort complaints by 'createdAt' field in descending order
        sorted_complaints = sorted(
            filtered_complaints,
            key=lambda x: (x['createdAt'] is not None, x['createdAt']),
            reverse=True
        )

        # Format date and calculate priority
        for complaint in sorted_complaints:
            complaint['formattedCreatedAt'] = format_date(complaint.get('createdAt'))
            complaint['formattedAssignedAt'] = format_date(complaint.get('assignedAt'))
            complaint['formattedResolvedAt'] = format_date(complaint.get('resolvedAt'))
            complaint['priority'] = calculate_priority(complaint)

        # Count complaints by status for the crew member
        complaint_counts = count_complaints_by_status(filtered_complaints)

        # Get the crew members
        users = user_response['documents']

        return render_template(
            "crew_history.html",
            complaints=sorted_complaints,
            total_complaints=complaint_counts['total_complaints'],
            resolved_complaints=complaint_counts['resolved_complaints'],
            pending_complaints=complaint_counts['pending_complaints'],
            cancelled_complaints=complaint_counts['cancelled_complaints'],
            users=users
        )
    except Exception as e:
        print(f"Error: {e}")  # Print the error for debugging
        return jsonify({'error': str(e)}), 500


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
            ticket['formattedCreatedAt'] = format_date(ticket.get('createdAt'))
            ticket['formattedAssignedAt'] = format_date(ticket.get('assignedAt'))
            ticket['formattedResolvedAt'] = format_date(ticket.get('resolvedAt'))
            ticket['priority'] = calculate_priority(ticket)



        return render_template("ticket_history.html", tickets=relevant_tickets)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/maps')
def map():
    
    return render_template("map.html")

@app.route('/log', methods=['POST'])
def insert_to_log():
    data = request.get_json()
    assigned_at = datetime.now().isoformat()
    user = data.get('user')
    action = data.get('action')
    crew_id = data.get('crew_id')  # Ensure field matches

    try:
        # Ensure 'crew_id', 'user', 'action' match your schema in Appwrite
        new_log = database.create_document(
            database_id=DATABASE_ID,
            collection_id=LOG_COLLECTION_ID,
            document_id='unique()',
            data={
                'consumer_id': crew_id,  # Ensure correct field names
                'consumer_name': user,
                'time_stamp': assigned_at,
                'Action': action  # Ensure 'Action' matches field in your database
            }
        )

        return jsonify({"success": "Log added successfully."}), 200
    except Exception as e:
        print(f"Error creating Log: {e}")
        return jsonify({"error": "Error creating Log."}), 500






if __name__ == '__main__':
    app.run(debug=True)