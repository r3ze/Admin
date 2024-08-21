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
    const formattedTime = ('0' + (hours % 12 || 12)).slice(-2) + ':' + minutes;

    const assignedAt = doc.assignedAt ? new Date(doc.assignedAt) : null;
    const assignedDate = assignedAt ? ('0' + assignedAt.getUTCDate()).slice(-2) + '/' +
        ('0' + (assignedAt.getUTCMonth() + 1)).slice(-2) + '/' +
        assignedAt.getUTCFullYear() : "Not Assigned";
    const assignedHours = assignedAt ? ('0' + assignedAt.getUTCHours()).slice(-2) : '00';
    const assignedMinutes = assignedAt ? ('0' + assignedAt.getUTCMinutes()).slice(-2) : '00';
    const assignedTime = assignedHours + ':' + assignedMinutes;

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
        case 'Closed':
            statusBadgeClass = 'badge bg-secondary';
            break;
        default:
            statusBadgeClass = 'badge bg-secondary';
    }

    // Use DataTables API to add a new row
   // Add the row and assign the ID
   const newRow = table.row.add([
    doc.$id,
    doc.consumer_name,
    doc.description,
    '<span class="badge bg-primary">Medium</span>',
    `${formattedDate} ${formattedTime}`,
    `<span class="${statusBadgeClass}" style="padding: 5px 10px; border-radius: 20px;">${doc.status}</span>`,
    `<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal-${doc.$id}">View More</button>`
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
                                  <input type="text" class="form-control" id="additionalDetails" disabled value="${doc.additionalDetails}">
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
                              <label for="priority" class="col-sm-3 col-form-label">Priority</label>
                              <div class="col-sm-9">
                                  <input type="text" class="form-control" id="priority" disabled value="High">
                              </div>
                          </div>
                          <div class="mb-3 row">
                              <label for="complaintStatus" class="col-sm-3 col-form-label">Status</label>
                              <div class="col-sm-9">
                                  <input type="text" class="form-control" id="complaintStatus" disabled value="${doc.status}">
                              </div>
                          </div>
                          <div class="mb-3 row">
                              <label for="resolutionTeam" class="col-sm-3 col-form-label">Resolution Team</label>
                              <div class="col-sm-9">
                                  <input type="text" class="form-control" id="resolutionTeam" disabled value="${doc.crew_name}">
                              </div>
                          </div>
                          <div class="mb-3 row">
                              <label for="followUp" class="col-sm-3 col-form-label">Followed Up By Consumer</label>
                              <div class="col-sm-9">
                                  <input type="text" class="form-control" id="followUp" disabled value="${doc.followUp}">
                              </div>
                          </div>

                                <div class="mb-3 row">
                            <label for="resolutionTeamDropdown" class="col-sm-3 col-form-label">Resolution Team</label>
                            <div class="col-sm-9">
                                <div class="dropdown">
                                    <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton-${doc.$id}" data-bs-toggle="dropdown" aria-expanded="false" data-selected-user="">
                                        Assign
                                    </button>
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
                      <button type="button" class="btn btn-primary">Understood</button>
                  </div>
              </div>
          </div>
      </div>
  `;

  // Append the modal HTML to the body
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Populate dropdowns for the specific complaint
  populateDropdown(`#dropdownMenu-${doc.$id}`);

  // Event listener for dropdown selection
$(document).on('click', '.status-dropdown', function() {
    var complaintId = $(this).data('complaint-id');
    var assignedCrew = $(this).data('user-id');
    var userName = $(this).data('user-name');
    var newClass = "btn-secondary";

    $(this).closest('.dropdown').find('.dropdown-toggle')
        .removeClass('btn-primary')
        .addClass(newClass)
        .text("Edit");

    // Update crew and status via AJAX
    $.ajax({
        url: '/update-crew',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ complaintId: complaintId, assigned_crew: assignedCrew, crew_name: userName }),
        success: function(response) {
            if (response.success) {
                alert('Crew assigned successfully!');

                var newStatus = "Assigned";
                $.ajax({
                    url: '/update-status',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ complaintId: complaintId, status: newStatus }),
                    success: function(response) {
                        if (response.success) {
                            alert('Status updated successfully!');
                        } else {
                            alert('Error updating status: ' + response.error);
                        }
                    },
                    error: function(xhr, status, error) {
                        alert('AJAX error: ' + error);
                    }
                });
            } else {
                alert('Error assigning crew: ' + response.error);
            }
        },
        error: function(xhr, status, error) {
            alert('AJAX error: ' + error);
        }
    });
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

        const hours = ('0' + createdAt.getUTCHours()).slice(-2);
        const minutes = ('0' + createdAt.getUTCMinutes()).slice(-2);
        const formattedTime = hours + ':' + minutes;

        // Format assignedAt date
        const assignedAt = doc.assignedAt ? new Date(doc.assignedAt) : null;
        const assignedDate = assignedAt ? ('0' + assignedAt.getUTCDate()).slice(-2) + '/' +
            ('0' + (assignedAt.getUTCMonth() + 1)).slice(-2) + '/' +
            assignedAt.getUTCFullYear() : "Not Assigned";
        const assignedHours = assignedAt ? ('0' + assignedAt.getUTCHours()).slice(-2) : '00';
        const assignedMinutes = assignedAt ? ('0' + assignedAt.getUTCMinutes()).slice(-2) : '00';
        const assignedTime = assignedHours + ':' + assignedMinutes;

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
            case 'Closed':
                statusBadgeClass = 'badge bg-secondary';
                break;
            default:
                statusBadgeClass = 'badge bg-secondary';
        }

        // Update the row data in the DataTable
        dataTable.row(rowIndex).data([
            doc.$id,
            doc.consumer_name,
            doc.description,
            '<span class="badge bg-primary">Medium</span>',
            `${formattedDate} ${formattedTime}`,
            `<span class="${statusBadgeClass}" style="padding: 5px 10px; border-radius: 20px;">${doc.status}</span>`,
            `<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal-${doc.$id}">View More</button>`
        ]).draw(false);

        // Update the existing modal content
        const modalElement = document.getElementById(`modal-${doc.$id}`);
        if (modalElement) {
            console.log("Updating modal for:", doc.$id);  // Debugging

            // Ensure each element is found and update them
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

           
            if (ticketIDInput) ticketIDInput.value = doc.$id;
            if (consumerInput) consumerInput.value = doc.consumer_name;
            if (complaintTypeInput) complaintTypeInput.value = doc.description;
            if (additionalDetailsInput) additionalDetailsInput.value = doc.additionalDetails;
            if (addressInput) addressInput.value = doc.locationName;
            if (dateCreatedInput) dateCreatedInput.value = `${formattedDate} ${formattedTime}`;
            if (dateAssignedInput) dateAssignedInput.value = assignedDate + (assignedTime ? ' ' + assignedTime : '');
            if (complaintStatusInput) complaintStatusInput.value = doc.status;
            if (resolutionTeamInput) resolutionTeamInput.value = doc.crew_name;
            if (followUpInput) followUpInput.value = doc.followUp ? doc.followUp : "No";
        } else {
            console.log(`Modal with ID modal-${doc.$id} not found.`);
        }
    } else {
        console.log(`Row with ID ${doc.$id} not found.`);
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

