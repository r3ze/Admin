//Pagsanjan
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
                      // Add marker for the complaint location
                      var marker = L.marker([complaint.latitude, complaint.longitude]).addTo(map);
                      // Bind popup with complaint description
                      marker.bindPopup(complaint.complaint_description);
                  }
              });
          });

          //Lumban
     
          var Lmap = L.map('mapLumban').setView([14.2811, 121.4575], 15); // Center the map at San Isidro, Pagsanjan and zoom in
    
          // Add OpenStreetMap tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }).addTo(Lmap);
    
          // Use AJAX to fetch complaints data from Flask route
          fetch('/complaints_data')
              .then(response => response.json())
              .then(data => {
                console.log('Complaints data:', data); // Log the fetched data
                  data.forEach(complaint => {
                  
                      if (complaint.latitude !== null && complaint.longitude !== null) {
                          // Add marker for the complaint location
                          var marker = L.marker([complaint.latitude, complaint.longitude]).addTo(Lmap);
                          // Bind popup with complaint description
                          marker.bindPopup(complaint.complaint_description);
                      }
                  });
              });
