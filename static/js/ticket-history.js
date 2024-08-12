const client = new Appwrite.Client();
const collectionId = '6626029b134a98006f77'; 

// Set up Appwrite client
client
    .setEndpoint('https://cloud.appwrite.io/v1') 
    .setProject('662248657f5bd3dd103c'); 

// Listen to real-time events on the collection
client.subscribe('databases.66224a152d9f9a67af78.collections.6626029b134a98006f77.documents', response => {
    const event = response.events[0];
    const document = response.payload;

    console.log('Real-time event received:', response);
    console.log('Event:', event);
    
    if (event.includes('create')) {
        console.log("Create event matched");
        addRowToTable(document);
    } else if (event.includes('update')) {
        console.log("Update event matched");
        updateRowInTable(document);
    } else if (event.includes('delete')) {
        console.log("Delete event received with document ID:", document.$id);
        deleteRowFromTable(document.$id);
    }
});

// Function to add a row to the table
function addRowToTable(doc) {
    const tableBody = document.querySelector('.complaints-table tbody');
    const row = document.createElement('tr');
    row.id = doc.$id;

    const resolvedAt = doc.resolvedAt ? new Date(doc.resolvedAt) : null;
    const formattedResolvedAt = resolvedAt ? resolvedAt.toLocaleDateString() : "Not Resolved";

    row.innerHTML = `
        <td>${doc.$id}</td>
        <td>${doc.consumer_name}</td>
        <td>${doc.description}</td>
        <td><a href="#" class="view-image" data-image="${doc.image}" style="text-decoration: none;" data-bs-toggle="modal" data-bs-target="#imageModal">View</a></td>
        <td>${formattedResolvedAt}</td>
        <td>${doc.crew_name || "Not Assigned"}</td>
        <td><button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal-${doc.$id}">View More</button></td>
    `;

    // Append the row to the top of the table
    if (tableBody.firstChild) {
        tableBody.insertBefore(row, tableBody.firstChild);
    } else {
        tableBody.appendChild(row);
    }

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
                                    <input type="text" class="form-control" id="additionalDetails" disabled value="${doc.additionalDetails || ''}">
                                </div>
                            </div>
                            <div class="mb-3 row">
                                <label for="address" class="col-sm-3 col-form-label">Address</label>
                                <div class="col-sm-9">
                                    <input type="text" class="form-control" id="address" disabled value="${doc.locationName || ''}">
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
                                    <input type="text" class="form-control" id="dateCreated" disabled value="${doc.createdAt.substring(0, 10)}">
                                </div>
                            </div>
                            <div class="mb-3 row">
                                <label for="dateAssigned" class="col-sm-3 col-form-label">Date Assigned</label>
                                <div class="col-sm-9">
                                    <input type="text" class="form-control" id="dateAssigned" disabled value="${doc.assignedAt ? doc.assignedAt.substring(0, 10) : 'Not Assigned'}">
                                </div>
                            </div>
                            <div class="mb-3 row">
                                <label for="dateResolved" class="col-sm-3 col-form-label">Date Resolved</label>
                                <div class="col-sm-9">
                                    <input type="text" class="form-control" id="dateResolved" disabled value="${doc.resolvedAt ? doc.resolvedAt.substring(0, 10) : 'Not Resolved'}">
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
                                    <input type="text" class="form-control" id="resolutionTeam" disabled value="${doc.crew_name || 'Not Assigned'}">
                                </div>
                            </div>
                            <div class="mb-3 row">
                                <label for="followUp" class="col-sm-3 col-form-label">Followed Up By Consumer</label>
                                <div class="col-sm-9">
                                    <input type="text" class="form-control" id="followUp" disabled value="${doc.followUp}">
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
}

function updateRowInTable(doc) {
    const row = document.getElementById(doc.$id);

    const resolvedAt = doc.resolvedAt ? new Date(doc.resolvedAt) : null;
    const formattedResolvedAt = resolvedAt ? resolvedAt.toLocaleDateString() : "Not Resolved";

    if (row) {
        row.innerHTML = `
            <td>${doc.$id}</td>
            <td>${doc.consumer_name}</td>
            <td>${doc.description}</td>
            <td><a href="#" class="view-image" data-image="${doc.image}" style="text-decoration: none;" data-bs-toggle="modal" data-bs-target="#imageModal">View</a></td>
            <td>${formattedResolvedAt}</td>
            <td>${doc.crew_name || "Not Assigned"}</td>
            <td><button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal-${doc.$id}">View More</button></td>
        `;

        // Update the modal content if necessary
        const modal = document.getElementById(`modal-${doc.$id}`);
        if (modal) {
            modal.querySelector('#complaintStatus').value = doc.status;
            modal.querySelector('#resolutionTeam').value = doc.crew_name || 'Not Assigned';
            modal.querySelector('#dateResolved').value = formattedResolvedAt;
            modal.querySelector('#followUp').value = doc.followUp;
        }
    }
}

function deleteRowFromTable(documentId) {
    const row = document.getElementById(documentId);
    if (row) {
        row.remove();
    }
}
