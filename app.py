from flask import Flask, render_template, jsonify, request, redirect, url_for
from datetime import datetime
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.users import Users
from appwrite.query import Query
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
        username = request.form['email']
        password = request.form['password']
        if username == 'admin@gmail.com' and password == 'admin':
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


@app.route('/get_common_complaints', methods=['GET'])
def get_common_complaints():
    try:
        # Fetch all complaints using pagination
        all_complaints = fetch_all_documents(DATABASE_ID, COLLECTION_ID)

        # Group complaints by type and count them
        complaint_counts = {}
        for complaint in all_complaints:
            complaint_type = complaint.get('description', 'Unknown')
            if complaint_type in complaint_counts:
                complaint_counts[complaint_type] += 1
            else:
                complaint_counts[complaint_type] = 1

        # Return the counts as JSON
        return jsonify(complaint_counts)

    except Exception as e:
        print(f"Error fetching common complaints: {str(e)}")
        return jsonify({}), 500  # Return an empty response with error status


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
    


def count_new_complaints():
    try:
        # Fetch all complaints using pagination
        all_complaints = fetch_all_documents(DATABASE_ID, COLLECTION_ID)

        # Filter and count complaints with status = 'New'
        total_new_complaints = sum(1 for complaint in all_complaints if complaint.get('status') == 'New')
        
        return total_new_complaints

    except Exception as e:
        print(f"Error counting new complaints: {str(e)}")
        return 0  # Return 0 in case of an error
    

    

def count_assigned_complaints():
    try:
        # Fetch all complaints using pagination
        all_complaints = fetch_all_documents(DATABASE_ID, COLLECTION_ID)

        # Filter and count complaints with status = 'Assigned'
        total_assigned_complaints = sum(1 for complaint in all_complaints if complaint.get('status') == 'Assigned')
        
        return total_assigned_complaints

    except Exception as e:
        print(f"Error counting assigned complaints: {str(e)}")
        return 0  # Return 0 in case of an error



def count_resolved_complaints():
    try:
        # Fetch all complaints using pagination
        all_complaints = fetch_all_documents(DATABASE_ID, COLLECTION_ID)

        # Filter and count complaints with status = 'Resolved'
        total_resolved_complaints = sum(1 for complaint in all_complaints if complaint.get('status') == 'Resolved')
        
        return total_resolved_complaints

    except Exception as e:
        print(f"Error counting resolved complaints: {str(e)}")
        return 0  # Return 0 in case of an error

def count_inprogress_complaints():
    try:
        # Fetch all complaints using pagination
        all_complaints = fetch_all_documents(DATABASE_ID, COLLECTION_ID)

        # Filter and count complaints with status = 'In Progress'
        total_inprogress_complaints = sum(1 for complaint in all_complaints if complaint.get('status') == 'In Progress')
        
        return total_inprogress_complaints

    except Exception as e:
        print(f"Error counting in-progress complaints: {str(e)}")
        return 0  # Return 0 in case of an error


@app.route('/')
def dashboard():
    try:
        # Fetch all complaints using pagination
        all_complaints = fetch_all_documents(DATABASE_ID, COLLECTION_ID)

        # Sort complaints by 'createdAt' field in descending order
        sorted_complaints = sorted(all_complaints, key=lambda x: x['createdAt'], reverse=True)

        total_users = count_users()
        total_complaints = count_complaints()
        total_new_complaints = count_new_complaints()
        total_assigned_complaints = count_assigned_complaints()
        total_resolved_complaints = count_resolved_complaints()
        total_inprogress_complaints = count_inprogress_complaints()

        # Limiting to the first 7 complaints after sorting
        complaints_data = sorted_complaints[:7]

        # Calculate priority and format dates for each complaint
        for complaint in sorted_complaints:
            complaint['formattedCreatedAt'] = format_date(complaint.get('createdAt'))
            complaint['priority'] = calculate_priority(complaint)

        return render_template(
            "index.html", 
            complaints=complaints_data, 
            total_users=total_users, 
            total_complaints=total_complaints, 
            count_new_complaints=total_new_complaints,
            count_assigned_complaints=total_assigned_complaints, 
            count_resolved_complaints=total_resolved_complaints, 
            count_inprogress_complaints=total_inprogress_complaints
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/complaints_data')
def get_complaints_data():
    try:
        # Fetch all complaints using pagination
        all_complaints = fetch_all_documents(DATABASE_ID, COLLECTION_ID)

        processed_complaints = []
        for complaint in all_complaints:
            # Assuming 'Location' is a string like "14.2811, 121.4575"
            if 'Location' in complaint and complaint['Location']:
                try:
                    # Split the location string and convert to float
                    latitude, longitude = [float(coord) for coord in complaint['Location'].split(',')]
                except ValueError:
                    latitude, longitude = None, None
            else:
                latitude, longitude = None, None

            complaint_dict = {
                'consumer_name': complaint['consumer_name'],
                'complaint_description': complaint['description'],
                'additionalDetails': complaint['additionalDetails'],
                'city': complaint['city'],
                'barangay': complaint['barangay'],
                'location': complaint['locationName'],
                'resolutionStartDate': complaint.get('resolutionStartDate'),
                'resolutionEndDate': complaint.get('resolutionEndDate'),
                'date_reported': complaint['createdAt'],
                'latitude': latitude,
                'longitude': longitude,
                'status': complaint['status'],
                'followedUpAt': complaint.get('followedUpAt')
            }
            processed_complaints.append(complaint_dict)

        return jsonify(processed_complaints)

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


# Function to calculate priority
def calculate_priority(complaint):
    # Check if the complaint has been followed up
    followed_up_at = complaint.get('followedUpAt')
    if followed_up_at:
        # Automatically set high priority if a follow-up has been made
        print("Complaint has been followed up. Setting priority to 'High'.")
        return 'High'

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

    # Time-based prioritization using resolution dates
    resolution_start = complaint.get('resolutionStartDate')
    resolution_end = complaint.get('resolutionEndDate')
    
    if resolution_start and resolution_end:
        # Convert string dates to datetime objects
        start_time = datetime.fromisoformat(resolution_start).replace(tzinfo=timezone.utc)
        end_time = datetime.fromisoformat(resolution_end).replace(tzinfo=timezone.utc)
        time_left = (end_time - datetime.now(timezone.utc)).total_seconds() / 3600  # Time left in hours
        
        if time_left <= 0:
            time_score = 3  # Deadline has passed or is very near, set highest priority
        else:
            time_score = max(3 - int(time_left / 48), 0)  # Score based on how close to the deadline (max score 3)
    else:
        time_score = 0

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

    # Check if complaint is older than 2 days and not assigned
    created_at = complaint.get('createdAt')
    status = complaint.get('status', '').lower()

    if created_at and status != 'assigned':
        created_time = datetime.fromisoformat(created_at).replace(tzinfo=timezone.utc)
        hours_since_creation = (datetime.now(timezone.utc) - created_time).total_seconds() / 3600
        
        if hours_since_creation > 48:  # More than 2 days (48 hours)
            print("Complaint older than 2 days and not assigned. Setting priority to 'High'.")
            return 'High'

    # Total priority score
    total_score = severity_score + time_score
    print(severity_score, time_score)

    # Determine priority level based on the score
    if total_score >= 5:
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

# Helper function to format dates and handle timezone
def format_date_range(start_date_str, end_date_str):
    try:
        # Strip out the time and timezone part using the first 10 characters (YYYY-MM-DD)
        start_date = datetime.strptime(start_date_str[:10], '%Y-%m-%d')
        end_date = datetime.strptime(end_date_str[:10], '%Y-%m-%d')

        # Check if the month is the same
        if start_date.month == end_date.month:
            return f"{start_date.strftime('%B')} {start_date.day} - {end_date.day}"
        else:
            return f"{start_date.strftime('%B')} {start_date.day} - {end_date.strftime('%B')} {end_date.day}"
    except Exception as e:
        print(f"Error formatting date range: {e}")
        return None
def fetch_all_complaints_documents(database_id, collection_id):
    all_documents = []
    last_document_id = None
    
    while True:
        if last_document_id:
            # Use cursor for pagination
            response = database.list_documents(
                database_id=database_id,
                collection_id=collection_id,
                queries=[
                    Query.cursor_after(last_document_id)
                ]
            )
        else:
            # First query without cursor
            response = database.list_documents(
                database_id=database_id,
                collection_id=collection_id
            )
        
        # Add the fetched documents to the list
        all_documents.extend(response['documents'])

        # If fewer documents than the default limit (25) are fetched, stop the loop
        if len(response['documents']) < 25:
            break

        # Update the last document ID for the next batch
        last_document_id = response['documents'][-1]['$id']

    return all_documents


@app.route('/complaints')
def complaints():
    try:
        # Fetch all complaints and crew documents using pagination
        all_complaints = fetch_all_complaints_documents(DATABASE_ID, COLLECTION_ID)
        all_users = fetch_all_complaints_documents(DATABASE_ID, CREW_COLLECTION_ID)

        # Filter out complaints with 'Resolved', 'Withdrawn', or 'Invalidated' status
        filtered_complaints = [
            complaint for complaint in all_complaints 
            if complaint.get('status') not in ['Resolved', 'Withdrawn', 'Invalidated']
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
            complaint['formattedFollowedUpAt'] = format_date(complaint.get('followedUpAt'))
            complaint['priority'] = calculate_priority(complaint)

            # Format resolution date range
            start_date = complaint.get('resolutionStartDate')
            end_date = complaint.get('resolutionEndDate')
            complaint['formattedResolutionDate'] = format_date_range(start_date, end_date)

        # Fetch user details and complaint counts
        users = all_users
        total_complaints = count_complaints()
        total_new_complaints = count_new_complaints()
        total_assigned_complaints = count_assigned_complaints()
        total_resolved_complaints = count_resolved_complaints()
        total_inprogress_complaints = count_inprogress_complaints()

        return render_template("complaints.html", 
                               complaints=sorted_complaints, 
                               total_complaints=total_complaints, 
                               users=users, 
                               count_new_complaints=total_new_complaints,
                               count_assigned_complaints=total_assigned_complaints, 
                               count_resolved_complaints=total_resolved_complaints, 
                               count_inprogress_complaints=total_inprogress_complaints)
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

@app.route('/api/crew-members', methods=['GET'])
def get_crew_members():
    team_id = request.args.get('teamId')

    if not team_id:
        return jsonify({'success': False, 'error': 'Team ID is required'}), 400

    try:
        # Log the received team_id for debugging
        print(f"Fetching crew members for team ID: {team_id}")
        
        # Fetch the crew members for the selected team
        team_document = database.get_document(
            database_id=DATABASE_ID,
            collection_id=CREW_COLLECTION_ID,
            document_id=team_id
        )
        
        # Check if the team_document exists
        if not team_document:
            return jsonify({'success': False, 'error': 'Team not found'}), 404

        crew_members = team_document.get('crew_members', [])
        response_data = [{'name': member} for member in crew_members]

        return jsonify({'success': True, 'crewMembers': response_data}), 200

    except Exception as e:
        # Log the error for debugging
        print(f"Error fetching crew members: {e}")
        return jsonify({'success': False, 'error': 'Internal Server Error'}), 500
    

@app.route('/update-priority', methods=['POST'])
def update_priority():
    data = request.get_json()
    complaint_id = data.get('complaintId')
    priority = data.get('priority')
    try:
        database.update_document(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID,
            document_id=complaint_id,
            data={
                'priority':priority
            }
        )
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error updating status: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500    

    
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
                'status': new_status,

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
    resolutionStartDate = data.get('resolutionStartDate')
    resolutionEndDate = data.get('resolutionEndDate')
    priority = data.get('priority')
    resolution_members = data.get('resolution_members')  # Get the selected crew members

    try:
        assigned_at = datetime.now().isoformat()
        # Update the document with the new data, including resolution members
        database.update_document(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID,
            document_id=complaint_id,
            data={
                'crews': assigned_crew,
                'crew_name': crew_name,
                'assignedAt': assigned_at,
                'crew_id': assigned_crew,
                'resolutionStartDate': resolutionStartDate,
                'resolutionEndDate': resolutionEndDate,
                'priority': priority,
                'resolution_members': resolution_members  # Store selected crew members
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
    crew_members = data.get('crew_members', [])  # Get the crew members array

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

        # Create a new document in the crew collection, including the crew members array
        new_crew = database.create_document(
            database_id=DATABASE_ID,
            collection_id=CREW_COLLECTION_ID,
            document_id='unique()',
            data={
                'accountId': user['$id'],
                'email': email,
                'name_team': team,
                'password': password,
                'crew_members': crew_members  # Store the crew members in the document
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
    crew_members = data.get('crew_members')  # Retrieve the updated crew members

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

        # Update crew members
        if crew_members:
            update_data['crew_members'] = crew_members

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
        return jsonify({"error": f"Error updating crew member: {str(e)}"}), 500
    
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


@app.route('/cancel-complaint', methods=['POST'])
def cancel_complaint():
    data = request.get_json()
    complaint_id = data.get('complaintId')
    cancellation_reason = data.get('cancellation_reason')
    cancelled_at = datetime.now().isoformat()
    try:
        database.update_document(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID,
            document_id=complaint_id,
            data={
                'cancellation_reason': cancellation_reason,
                'status': 'Invalidated',  # Optionally update status as well
                'canceledAt': cancelled_at
            }
        )
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error updating status: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500    


def fetch_all_log_documents(database_id, collection_id):
    all_documents = []
    last_document_id = None
    
    while True:
        # Build the query parameters dynamically
        if last_document_id:
            # Use cursor for pagination
            response = database.list_documents(
                database_id=database_id,
                collection_id=collection_id,
                queries=[
                    Query.cursor_after(last_document_id)
                ]
            )
        else:
            # First query without cursor
            response = database.list_documents(
                database_id=database_id,
                collection_id=collection_id
            )
        
        # Add the fetched documents to the list
        all_documents.extend(response['documents'])

        # If the number of documents fetched is less than the default limit, we've fetched everything
        if len(response['documents']) < 25:  # Assuming the default batch size is 25
            break

        # Update the last document ID for the next batch
        last_document_id = response['documents'][-1]['$id']

    return all_documents


@app.route('/log-history')
def log_history():
    try:
        # Fetch all documents in the collection
        all_logs = fetch_all_log_documents(DATABASE_ID, LOG_COLLECTION_ID)
        
        # Sort the logs by 'time_stamp'
        sorted_logs = sorted(all_logs, key=lambda x: x['time_stamp'], reverse=True)
        
        return render_template("log-history.html", logs=sorted_logs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/filter-logs')
def filter_logs():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    try:
        # Fetch all log documents
        response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=LOG_COLLECTION_ID
        )

        # If no start or end date, return all logs
        if not start_date or not end_date:
            return jsonify(response['documents'])

        # Parse the date strings into date objects
        start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()

        # Filter logs by date range
        relevant_logs = []
        for log in response['documents']:
            time_stamp = log.get('time_stamp')
            if time_stamp:
                try:
                    # First try parsing with timezone-aware format
                    log_date = datetime.strptime(time_stamp, '%Y-%m-%dT%H:%M:%S.%f%z').date()
                except ValueError:
                    # Fallback to timezone-naive format
                    log_date = datetime.strptime(time_stamp, '%Y-%m-%dT%H:%M:%S.%fZ').date()

                # Check if the log date falls within the specified range
                if start_date_obj <= log_date <= end_date_obj:
                    relevant_logs.append(log)

        # Return the filtered logs
        return jsonify(relevant_logs)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    


def fetch_all_documents(database_id, collection_id):
    all_documents = []
    last_document_id = None
    
    while True:
        if last_document_id:
            response = database.list_documents(
                database_id=database_id,
                collection_id=collection_id,
                queries=[
                    Query.cursor_after(last_document_id)
                ]
            )
        else:
            response = database.list_documents(
                database_id=database_id,
                collection_id=collection_id
            )
        
        all_documents.extend(response['documents'])
        
        if len(response['documents']) < 25:
            break
        
        last_document_id = response['documents'][-1]['$id']

    return all_documents


@app.route('/user-management')
def user_management():
    municipality = request.args.get('municipality')
    
    try:
        # Fetch all user documents with pagination
        users_list = fetch_all_documents(DATABASE_ID, USER_COLLECTION_ID)

        # Filter users based on municipality if provided
        if municipality:
            users_list = [user for user in users_list if user.get('city') == municipality]

        # Fetch all log documents with pagination
        all_logs = fetch_all_documents(DATABASE_ID, LOG_COLLECTION_ID)
        
        # Sort logs by 'time_stamp' in descending order
        sorted_logs = sorted(all_logs, key=lambda x: x['time_stamp'], reverse=True)

    except Exception as e:
        print(f"Error fetching users: {e}")
        users_list = []
        sorted_logs = []

    return render_template("user-management.html", users=users_list, municipality=municipality, logs=sorted_logs)
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
        # Fetch all complaints using pagination
        all_complaints = fetch_all_documents(DATABASE_ID, COLLECTION_ID)

        # Filter complaints based on consumer_id
        filtered_complaints = [
            complaint for complaint in all_complaints
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
            complaint['formattedWithdrawnAt'] = format_date(complaint.get('withdrawnAt'))
            complaint['formattedCanceledAt'] = format_date(complaint.get('canceledAt'))
            complaint['formattedFollowedUpAt'] = format_date(complaint.get('followedUpAt'))
            complaint['priority'] = calculate_priority(complaint)

        # Count complaints by status
        complaint_counts = count_complaints_by_status(filtered_complaints)

        # Fetch all users using pagination
        all_users = fetch_all_documents(DATABASE_ID, CREW_COLLECTION_ID)

        return render_template(
            "consumer-history.html",
            complaints=sorted_complaints,
            users=all_users,
            total_complaints=complaint_counts['total_complaints'],
            resolved_complaints=complaint_counts['resolved_complaints'],
            pending_complaints=complaint_counts['pending_complaints'],
            cancelled_complaints=complaint_counts['cancelled_complaints']
        )
    except Exception as e:
        print(f"Error: {e}")  # Log the error for debugging
        return jsonify({'error': str(e)}), 500

@app.route('/filter-consumer-history/<user_id>')
def filter_consumer_history(user_id):
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    try:
        # Fetch all consumer history records from the Appwrite database
        response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID
        )

        # Filter by crew_id (only show complaints related to this crew member)
        filtered_histories = [
            doc for doc in response['documents']
            if doc.get('consumer_id') == user_id
        ]

        # If no start or end date is provided, return all complaints for the crew member
        if not start_date or not end_date:
            return jsonify(filtered_histories)

        # Parse the date strings into date objects
        start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()

        # Filter complaints by date range
        relevant_histories = []
        for doc in filtered_histories:
            # Assuming we're using 'createdAt' as the primary date field for filtering
            date_str = doc.get('createdAt')
            if date_str:
                try:
                    doc_date = datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S.%f%z').date()
                except ValueError:
                    doc_date = datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S.%fZ').date()

                # Check if the complaint falls within the specified date range
                if start_date_obj <= doc_date <= end_date_obj:
                    relevant_histories.append(doc)

        return jsonify(relevant_histories)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/crew-history/<user_id>')
def crewHistory(user_id):
    try:
        # Fetch all complaints using pagination
        all_complaints = fetch_all_documents(DATABASE_ID, COLLECTION_ID)

        # Fetch all crew information using pagination
        all_users = fetch_all_documents(DATABASE_ID, CREW_COLLECTION_ID)

        # Filter complaints based on crew_id
        filtered_complaints = [
            complaint for complaint in all_complaints
            if complaint.get('crew_id') == user_id
        ]

        # Sort complaints by 'createdAt' field in descending order
        sorted_complaints = sorted(
            filtered_complaints,
            key=lambda x: (x['createdAt'] is not None, x['createdAt']),
            reverse=True
        )

        # Format dates and calculate priority
        for complaint in sorted_complaints:
            complaint['formattedCreatedAt'] = format_date(complaint.get('createdAt'))
            complaint['formattedAssignedAt'] = format_date(complaint.get('assignedAt'))
            complaint['formattedResolvedAt'] = format_date(complaint.get('resolvedAt'))
            complaint['formattedFollowedUpAt'] = format_date(complaint.get('followedUpAt'))
            complaint['priority'] = calculate_priority(complaint)

        # Count complaints by status for the crew member
        complaint_counts = count_complaints_by_status(filtered_complaints)

        # Get the crew members (from paginated result)
        users = all_users

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
        print(f"Error: {e}")  # Log the error for debugging
        return jsonify({'error': str(e)}), 500
@app.route('/filter-crew-history/<crew_id>')
def filter_crew_history(crew_id):
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    try:
        # Fetch all complaints from the Appwrite database
        response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID
        )

        # Filter complaints based on the crew_id
        filtered_complaints = [
            doc for doc in response['documents']
            if doc.get('crew_id') == crew_id
        ]

        # If no start or end date is provided, return all complaints for the crew member
        if not start_date or not end_date:
            return jsonify(filtered_complaints)

        # Parse the date strings into date objects
        start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()

        # Filter complaints by date range
        relevant_histories = []
        for doc in filtered_complaints:
            # Look for date fields like 'createdAt', 'resolvedAt', etc., to filter by date range
            date_str = doc.get('createdAt')
            if date_str:
                try:
                    doc_date = datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S.%f%z').date()
                except ValueError:
                    doc_date = datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S.%fZ').date()

                # Ensure the complaint falls within the specified date range
                if start_date_obj <= doc_date <= end_date_obj:
                    relevant_histories.append(doc)

        return jsonify(relevant_histories)

    except Exception as e:
        return jsonify({'error': str(e)}), 500



def fetch_all_ticket_history_documents(database_id, collection_id):
    all_documents = []
    last_document_id = None

    while True:
        # Fetch documents using cursor-based pagination
        if last_document_id:
            response = database.list_documents(
                database_id=database_id,
                collection_id=collection_id,
                queries=[
                    Query.cursor_after(last_document_id)
                ]
            )
        else:
            # First batch of documents (no cursor yet)
            response = database.list_documents(
                database_id=database_id,
                collection_id=collection_id
            )

        # Append the fetched documents to the overall list
        all_documents.extend(response['documents'])

        # If fewer documents than the limit are returned, all documents have been fetched
        if len(response['documents']) < 25:  # Default batch size is 25
            break

        # Set the cursor to the last document ID for the next query
        last_document_id = response['documents'][-1]['$id']

    return all_documents
@app.route('/ticket-history')
def ticket_history():
    try:
        # Fetch all tickets using pagination
        all_tickets = fetch_all_ticket_history_documents(DATABASE_ID, COLLECTION_ID)

        # Filter complaints to include only those with status 'Resolved', 'Withdrawn', or 'Invalidated'
        relevant_tickets = [
            doc for doc in all_tickets 
            if doc['status'] in ['Withdrawn', 'Resolved', 'Invalidated']
        ]

        # Parse and format date fields
        for ticket in relevant_tickets:
            ticket['formattedCreatedAt'] = format_date(ticket.get('createdAt'))
            ticket['formattedAssignedAt'] = format_date(ticket.get('assignedAt'))
            ticket['formattedResolvedAt'] = format_date(ticket.get('resolvedAt'))
            ticket['formattedWithdrawnAt'] = format_date(ticket.get('withdrawnAt'))
            ticket['formattedCanceledAt'] = format_date(ticket.get('canceledAt'))
            ticket['formattedFollowedUpAt'] = format_date(ticket.get('followedUpAt'))
            ticket['priority'] = calculate_priority(ticket)

        # Sort tickets by date based on their status
        relevant_tickets.sort(key=lambda x: (
            x['resolvedAt'] if x['status'] == 'Resolved' else
            x['withdrawnAt'] if x['status'] == 'Withdrawn' else
            x['canceledAt'] if x['status'] == 'Invalidated' else None
        ), reverse=True)  # Sort in descending order (most recent first)

        # Render the template with the formatted tickets
        return render_template("ticket_history.html", tickets=relevant_tickets)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/filter-tickets')
def filter_tickets():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    try:
        # Fetch all complaints from the Appwrite database
        response = database.list_documents(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID
        )

        # If no start or end date, return tickets with relevant statuses
        if not start_date or not end_date:
            relevant_tickets = [
                doc for doc in response['documents']
                if doc.get('status') in ['Resolved', 'Withdrawn', 'Invalidated']
            ]
            return jsonify(relevant_tickets)

        start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()

        # Filter complaints by date range and status (Resolved, Withdrawn, and Canceled)
        relevant_tickets = []
        for doc in response['documents']:
            for attr in ['resolvedAt', 'withdrawnAt', 'canceledAt']:
                date_str = doc.get(attr)
                if date_str:
                    try:
                        doc_date = datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S.%f%z').date()
                    except ValueError:
                        doc_date = datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S.%fZ').date()

                    # Ensure status is in Resolved, Withdrawn, or Canceled and the date is within the range
                    if start_date_obj <= doc_date <= end_date_obj and doc.get('status') in ['Resolved', 'Withdrawn', 'Invalidated']:
                        relevant_tickets.append(doc)
                        break

        return jsonify(relevant_tickets)

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