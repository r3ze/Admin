const client = new Appwrite.Client();
const collectionId = '6626029b134a98006f77'; 

const database = new Appwrite.Databases(client);
// Set up Appwrite client
client
    .setEndpoint('https://cloud.appwrite.io/v1') 
    .setProject('662248657f5bd3dd103c'); 

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
  const tableBody = document.getElementById('tableBody');
  const row = document.createElement('tr');
  row.id = doc.$id;
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

    row.innerHTML = `
    <td>${doc.$id}</td>
    <td>${doc.consumer_name}</td>
    <td>${doc.description}</td>
     <td> <span class="${priorityBadgeClass}">${priority}</span></td>
    <td style="items-center">${formattedDate} ${formattedTime}</td>
        <td class="status-cell" id="status-${doc.$id}">
            <span class="${statusBadgeClass}" style="padding: 5px 10px; border-radius: 20px;">${doc.status}</span>
        </td>
 
`;

// Append the row to the top of the table
if (tableBody.firstChild) {
    tableBody.insertBefore(row, tableBody.firstChild);
} else {
    tableBody.appendChild(row);
} 




})
.catch((error) => {
    console.error('Error calculating priority:', error);
});





}


function updateRowInTable(doc) {
    const row = document.getElementById(doc.$id);

   // Format the createdAt date
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
    if (row) {


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
        row.innerHTML = `
            <td>${doc.$id}</td>
            <td>${doc.consumer_name}</td>
            <td>${doc.description}</td>
            <span class="${priorityBadgeClass}">${priority}</span>,
            <td>${formattedDate} ${formattedTime}</td>
             <td class="status-cell" id="status-${doc.$id}">
                <span class="${statusBadgeClass}" style="padding: 5px 10px; border-radius: 20px;">${doc.status}</span>
            </td>
       
           
        `;

    }}


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