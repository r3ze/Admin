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

    console.log('Real-time event received:', response);
    console.log('Event:', event);
    
    if (event.includes('create')) {
        console.log("Create event matched");
        addMarkerToMap(document);
    } else if (event.includes('update')) {
        console.log("Update event matched");
        updateMarkerOnMap(document); 
    } else if (event.includes('delete')) {
  console.log("Delete event received with document ID:", document.$id);
  removeMarkerFromMap(document.$id);
}
});
const markersC = {};
// Function to add a marker to the map
// Function to add a marker to the map

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
function addMarkerToMap(doc) {
    fetch('/calculate-priority', {
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

                
    if (doc.status !== 'Resolved' && doc.Location) {
        const [latitude, longitude] = doc.Location.split(',').map(coord => parseFloat(coord));

        let markerClass = '';
        switch (doc.description) {
            case 'No Power':
                markerClass = 'blinking-marker power-outage';
                break;
            case 'Defective Meter':
                markerClass = 'blinking-marker defective-meter';
                break;
            case 'Detached Meter':
                markerClass = 'blinking-marker detached-meter';
                break;
            case 'Loose Connection/ Sparkling of Wire':
                markerClass = 'blinking-marker loose-connection';
                break;
            case 'Low Voltage':
                markerClass = 'blinking-marker low-voltage';
                break;
            case 'No Reading':
                markerClass = 'blinking-marker no-reading';
                break;
            default:
                markerClass = 'blinking-marker';
        }

        // Create the marker with the appropriate class
        const marker = L.marker([latitude, longitude], {
            icon: L.divIcon({
                className: markerClass,
                iconSize: [30, 30]
            })
        }).addTo(map);

        const createdAt = new Date(doc.createdAt);
        const formattedDate = ('0' + createdAt.getUTCDate()).slice(-2) + '/' +
            ('0' + (createdAt.getUTCMonth() + 1)).slice(-2) + '/' +
            createdAt.getUTCFullYear();

            const hours = createdAt.getUTCHours();
            const minutes = ('0' + createdAt.getUTCMinutes()).slice(-2);
            const ampm = hours >= 12 ? 'PM' : 'AM';  // Check if it's AM or PM
            const formattedTime = ('0' + (hours % 12 || 12)).slice(-2) + ':' + minutes + ' ' + ampm;

            const formattedResolutionDate = (doc.resolutionStartDate && doc.resolutionEndDate) ? formatDateRange(complaint.resolutionStartDate, complaint.resolutionEndDate): "No date provided"
          // Bind the click event to show modal with complaint details
          marker.on('click', function() {
              // Set the details of the clicked complaint in the modal
              document.getElementById('complaintType').textContent = doc.description || 'Unknown Type';
              document.getElementById('complaintAddress').textContent = doc.locationName;
              document.getElementById('complaintStatus').textContent = doc.status;
             
              
              // Set the date reported and estimated resolution time
              document.getElementById('complaintDateReported').textContent = formattedDate + " "+ formattedTime;
              document.getElementById('complaintEstimatedTime').textContent = formattedResolutionDate;
              document.getElementById('complaintPriority').textContent = priority

            // Show the modal with animation
            const myModal = new bootstrap.Modal(document.getElementById('complaintModal'));
            myModal.show();
        });

        // Store the marker by document ID
        markersC[doc.$id] = marker;
    }
    })

}



// Function to update a marker on the map
function updateMarkerOnMap(doc) {
    // Remove the marker if the complaint is resolved
    if (doc.status === 'Resolved' || doc.status==='Withdrawn') {
        removeMarkerFromMap(doc.$id);
    } else {
        // Otherwise, update the marker on the map
        if (markersC[doc.$id]) {
            removeMarkerFromMap(doc.$id);  // Remove the old marker
        }
        addMarkerToMap(doc);  // Add the updated marker
    }
}

// Function to remove a marker from the map
function removeMarkerFromMap(docId) {
    if (markersC[docId]) {
        map.removeLayer(markersC[docId]);  // Remove the marker from the map
        delete markersC[docId];  // Delete the marker from the markers object
    }
}
 