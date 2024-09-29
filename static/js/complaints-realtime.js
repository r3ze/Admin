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


        console.log('Real-time event received:', response);
        console.log('Event:', event);
        
        const table = $('#example').DataTable();
        if (event.includes('create')) {
            console.log("Create event matched", document.$id);
            updateNewComplaintsCount();
            updateAssignedComplaintsCount();
            updateResolvedComplaintsCount();
            updateInProgressComplaintsCount()
            addRowToTable(document);
        } else if (event.includes('update')) {
            updateNewComplaintsCount();
            updateAssignedComplaintsCount();
            updateResolvedComplaintsCount();
            updateInProgressComplaintsCount()
            console.log("Update event matched", document.$id);
            updateRowInTable(document, table);
        } else if (event.includes('delete')) {
    console.log("Delete event received with document ID:", document.$id);
    updateNewComplaintsCount();
    updateAssignedComplaintsCount();
    updateResolvedComplaintsCount();
    updateInProgressComplaintsCount()
    deleteRowFromTable(document.$id);
    }
    });

    // Function to update the count of new complaints
    function updateNewComplaintsCount() {
        let totalNewComplaints = 0;
        let lastDocumentId = null;
    
        function fetchComplaints() {
            const queries = [
                Appwrite.Query.equal("status", "New"),
                Appwrite.Query.limit(20) // Fetch 20 documents at a time
            ];
    
            if (lastDocumentId) {
                queries.push(Appwrite.Query.cursorAfter(lastDocumentId));
            }
    
            database.listDocuments('66224a152d9f9a67af78', '6626029b134a98006f77', queries)
                .then(response => {
                    totalNewComplaints += response.documents.length;
    
                    // If there are more documents, fetch the next batch
                    if (response.documents.length === 20) {
                        lastDocumentId = response.documents[response.documents.length - 1].$id;
                        fetchComplaints(); // Recursively fetch the next batch
                    } else {
                        // All documents fetched
                        document.getElementById('new_complaints_card').innerText = totalNewComplaints;
                        console.log(totalNewComplaints);
                    }
                });
        }
    
        // Start fetching the complaints
        fetchComplaints();
    }
    function updateInProgressComplaintsCount() {
        let totalAssignedComplaints = 0;
        let lastDocumentId = null;
    
        function fetchComplaints() {
            const queries = [
                Appwrite.Query.equal("status", "In Progress"),
                Appwrite.Query.limit(20) // Fetch 20 documents at a time
            ];
    
            if (lastDocumentId) {
                queries.push(Appwrite.Query.cursorAfter(lastDocumentId));
            }
    
            database.listDocuments('66224a152d9f9a67af78', '6626029b134a98006f77', queries)
                .then(response => {
                    totalAssignedComplaints += response.documents.length;
    
                    // If there are more documents, fetch the next batch
                    if (response.documents.length === 20) {
                        lastDocumentId = response.documents[response.documents.length - 1].$id;
                        fetchComplaints(); // Recursively fetch the next batch
                    } else {
                        // All documents fetched
                        document.getElementById('assigned_complaints_card').innerText = totalAssignedComplaints;
                    }
                });
        }
    
        // Start fetching the complaints
        fetchComplaints();
    }
    

// Function to update the count of assigned complaints
function updateAssignedComplaintsCount() {
    let totalAssignedComplaints = 0;
    let lastDocumentId = null;

    function fetchComplaints() {
        const queries = [
            Appwrite.Query.equal("status", "Assigned"),
            Appwrite.Query.limit(20) // Fetch 20 documents at a time
        ];

        if (lastDocumentId) {
            queries.push(Appwrite.Query.cursorAfter(lastDocumentId));
        }

        database.listDocuments('66224a152d9f9a67af78', '6626029b134a98006f77', queries)
            .then(response => {
                totalAssignedComplaints += response.documents.length;

                // If there are more documents, fetch the next batch
                if (response.documents.length === 20) {
                    lastDocumentId = response.documents[response.documents.length - 1].$id;
                    fetchComplaints(); // Recursively fetch the next batch
                } else {
                    // All documents fetched
                    document.getElementById('assigned_complaints_card').innerText = totalAssignedComplaints;
                }
            });
    }

    // Start fetching the complaints
    fetchComplaints();
}


    // Function to update the count of resolved complaints
    function updateResolvedComplaintsCount() {
        let totalResolvedComplaints = 0;
        let lastDocumentId = null;
    
        function fetchResolvedComplaints() {
            const queries = [
                Appwrite.Query.equal("status", "Resolved"),
                Appwrite.Query.limit(20) // Fetch 20 documents at a time
            ];
    
            if (lastDocumentId) {
                queries.push(Appwrite.Query.cursorAfter(lastDocumentId));
            }
    
            database.listDocuments('66224a152d9f9a67af78', '6626029b134a98006f77', queries)
                .then(response => {
                    totalResolvedComplaints += response.documents.length;
    
                    // If there are more documents, fetch the next batch
                    if (response.documents.length === 20) {
                        lastDocumentId = response.documents[response.documents.length - 1].$id;
                        fetchResolvedComplaints(); // Recursively fetch the next batch
                    } else {
                        // All documents fetched
                        document.getElementById('resolved_complaints_card').innerText = totalResolvedComplaints;
                    }
                });
        }
    
        // Start fetching the resolved complaints
        fetchResolvedComplaints();
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
        let cancelComplaintButton = '';

      
            cancelComplaintButton = `<button class="btn btn-danger cancelComplaintButton" id="cancelComplaintButton" type="button" data-selected-complaint="${doc.$id}">
                            Invalidate Complaint
                          </button>`;
        
      

        // Example start and end date in 'YYYY-MM-DD' format
        const resolutionStartDate =  doc.resolutionStartDate
        const resolutionEndDate = doc.resolutionEndDate

// Call the formatDateRange function
        const formattedResolutionDate = (doc.resolutionEndDate && doc.resolutionEndDate) ? formatDateRange(resolutionStartDate, resolutionEndDate): "No date provided"
        const followedUp = doc.followedUpAt ? doc.followedUpAt: 'Not followed up by consumer'

        let resolutionMembers = 'No crew members assigned yet.'; // Default message

if (doc.resolution_members && doc.resolution_members.length > 0) {
    resolutionMembers = doc.resolution_members.join(', '); // Join members into a single string
}


if (doc.crew_name) {
    resolutionTeamButton = cancelComplaintButton = `<button class="btn btn-danger cancelComplaintButton" id="cancelComplaintButton" type="button" data-selected-complaint="${doc.$id}">
    Cancel Complaint
  </button>`;
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
            case 'Invalidated':
                    statusBadgeClass = 'badge bg-secondary';
                    break;
            default:
                statusBadgeClass = 'badge bg-secondary';
        }

        
        // Use DataTables API to add a new row
    // Add the row and assign the ID
    // Calculate priority


    // Call Flask API to calculate priority
    fetch('/calculate-priority', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            description: doc.description,
            createdAt: doc.createdAt,
            locationName: doc.locationName,
            additionalDetails: doc.additionalDetails,
            followedUpAt: doc.followedUpAt,   
    resolutionStartDate: doc.resolutionStartDate,  
    resolutionEndDate: doc.resolutionEndDate,     
    status: doc.status 
            
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
                        <label for="resolutionDate" class="col-sm-3 col-form-label">Estimated Resolution Date</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control" id="resolutionDate" disabled value="${formattedResolutionDate}">
                        </div>
                        </div>

                           <div class="mb-3 row">
                            <label for="followUp" class="col-sm-3 col-form-label">Date Followed-up</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="followUp" disabled value="${followedUp}">
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
    <label for="resolutionMembers" class="col-sm-3 col-form-label">Crew Members</label>
    <div class="col-sm-9">
        <input type="text" class="form-control" id="resolutionMembers" value="${resolutionMembers}" disabled>
    </div>
</div>
                     

                                 <div class="mb-3 row">
                        <label for="resolutionTeamDropdown" class="col-sm-3 col-form-label">Action</label>
                        <div class="col-sm-9">
                        <div class="d-flex"> 
                            <div class="dropdown me-2">
                                ${resolutionTeamButton}
                                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton-${doc.$id}" id="dropdownMenu-${doc.$id}">
                                    <!-- Options will be added dynamically -->
                                </ul>
                            </div>
                            <div>
                            ${cancelComplaintButton}
                            </div>
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
    const cancelModalHtml =`<!-- Modal for canceling complaint -->
<div class="modal fade" id="cancelModal-${doc.$id}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="cancelModalLabel-${doc.$id}" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="cancelModalLabel-${doc.$id}">Cancel Complaint</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to cancel this complaint? Please provide a reason:</p>
        
        <!-- Radio buttons for predefined reasons -->
        <div class="mb-3">
          <div class="form-check">
            <input class="form-check-input" type="radio" name="cancelReasonOptions-${doc.$id}" id="reason1-${doc.$id}" value="Invalid Complaint">
            <label class="form-check-label" for="reason1-${doc.$id}">
              Invalid Complaint
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="cancelReasonOptions-${doc.$id}" id="reason2-${doc.$id}" value="Issue Resolved">
            <label class="form-check-label" for="reason2-${doc.$id}">
              Issue Resolved
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="cancelReasonOptions-${doc.$id}" id="reason3-${doc.$id}" value="Other">
            <label class="form-check-label" for="reason3-${doc.$id}">
              Other
            </label>
          </div>
        </div>

        <!-- Textarea for custom reason (enabled only when 'Other' is selected) -->
        <textarea class="form-control" id="cancelReason-${doc.$id}" rows="3" placeholder="Enter cancellation reason..." disabled></textarea>

      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-danger" id="confirmCancelButton" cancel-complaint-id="${doc.$id}">Confirm Cancellation</button>
      </div>
    </div>
  </div>
</div>
`;



    // Append the modal HTML to the body
    document.body.insertAdjacentHTML('afterbegin', modalHtml + cancelModalHtml);


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

        $('#crewMemberSelection').empty();
         // Make an AJAX call to fetch the crew members for the selected team
  $.ajax({
    url: '/api/crew-members',  // Endpoint to fetch crew members for the selected team
    method: 'GET',
    data: { teamId: assignedCrew },  // Send the selected team's ID
    dataType: 'json',
    success: function(response) {
        if (response.success) {
            // Loop through the crew members and populate the select element
            response.crewMembers.forEach(function(member) {
                var option = new Option(member.name, member.id, false, false);
                $('#crewMemberSelection').append(option);
            });
            $('#crewMemberSelection').trigger('change');  // Refresh the select2 dropdown
        } else {
            console.error('Error fetching crew members:', response.error);
        }
    },
    error: function(xhr, status, error) {
        console.error('AJAX Error:', error);
    }
});
    
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

                    var button = $('#dropdownMenuButton-' + complaintId);
                    button.prop('disabled', true);            // Disable the button
                    button.removeClass('btn-primary');        // Remove the primary class
                    button.addClass('btn-secondary');         // Add the secondary class
                    button.text(userName);             // Change button text
    
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
    

    $(document).ready(function() {
        document.addEventListener('click', function(event) {
            // Check if the cancel complaint button was clicked
            if (event.target && event.target.classList.contains('cancelComplaintButton')) {
                event.preventDefault();
                
                // Get the complaint ID
                const complaintId = event.target.getAttribute('data-selected-complaint');
                console.log('Complaint ID:', complaintId);  // Log the complaint ID
                
                const cancelModalId = `#cancelModal-${complaintId}`;
                console.log('Cancel Modal ID:', cancelModalId);  // Log the modal ID
                
                const cancelModalElement = document.querySelector(cancelModalId);
                console.log('Cancel Modal Element:', cancelModalElement);  // Log the modal element
                
                if (!cancelModalElement) {
                    console.error('Modal not found in the DOM');  // If no modal element is found, log an error
                    return;  // Prevent further execution if the modal is not found
                }
                
                const cancelModal = new bootstrap.Modal(cancelModalElement, {
                    backdrop: 'static',
                    keyboard: false
                });
                cancelModal.show();  // Show the modal
    
                // Handle enabling/disabling the textarea based on the selected reason
                const reasonRadios = document.querySelectorAll(`input[name="cancelReasonOptions-${complaintId}"]`);
                const cancelReasonTextarea = document.getElementById(`cancelReason-${complaintId}`);
    
                // Initially disable the textarea
                cancelReasonTextarea.disabled = true;
                
                reasonRadios.forEach(radio => {
                    radio.addEventListener('change', function() {
                        if (this.value === "Other") {
                            cancelReasonTextarea.disabled = false; // Enable textarea when "Other" is selected
                        } else {
                            cancelReasonTextarea.disabled = true;  // Disable textarea for predefined reasons
                            cancelReasonTextarea.value = '';  // Clear the textarea when disabled
                        }
                    });
                });
            }
    
            // Confirm cancel button logic
            if (event.target && event.target.id === 'confirmCancelButton') {
                event.preventDefault();
                
                const complaintId = event.target.getAttribute('cancel-complaint-id');
                console.log('Complaint ID from confirm button:', complaintId);  // Log the complaint ID
                
                const selectedReason = document.querySelector(`input[name="cancelReasonOptions-${complaintId}"]:checked`).value;
                let cancellationReason = selectedReason;
                
                if (selectedReason === 'Other') {
                    cancellationReason = document.getElementById(`cancelReason-${complaintId}`).value.trim();
                }
                
                if (!cancellationReason) {
                    alert("Please provide a cancellation reason.");
                    return;
                }
    
                // Send AJAX request to Flask backend
                fetch('/cancel-complaint', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        complaintId: complaintId,
                        cancellation_reason: cancellationReason
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Complaint successfully canceled.');
    
                        // Close the modal upon successful cancellation
                        const cancelModalElement = document.querySelector(`#cancelModal-${complaintId}`);
                        const cancelModal = bootstrap.Modal.getInstance(cancelModalElement);
                        cancelModal.hide();  // Hide the modal
                        
                        // Disable the "Cancel Complaint" button
                        const cancelButton = document.querySelector(`[data-selected-complaint="${complaintId}"]`);
                        if (cancelButton) {
                            cancelButton.disabled = true;
                            cancelButton.classList.remove('btn-danger');
                            cancelButton.classList.add('btn-secondary');
                            cancelButton.innerText = 'Complaint Canceled';  // Optional: update button text
                        }
                    } else {
                        alert('Failed to cancel the complaint. Please try again.');
                    }
                })
                .catch(error => console.error('Error:', error));
            }
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
                priority: priority,
                resolution_members: $('#crewMemberSelection').val()
            }),
            success: function(response) {
                if (response.success) {
                    const log_data = {
                        crew_id: assignedCrew,
                        user: "Admin",
                        action: "Assigned tasks to " + userName
                    };
                    var button = $('button[data-selected-complaint="' + complaintId + '"]');
                        button.prop('disabled', true);  // Disable the button for that specific complaint
    
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
            fetch('/calculate-priority', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: doc.description,
                    createdAt: doc.createdAt,
                    locationName: doc.locationName,
                    additionalDetails: doc.additionalDetails,
            followedUpAt: doc.followedUpAt,   
    resolutionStartDate: doc.resolutionStartDate,  
    resolutionEndDate: doc.resolutionEndDate,     
    status: doc.status 
                    
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
            const resolutionMembersInput = modalElement.querySelector('#resolutionMembers')
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
            if (resolutionMembersInput) resolutionMembersInput.value = doc.resolution_members ? doc.resolution_members:'No crew members assigned yet.'
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

