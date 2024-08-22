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
const markers = {};
// Function to add a marker to the map
// Function to add a marker to the map
function addMarkerToMap(doc) {
    // Only add the marker if the complaint is not resolved
    console.log(doc.status)
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

        const marker = L.marker([latitude, longitude], {
            icon: L.divIcon({
                className: markerClass,
                iconSize: [30, 30]
            })
        }).addTo(map);

        marker.bindPopup(doc.description);
        markers[doc.$id] = marker;  // Store marker by document ID
    }
}


// Function to update a marker on the map
function updateMarkerOnMap(doc) {
    // Remove the marker if the complaint is resolved
    if (doc.status === 'Resolved') {
        removeMarkerFromMap(doc.$id);
    } else {
        // Otherwise, update the marker on the map
        if (markers[doc.$id]) {
            removeMarkerFromMap(doc.$id);  // Remove the old marker
        }
        addMarkerToMap(doc);  // Add the updated marker
    }
}

// Function to remove a marker from the map
function removeMarkerFromMap(docId) {
    if (markers[docId]) {
        map.removeLayer(markers[docId]);  // Remove the marker from the map
        delete markers[docId];  // Delete the marker from the markers object
    }
}
 