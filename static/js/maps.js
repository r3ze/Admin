// Define a custom blinking red icon
var blinkingRedIcon = L.divIcon({
    className: 'blinking-marker',
    iconSize: [30, 30]
});

// Pagsanjan
var map = L.map('mapPagsanjan').setView([14.2811, 121.4575], 15); // Center the map at San Isidro, Pagsanjan and zoom in

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Use AJAX to fetch complaints data from Flask route
fetch('/complaints_data')
    .then(response => response.json())
    .then(data => {
        console.log('Complaints data:', data); // Log the fetched data
        data.forEach(complaint => {
            if (complaint.latitude !== null && complaint.longitude !== null) {
                // Determine the appropriate class for the complaint type
                let markerClass = '';
                switch (complaint.complaint_description) {
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
                var marker = L.marker([complaint.latitude, complaint.longitude], {
                    icon: L.divIcon({
                        className: markerClass,
                        iconSize: [30, 30]
                    })
                }).addTo(map);
                
                // Bind popup with complaint description
                marker.bindPopup(complaint.complaint_description).openPopup();
            }
        });
    });