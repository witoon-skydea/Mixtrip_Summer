/**
 * MixTrip Summer - Maps JavaScript
 * Contains functionality for maps
 */

document.addEventListener('DOMContentLoaded', () => {
  // Trip Map Initialization
  const tripMap = document.getElementById('tripMap');
  
  if (tripMap) {
    // Load Google Maps API
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
      // Create script element for Google Maps API
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places';
      script.defer = true;
      script.async = true;
      
      // Initialize map when API is loaded
      script.onload = initMap;
      
      // Append script to document
      document.head.appendChild(script);
    } else {
      // API already loaded, initialize map
      initMap();
    }
  }
  
  // Initialize map
  function initMap() {
    // Get locations data from data-locations attribute
    const locationsData = tripMap.dataset.locations;
    const locations = locationsData ? JSON.parse(locationsData) : [];
    
    // Create map instance
    const map = new google.maps.Map(tripMap, {
      zoom: locations.length ? 12 : 2, // Default zoom
      center: locations.length ? { lat: locations[0].coordinates.lat, lng: locations[0].coordinates.lng } : { lat: 13.7563, lng: 100.5018 }, // Default to Bangkok if no locations
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        position: google.maps.ControlPosition.TOP_RIGHT
      },
      streetViewControl: true,
      fullscreenControl: true
    });
    
    // If no locations, show placeholder
    if (!locations.length) {
      // Show placeholder message
      const placeholderDiv = document.createElement('div');
      placeholderDiv.className = 'map-placeholder';
      placeholderDiv.innerHTML = `
        <i class="fas fa-map-marked-alt"></i>
        <p>No locations added yet</p>
      `;
      
      tripMap.appendChild(placeholderDiv);
      return;
    }
    
    // Add markers for each location
    const markers = [];
    const bounds = new google.maps.LatLngBounds();
    
    locations.forEach((location, index) => {
      // Skip if coordinates are missing
      if (!location.coordinates || !location.coordinates.lat || !location.coordinates.lng) {
        return;
      }
      
      const position = { 
        lat: parseFloat(location.coordinates.lat), 
        lng: parseFloat(location.coordinates.lng) 
      };
      
      // Create marker
      const marker = new google.maps.Marker({
        position,
        map,
        title: location.name,
        label: {
          text: (index + 1).toString(),
          color: 'white'
        },
        animation: google.maps.Animation.DROP
      });
      
      // Add marker to array
      markers.push(marker);
      
      // Extend bounds to include this position
      bounds.extend(position);
      
      // Create info window with location details
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="map-info-window">
            <h3>${location.name}</h3>
            ${location.address ? `
              <p>
                ${location.address.formattedAddress || ''}
                ${!location.address.formattedAddress && location.address.city ? location.address.city : ''}
                ${!location.address.formattedAddress && location.address.country ? ', ' + location.address.country : ''}
              </p>
            ` : ''}
            ${location.types && location.types.length ? `
              <p>
                <strong>Type:</strong> ${location.types.join(', ')}
              </p>
            ` : ''}
            <a href="/locations/${location._id}" target="_blank">View Details</a>
          </div>
        `
      });
      
      // Add click event listener for marker
      marker.addListener('click', () => {
        // Close all open info windows
        markers.forEach(m => {
          if (m.infoWindow && m.infoWindow.getMap()) {
            m.infoWindow.close();
          }
        });
        
        // Open this info window
        infoWindow.open(map, marker);
        marker.infoWindow = infoWindow;
      });
    });
    
    // Fit map to bounds
    if (markers.length > 0) {
      map.fitBounds(bounds);
      
      // If only one marker, zoom out a bit
      if (markers.length === 1) {
        map.setZoom(15);
      }
    }
    
    // Create polyline to connect locations in order
    if (locations.length > 1) {
      const path = locations.map(location => ({
        lat: parseFloat(location.coordinates.lat),
        lng: parseFloat(location.coordinates.lng)
      }));
      
      const polyline = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#1e88e5',
        strokeOpacity: 0.8,
        strokeWeight: 3
      });
      
      polyline.setMap(map);
    }
  }
  
  // Location Map for Location Detail Page
  const locationMap = document.getElementById('locationMap');
  
  if (locationMap) {
    // Initialize location map when API is loaded
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places';
      script.defer = true;
      script.async = true;
      script.onload = initLocationMap;
      document.head.appendChild(script);
    } else {
      initLocationMap();
    }
  }
  
  // Initialize location map
  function initLocationMap() {
    // Get location data
    const lat = parseFloat(locationMap.dataset.lat);
    const lng = parseFloat(locationMap.dataset.lng);
    const locationName = locationMap.dataset.name;
    
    if (isNaN(lat) || isNaN(lng)) {
      // Show placeholder if coordinates are invalid
      locationMap.innerHTML = `
        <div class="map-placeholder">
          <i class="fas fa-map-marker-alt"></i>
          <p>Location coordinates unavailable</p>
        </div>
      `;
      return;
    }
    
    // Create map instance
    const map = new google.maps.Map(locationMap, {
      zoom: 15,
      center: { lat, lng },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true
    });
    
    // Create marker
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      title: locationName,
      animation: google.maps.Animation.DROP
    });
    
    // Create info window
    const infoWindow = new google.maps.InfoWindow({
      content: `<div class="map-info-window"><h3>${locationName}</h3></div>`
    });
    
    // Open info window on marker click
    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });
  }
  
  // Location Search Map
  const locationSearchMap = document.getElementById('locationSearchMap');
  
  if (locationSearchMap) {
    // Initialize location search map when API is loaded
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places';
      script.defer = true;
      script.async = true;
      script.onload = initLocationSearchMap;
      document.head.appendChild(script);
    } else {
      initLocationSearchMap();
    }
  }
  
  // Initialize location search map
  function initLocationSearchMap() {
    // Default center on Bangkok
    const center = { lat: 13.7563, lng: 100.5018 };
    
    // Create map instance
    const map = new google.maps.Map(locationSearchMap, {
      zoom: 12,
      center,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: true,
      fullscreenControl: true
    });
    
    // Custom marker for manual location creation
    let customMarker = null;
    
    // Create search box
    const input = document.getElementById('locationSearchInput');
    const searchBox = new google.maps.places.SearchBox(input);
    
    // Bias search box results to current map viewport
    map.addListener('bounds_changed', () => {
      searchBox.setBounds(map.getBounds());
    });
    
    // Load existing locations if any
    const existingLocationsData = locationSearchMap.dataset.existingLocations;
    const existingLocations = existingLocationsData ? JSON.parse(existingLocationsData) : [];
    
    // Add markers for existing locations
    const existingMarkers = [];
    
    if (existingLocations.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      
      existingLocations.forEach(location => {
        // Skip if coordinates are missing
        if (!location.coordinates || !location.coordinates.lat || !location.coordinates.lng) {
          return;
        }
        
        const position = { 
          lat: parseFloat(location.coordinates.lat), 
          lng: parseFloat(location.coordinates.lng) 
        };
        
        // Create marker
        const marker = new google.maps.Marker({
          position,
          map,
          title: location.name,
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          }
        });
        
        // Add marker to array
        existingMarkers.push(marker);
        
        // Extend bounds to include this position
        bounds.extend(position);
        
        // Create info window with location details
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="map-info-window">
              <h3>${location.name}</h3>
              <p>Already added to your trip</p>
            </div>
          `
        });
        
        // Add click event listener for marker
        marker.addListener('click', () => {
          // Close all open info windows
          existingMarkers.forEach(m => {
            if (m.infoWindow && m.infoWindow.getMap()) {
              m.infoWindow.close();
            }
          });
          
          // Open this info window
          infoWindow.open(map, marker);
          marker.infoWindow = infoWindow;
        });
      });
      
      // Fit map to bounds
      if (existingMarkers.length > 0) {
        map.fitBounds(bounds);
      }
    }
    
    // Add click listener to the map for custom location creation
    map.addListener('click', (event) => {
      const location = event.latLng;
      
      // Remove previous custom marker if exists
      if (customMarker) {
        customMarker.setMap(null);
      }
      
      // Create new custom marker
      customMarker = new google.maps.Marker({
        position: location,
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
        }
      });
      
      // Update coordinates in the form
      const createLocationModal = document.getElementById('createLocationModal');
      const latInput = document.getElementById('newLocationLat');
      const lngInput = document.getElementById('newLocationLng');
      
      if (latInput && lngInput) {
        latInput.value = location.lat().toFixed(6);
        lngInput.value = location.lng().toFixed(6);
      }
      
      // Open the create location modal
      if (createLocationModal) {
        createLocationModal.classList.add('is-active');
      }
      
      // Add drag listener to update coordinates when marker is moved
      customMarker.addListener('dragend', () => {
        const newPosition = customMarker.getPosition();
        if (latInput && lngInput) {
          latInput.value = newPosition.lat().toFixed(6);
          lngInput.value = newPosition.lng().toFixed(6);
        }
      });
    });
    
    // Handle places changed event
    let markers = [];
    
    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      
      if (places.length === 0) {
        return;
      }
      
      // Clear out old markers
      markers.forEach(marker => {
        marker.setMap(null);
      });
      markers = [];
      
      // Create bounds object
      const bounds = new google.maps.LatLngBounds();
      
      // Process each place
      places.forEach(place => {
        if (!place.geometry || !place.geometry.location) {
          console.log('Returned place contains no geometry');
          return;
        }
        
        // Create marker for place
        const marker = new google.maps.Marker({
          map,
          title: place.name,
          position: place.geometry.location,
          animation: google.maps.Animation.DROP
        });
        
        markers.push(marker);
        
        // Create info window with place details
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="map-info-window">
              <h3>${place.name}</h3>
              <p>${place.formatted_address || ''}</p>
              <button id="addPlaceBtn" class="btn btn-primary btn-sm">Add to Trip</button>
            </div>
          `
        });
        
        // Add click event listener for marker
        marker.addListener('click', () => {
          // Close all open info windows
          markers.forEach(m => {
            if (m.infoWindow && m.infoWindow.getMap()) {
              m.infoWindow.close();
            }
          });
          
          // Open this info window
          infoWindow.open(map, marker);
          marker.infoWindow = infoWindow;
          
          // Handle add place button click
          setTimeout(() => {
            const addPlaceBtn = document.getElementById('addPlaceBtn');
            if (addPlaceBtn) {
              addPlaceBtn.addEventListener('click', () => {
                addPlaceToTrip(place);
                infoWindow.close();
              });
            }
          }, 100);
        });
        
        // If single place, open info window automatically
        if (places.length === 1) {
          infoWindow.open(map, marker);
          marker.infoWindow = infoWindow;
          
          // Handle add place button click
          setTimeout(() => {
            const addPlaceBtn = document.getElementById('addPlaceBtn');
            if (addPlaceBtn) {
              addPlaceBtn.addEventListener('click', () => {
                addPlaceToTrip(place);
                infoWindow.close();
              });
            }
          }, 100);
        }
        
        // Extend bounds with place geometry
        if (place.geometry.viewport) {
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      
      // Fit map to bounds
      map.fitBounds(bounds);
    });
  }
  
  // Add Google Place to Trip
  async function addPlaceToTrip(place) {
    const tripId = new URLSearchParams(window.location.search).get('tripId');
    
    if (!tripId) {
      console.error('Trip ID not found in URL');
      return;
    }
    
    // Extract place details
    const location = {
      name: place.name,
      description: '',
      address: {
        formattedAddress: place.formatted_address || '',
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
      },
      coordinates: {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      },
      placeId: place.place_id,
      types: place.types || ['other'],
      website: place.website || '',
      contactInfo: {
        phone: place.formatted_phone_number || '',
        email: ''
      },
      tripId
    };
    
    // Parse address components
    if (place.address_components) {
      place.address_components.forEach(component => {
        const types = component.types;
        
        if (types.includes('street_number') || types.includes('route')) {
          location.address.street += component.long_name + ' ';
        } else if (types.includes('locality') || types.includes('sublocality')) {
          location.address.city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          location.address.state = component.long_name;
        } else if (types.includes('country')) {
          location.address.country = component.long_name;
        } else if (types.includes('postal_code')) {
          location.address.postalCode = component.long_name;
        }
      });
      
      // Trim street address
      location.address.street = location.address.street.trim();
    }
    
    try {
      const response = await fetch('/locations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(location)
      });
      
      if (response.ok) {
        // Show success message
        const resultContainer = document.getElementById('searchResults');
        
        if (resultContainer) {
          const alertDiv = document.createElement('div');
          alertDiv.className = 'alert alert-success';
          alertDiv.textContent = `${place.name} has been added to your trip!`;
          
          resultContainer.prepend(alertDiv);
          
          // Remove alert after 3 seconds
          setTimeout(() => {
            alertDiv.remove();
          }, 3000);
        }
      } else {
        console.error('Failed to add location to trip');
      }
    } catch (error) {
      console.error('Error adding location to trip:', error);
    }
  }
});
