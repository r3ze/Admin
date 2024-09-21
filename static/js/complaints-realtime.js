    const client = new Appwrite.Client();
    const collectionId = '6626029b134a98006f77'; 

    // Set up Appwrite client
    client
        .setEndpoint('https://cloud.appwrite.io/v1') 
        .setProject('662248657f5bd3dd103c'); 

    const database = new Appwrite.Databases(client);

    // Listen to real-time events on the collection
    client.subscribe('databases.66224a152d9f9a67af78.collections.6626029b134a98006f77.documents', response => {
        const event = response.events[0];
        const document = response.payload;

        const status = response.payload.status;
        console.log(status)
        if (status === 'New') {
        updateNewComplaintsCount();
        updateAssignedComplaintsCount();
        updateResolvedComplaintsCount();
        console.log("new complaint");
    } else if (status === 'Assigned') {
        updateNewComplaintsCount();
        updateAssignedComplaintsCount();
        updateResolvedComplaintsCount();
        console.log("assigned complaint");
    } else if (status === 'Resolved') {
        updateNewComplaintsCount();
        updateAssignedComplaintsCount();
        updateResolvedComplaintsCount();
        console.log("resolved complaint");
    }

        console.log('Real-time event received:', response);
        console.log('Event:', event);
        
        const table = $('#example').DataTable();
        if (event.includes('create')) {
            console.log("Create event matched");
            addRowToTable(document);
        } else if (event.includes('update')) {
            console.log("Update event matched");
            updateRowInTable(document, table);
        } else if (event.includes('delete')) {
    console.log("Delete event received with document ID:", document.$id);
    deleteRowFromTable(document.$id);
    }
    });

    // Function to update the count of new complaints
    function updateNewComplaintsCount() {
    database.listDocuments('66224a152d9f9a67af78', '6626029b134a98006f77')
        .then(response => {
            const totalNewComplaints = response.documents.filter(complaint => complaint.status === 'New').length;
            document.getElementById('new_complaints_card').innerText = totalNewComplaints;
            document.getElementById('unassigned_complaints_card').innerText = totalNewComplaints;
            console.log(totalNewComplaints)
        });
    }

    // Function to update the count of assigned complaints
    function updateAssignedComplaintsCount() {
    database.listDocuments('66224a152d9f9a67af78', '6626029b134a98006f77')
        .then(response => {
            const totalAssignedComplaints = response.documents.filter(complaint => complaint.status === 'Assigned').length;
            document.getElementById('assigned_complaints_card').innerText = totalAssignedComplaints;
        });
    }

    // Function to update the count of resolved complaints
    function updateResolvedComplaintsCount() {
    database.listDocuments('66224a152d9f9a67af78', '6626029b134a98006f77')
        .then(response => {
            const totalResolvedComplaints = response.documents.filter(complaint => complaint.status === 'Resolved').length;
            document.getElementById('resolved_complaints_card').innerText = totalResolvedComplaints;
        });
    }


    function calculatePriority(complaint) {
        // Define severity based on complaint type
        const severityMap = {
            'No Power': 'High',
            'Loose Connection/Sparking of Wire': 'High',
            'Low Voltage': 'Medium',
            'Defective Meter': 'Medium',
            'No Reading': 'Low',
            'Detached Meter': 'Low'
        };

        // Severity-based prioritization
        const complaintType = complaint.description || 'Other';
        const severity = severityMap[complaintType] || 'Medium';
        const severityScore = {
            'High': 3,
            'Medium': 2,
            'Low': 1
        }[severity] || 2;

        // Time-based prioritization (older complaints get higher priority)
            // Time-based prioritization 
            const createdAt = complaint.createdAt;
            let timeScore = 0;
            if (createdAt) {
                const timeSubmitted = new Date(createdAt); 
        
                // Get current time in UTC (you might want to fetch this from the server for better accuracy)
                const nowUTC = new Date(); 
                const offsetMinutes = nowUTC.getTimezoneOffset(); 
                nowUTC.setMinutes(nowUTC.getMinutes() - offsetMinutes); 
        
                const hoursSinceSubmission = (nowUTC - timeSubmitted) / (1000 * 60 * 60);
                timeScore = Math.min(Math.floor(hoursSinceSubmission / 48), 3);
            }

        // Location-based prioritization (higher priority for critical locations)
        const criticalLocations = ['hospital', 'school'];
        const complaintLocation = (complaint.locationName || '').toLowerCase();
        const locationScore = criticalLocations.some(loc => complaintLocation.includes(loc)) ? 3 : 0;

        // Total priority score
        const totalScore = severityScore + timeScore + locationScore;

        // Determine priority level based on the score
        if (totalScore >= 6) {
            return 'High';
        } else if (totalScore >= 3) {
            return 'Medium';
        } else {
            return 'Low';
        }
    }

    // Helper function to format the date range
function formatDateRange(startDateStr, endDateStr) {
    try {
        // Convert string to Date objects, assuming input is in 'YYYY-MM-DD' format
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        const options = { month: 'long', day: 'numeric' }; // e.g., September 21

        // Check if the month is the same
        if (startDate.getMonth() === endDate.getMonth()) {
            return `${startDate.toLocaleDateString(undefined, options)} - ${endDate.getDate()}`;
        } else {
            // Different months
            return `${startDate.toLocaleDateString(undefined, options)} - ${endDate.toLocaleDateString(undefined, options)}`;
        }
    } catch (error) {
        console.error('Error formatting date range:', error);
        return 'Invalid Date';
    }
}

    // Function to add a row to the table
    function addRowToTable(doc) {
        const table = $('#example').DataTable(); 
        console.log(table)
        const createdAt = new Date(doc.createdAt);
        const formattedDate = ('0' + createdAt.getUTCDate()).slice(-2) + '/' +
            ('0' + (createdAt.getUTCMonth() + 1)).slice(-2) + '/' +
            createdAt.getUTCFullYear();

            const hours = createdAt.getUTCHours();
            const minutes = ('0' + createdAt.getUTCMinutes()).slice(-2);
            const ampm = hours >= 12 ? 'PM' : 'AM';  // Check if it's AM or PM
            const formattedTime = ('0' + (hours % 12 || 12)).slice(-2) + ':' + minutes + ' ' + ampm;

        const assignedAt = doc.assignedAt ? new Date(doc.assignedAt) : null;
        const assignedDate = assignedAt ? ('0' + assignedAt.getUTCDate()).slice(-2) + '/' +
            ('0' + (assignedAt.getUTCMonth() + 1)).slice(-2) + '/' +
            assignedAt.getUTCFullYear() : "Not Assigned";
            const assignedHours = assignedAt ? ('0' + (assignedAt.getUTCHours() % 12 || 12)).slice(-2) : '00';
            const assignedAmpm = assignedAt ? (assignedAt.getUTCHours() >= 12 ? 'PM' : 'AM') : '';
            const assignedMinutes = assignedAt ? ('0' + assignedAt.getUTCMinutes()).slice(-2) : '00';
            const assignedTime = assignedHours + ':' + assignedMinutes + ' ' + assignedAmpm;
        const crew_name = doc.crew_name ? doc.crew_name : '';
        const additionalDetails = doc.additionalDetails ? doc.additionalDetails : 'No additional details provided.';
        let resolutionTeamButton = '';

        // Example start and end date in 'YYYY-MM-DD' format
        const resolutionStartDate =  doc.resolutionStartDate
        const resolutionEndDate = doc.resolutionEndDate

// Call the formatDateRange function
        const formattedResolutionDate = (doc.resolutionEndDate && doc.resolutionEndDate) ? formatDateRange(resolutionStartDate, resolutionEndDate): "No date provided"
        
if (doc.crew_name) {
    resolutionTeamButton = `
        <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton-${doc.$id}" data-bs-toggle="dropdown" aria-expanded="false" data-selected-user="">
            ${doc.crew_name}
        </button>
    `;
} else {
    resolutionTeamButton = `
        <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton-${doc.$id}" data-bs-toggle="dropdown" aria-expanded="false" data-selected-user="">
            Assign Team
        </button>
    `;
};
        let statusBadgeClass = '';
        switch (doc.status) {
            case 'New':
                statusBadgeClass = 'badge bg-info';
                break;
            case 'Assigned':
                statusBadgeClass = 'badge bg-warning';
                break;
            case 'Resolved':
                statusBadgeClass = 'badge bg-success';
                break;
            case 'In Progress':
                statusBadgeClass = 'badge bg-secondary';
                break;
            default:
                statusBadgeClass = 'badge bg-secondary';
        }

        
        // Use DataTables API to add a new row
    // Add the row and assign the ID
    // Calculate priority


    // Call Flask API to calculate priority
    fetch('http://127.0.0.1:5000/calculate-priority', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            description: doc.description,
            createdAt: doc.createdAt,
            locationName: doc.locationName,
            additionalDetails: doc.additionalDetails
        })

    })
    .then(response => response.json())
    .then(data => {
        const priority = data.priority;

        let priorityBadgeClass = '';
        switch (priority) {
            case 'High':
                priorityBadgeClass = 'badge bg-danger';  // High priority: Red badge
                break;
            case 'Medium':
                priorityBadgeClass = 'badge bg-warning'; // Medium priority: Yellow badge
                break;
            case 'Low':
                priorityBadgeClass = 'badge bg-success'; // Low priority: Green badge
                break;
            default:
                priorityBadgeClass = 'badge bg-secondary'; // Default: Grey badge
        }
        const newRow = table.row.add([
        doc.$id,
        doc.consumer_name,
        doc.description,
        `<span class="${priorityBadgeClass}">${priority}</span>`,
        `${formattedDate} ${formattedTime}`,
        `<span class="${statusBadgeClass}" style="padding: 5px 10px; border-radius: 20px;">${doc.status}</span>`,
        `<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal-${doc.$id}">View Details</button>`
    ]).draw(false).node();
    
    // Set the row ID to match the document ID
    $(newRow).attr('id', doc.$id);
        
        table.order([0, 'desc']).draw(); 
    

        
    // Create the modal HTML
    const modalHtml = `
    
    <div class="modal fade ticket-modal" id="modal-${doc.$id}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="modalLabel-${doc.$id}" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="staticBackdropLabel">Ticket Details</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="mb-3 row">
                            <label for="ticketID" class="col-sm-3 col-form-label">Ticket ID</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="ticketID" disabled value="${doc.$id}">
                            </div>
                        </div>
                        <div class="mb-3 row">
                            <label for="consumer" class="col-sm-3 col-form-label">Consumer</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="consumer" disabled value="${doc.consumer_name}">
                            </div>
                        </div>
                        <div class="mb-3 row">
                            <label for="complaintType" class="col-sm-3 col-form-label">Complaint Type</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="complaintType" disabled value="${doc.description}">
                            </div>
                        </div>
                        <div class="mb-3 row">
                            <label for="additionalDetails" class="col-sm-3 col-form-label">Additional Details</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="additionalDetails" disabled value="${additionalDetails}">
                            </div>
                        </div>
                        <div class="mb-3 row">
                            <label for="address" class="col-sm-3 col-form-label">Address</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="address" disabled value="${doc.locationName}">
                            </div>
                        </div>
                        <div class="mb-3 row">
                            <label for="image" class="col-sm-3 col-form-label">Image</label>
                            <div class="col-sm-9">
                                <a href="#" class="view-image" data-image="${doc.image}" style="text-decoration: none;" data-bs-toggle="modal" data-bs-target="#imageModal">View</a>
                            </div>
                        </div>
                        <div class="mb-3 row">
                            <label for="dateCreated" class="col-sm-3 col-form-label">Date Reported</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="dateCreated" disabled value="${formattedDate} ${formattedTime}">
                            </div>
                        </div>
                            <div class="mb-3 row">
                        <label for="dateAssigned" class="col-sm-3 col-form-label">Date Assigned</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control" id="dateAssigned" disabled value="${assignedDate} ${assignedTime}">
                        </div>
                        </div>
                        
                         <div class="mb-3 row">
                        <label for="resolutionDate" class="col-sm-3 col-form-label">Date Assigned</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control" id="resolutionDate" disabled value="${formattedResolutionDate}">
                        </div>
                        </div>

                        


                        <div class="mb-3 row">
                            <label for="priority" class="col-sm-3 col-form-label">Priority</label>
                            <div class="col-sm-9">
                                <input type="hidden" class="form-control" id="Priority"  value="${priority}">
                                <input type="text" class="form-control"  disabled value="${priority}">
                            </div>
                        </div>
                        <div class="mb-3 row">
                            <label for="complaintStatus" class="col-sm-3 col-form-label">Status</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="complaintStatus" disabled value="${doc.status}">
                            </div>
                        </div>
                        <div class="mb-3 row">
                            <label for="resolutionTeamName" class="col-sm-3 col-form-label">Resolution Team</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="resolutionTeamName" disabled value="${crew_name}">
                            </div>
                        </div>
                        <div class="mb-3 row">
                            <label for="followUp" class="col-sm-3 col-form-label">Followed Up By Consumer</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="followUp" disabled value="${doc.followUp}">
                            </div>
                        </div>

                                 <div class="mb-3 row">
                        <label for="resolutionTeamDropdown" class="col-sm-3 col-form-label">Action</label>
                        <div class="col-sm-9">
                            <div class="dropdown">
                                ${resolutionTeamButton}
                                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton-${doc.$id}" id="dropdownMenu-${doc.$id}">
                                    <!-- Options will be added dynamically -->
                                </ul>
                            </div>
                        </div>
                    </div>

                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
    `;

    // Append the modal HTML to the body
    document.body.insertAdjacentHTML('afterbegin', modalHtml);


    })
    .catch((error) => {
        console.error('Error calculating priority:', error);
    });
    
    

    // Populate dropdowns for the specific complaint
    populateDropdown(`#dropdownMenu-${doc.$id}`);

 
    $(document).on('click', '.status-dropdown', function() {
        const complaintId = $(this).data('complaint-id');
        const assignedCrew = $(this).data('user-id');
        const userName = $(this).data('user-name');
        var priority = $('#Priority').val();
        // Show the confirmation modal
        $('#confirmAssignModal').modal('show');
    
        // Handle the confirm button click
        $('#confirmAssignButton').off('click').on('click', function () {
            // Get the values from the modal inputs
            const resolutionStartDate = $('#resolutionStartDate').val(); 
            const resolutionEndDate = $('#resolutionEndDate').val();
    
            // Ensure that both dates are provided
            if (!resolutionStartDate || !resolutionEndDate) {
                alert("Please select both start and end dates");
                return;
            }
    
            // Close the confirmation modal
            $('#confirmAssignModal').modal('hide');
    
            // Make the AJAX call to update the crew assignment and dates
            updateCrew(complaintId, assignedCrew, userName, resolutionStartDate, resolutionEndDate, priority)
                .done(function(response) {
                    $('#modalBodyContent').text('Crew assigned successfully!');
                    $('#successModal').modal('show');
    
                    if (response.success) {
                        updateStatus(complaintId, 'Assigned')
                            .done(function(statusResponse) {
                                if (!statusResponse.success) {
                                    alert('Error updating status: ' + statusResponse.error);
                                }
                            });
                    } else {
                        alert('Error assigning crew: ' + response.error);
                    }
                })
                .fail(function(xhr, status, error) {
                    alert('AJAX error: ' + error);
                });
        });
    });
    
    }

    function updateCrew(complaintId, assignedCrew, userName, startDate, endDate, priority) {
        return $.ajax({
            url: '/update-crew',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                complaintId: complaintId,
                assigned_crew: assignedCrew,
                crew_name: userName,
                resolutionStartDate: startDate,
                resolutionEndDate: endDate,
                priority: priority
            }),
            success: function(response) {
                if (response.success) {
                    const log_data = {
                        crew_id: assignedCrew,
                        user: "Admin",
                        action: "Assigned tasks to " + userName
                    };
    
                    fetch('/log', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(log_data)
                    })
                    .then(response => response.json())
                    .catch(error => {
                        console.error('Error:', error);
                    });
                }
            }
        });
    }
    
    
    function updateStatus(complaintId, newStatus) {
        return $.ajax({
            url: '/update-status',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ complaintId: complaintId, status: newStatus })
           
            
        });
    }

    
    

    // Function to populate a specific dropdown
    function populateDropdown(dropdownSelector) {
        $.ajax({
            url: '/api/users',
            method: 'GET',
            dataType: 'json',
            success: function(users) {
                var dropdownMenu = $(dropdownSelector);

                users.forEach(function(user) {
                    var listItem = `<li>
                        <a class="dropdown-item status-dropdown" href="#" data-user-id="${user['$id']}" data-complaint-id="${dropdownMenu.attr('id').split('-')[1]}"
                        data-user-name="${user['name_team']}">
                        ${user['name_team']}
                        </a>
                    </li>`;
                    dropdownMenu.append(listItem);
                });
            },
            error: function(xhr, status, error) {
                console.error('Failed to fetch users:', error);
            }
        });
    }


    function updateRowInTable(doc, dataTable) {
        // Find the row by document ID
        const rowIndex = dataTable.row(`#${doc.$id}`).index();

        // If the row exists in the DataTable
        if (rowIndex !== null && rowIndex !== undefined) {
            // Format the createdAt date
            const createdAt = new Date(doc.createdAt);
            const formattedDate = ('0' + createdAt.getUTCDate()).slice(-2) + '/' +
                ('0' + (createdAt.getUTCMonth() + 1)).slice(-2) + '/' +
                createdAt.getUTCFullYear();

            const hours = createdAt.getUTCHours();
            const minutes = ('0' + createdAt.getUTCMinutes()).slice(-2);
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedTime = ('0' + (hours % 12 || 12)).slice(-2) + ':' + minutes + ' ' + ampm;

            const assignedAt = doc.assignedAt ? new Date(doc.assignedAt) : null;
            const assignedDate = assignedAt ? ('0' + assignedAt.getUTCDate()).slice(-2) + '/' +
                ('0' + (assignedAt.getUTCMonth() + 1)).slice(-2) + '/' +
                assignedAt.getUTCFullYear() : "Not Assigned";
            const assignedHours = assignedAt ? ('0' + (assignedAt.getUTCHours() % 12 || 12)).slice(-2) : '00';
            const assignedAmpm = assignedAt ? (assignedAt.getUTCHours() >= 12 ? 'PM' : 'AM') : '';
            const assignedMinutes = assignedAt ? ('0' + assignedAt.getUTCMinutes()).slice(-2) : '00';
            const assignedTime = assignedHours + ':' + assignedMinutes + ' ' + assignedAmpm;
  // Example start and end date in 'YYYY-MM-DD' format
  const resolutionStartDate =  doc.resolutionStartDate
  const resolutionEndDate = doc.resolutionEndDate

// Call the formatDateRange function
  const formattedResolutionDate = (doc.resolutionEndDate && doc.resolutionEndDate) ? formatDateRange(resolutionStartDate, resolutionEndDate): "No date provided"
            let statusBadgeClass = '';
            switch (doc.status) {
                case 'New':
                    statusBadgeClass = 'badge bg-info';
                    break;
                case 'Assigned':
                    statusBadgeClass = 'badge bg-warning';
                    break;
                case 'Resolved':
                    statusBadgeClass = 'badge bg-success';
                    break;
                case 'In Progress':
                    statusBadgeClass = 'badge bg-secondary';
                    break;
                default:
                    statusBadgeClass = 'badge bg-secondary';
            }

            // Fetch updated priority from the API
            fetch('http://127.0.0.1:5000/calculate-priority', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: doc.description,
                    createdAt: doc.createdAt,
                    locationName: doc.locationName,
                    additionalDetails: doc.additionalDetails
                })
            })
            .then(response => response.json())
            .then(data => {
                const priority = data.priority;

                // Define the class for priority badge based on the calculated priority
                let priorityBadgeClass = '';
                switch (priority) {
                    case 'High':
                        priorityBadgeClass = 'badge bg-danger';
                        break;
                    case 'Medium':
                        priorityBadgeClass = 'badge bg-warning';
                        break;
                    case 'Low':
                        priorityBadgeClass = 'badge bg-success';
                        break;
                    default:
                        priorityBadgeClass = 'badge bg-secondary';
                }

                // Update the row data in the DataTable
                dataTable.row(rowIndex).data([
                    doc.$id,
                    doc.consumer_name,
                    doc.description,
                    `<span class="${priorityBadgeClass}">${priority}</span>`,
                    `${formattedDate} ${formattedTime}`,
                    `<span class="${statusBadgeClass}" style="padding: 5px 10px; border-radius: 20px;">${doc.status}</span>`,
                    `<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal-${doc.$id}">View Details</button>`
                ]).draw(false);

                // Update the existing modal content
                updateModalContent(doc, formattedDate, formattedTime, assignedDate, assignedTime, resolutionStartDate, resolutionEndDate,  formattedResolutionDate);
            })
            .catch(error => {
                console.error('Error calculating priority:', error);
            });
        } else {
            console.log(`Row with ID ${doc.$id} not found.`);
        }
    }

    // Helper function to update the modal content
    function updateModalContent(doc, formattedDate, formattedTime, assignedDate, assignedTime, resolutionStartDate, resolutionEndDate, formattedResolutionDate) {
        const modalElement = document.getElementById(`modal-${doc.$id}`);
        if (modalElement) {
            const ticketIDInput = modalElement.querySelector('#ticketID');
            const consumerInput = modalElement.querySelector('#consumer');
            const complaintTypeInput = modalElement.querySelector('#complaintType');
            const additionalDetailsInput = modalElement.querySelector('#additionalDetails');
            const addressInput = modalElement.querySelector('#address');
            const dateCreatedInput = modalElement.querySelector('#dateCreated');
            const dateAssignedInput = modalElement.querySelector('#dateAssigned');
            const complaintStatusInput = modalElement.querySelector('#complaintStatus');
            const resolutionTeamInput = modalElement.querySelector('#resolutionTeamName');
            const followUpInput = modalElement.querySelector('#followUp');
            const resolutionDateInput = modalElement.querySelector('#resolutionDate')
            if (ticketIDInput) ticketIDInput.value = doc.$id;
            if (consumerInput) consumerInput.value = doc.consumer_name;
            if (complaintTypeInput) complaintTypeInput.value = doc.description;
            if (additionalDetailsInput) additionalDetailsInput.value = doc.additionalDetails ? doc.additionalDetails : 'No additional details provided.';
            if (addressInput) addressInput.value = doc.locationName;
            if (dateCreatedInput) dateCreatedInput.value = `${formattedDate} ${formattedTime}`;
            if (dateAssignedInput) dateAssignedInput.value = assignedDate + (assignedTime ? ' ' + assignedTime : '');
            if (resolutionDateInput) resolutionDateInput.value = formattedResolutionDate;

            if (complaintStatusInput) complaintStatusInput.value = doc.status;
            if (resolutionTeamInput) resolutionTeamInput.value = doc.crew_name;
            if (followUpInput) followUpInput.value = doc.followUp ? doc.followUp : "No";
        } else {
            console.log(`Modal with ID modal-${doc.$id} not found.`);
        }
    }


    // Function to delete a row from the table
    function deleteRowFromTable(docId) {
    console.log("Attempting to delete row with ID:", docId);
    const row = document.getElementById(docId);
    if (row) {
        row.remove();
        console.log("Row successfully removed:", row);
    } else {
        console.log("No row found with ID:", docId);
    }
    }

