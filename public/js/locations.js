/**
 * MixTrip Summer - Locations JavaScript
 * Contains functionality for location-related pages
 */

document.addEventListener('DOMContentLoaded', () => {
  // Location Detail Page
  
  // Modal Management
  function initModal(modalId, triggerSelector) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const triggers = document.querySelectorAll(triggerSelector);
    const closeButtons = modal.querySelectorAll('.modal-close, .modal-cancel');
    
    // Open modal
    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        modal.classList.add('is-active');
      });
    });
    
    // Close modal
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        modal.classList.remove('is-active');
      });
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.classList.remove('is-active');
      }
    });
    
    // Close modal on escape key press
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('is-active')) {
        modal.classList.remove('is-active');
      }
    });
    
    return modal;
  }
  
  // Edit Location Modal
  const editLocationModal = initModal('editLocationModal', '.edit-location-btn');
  if (editLocationModal) {
    const editLocationForm = document.getElementById('editLocationForm');
    const editButton = document.querySelector('.edit-location-btn');
    
    if (editLocationForm && editButton) {
      const locationId = editButton.dataset.locationId;
      
      editLocationForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Collect form data
        const formData = new FormData(editLocationForm);
        
        // Handle multi-select for types
        const typeSelect = document.getElementById('locationType');
        const selectedTypes = Array.from(typeSelect.selectedOptions).map(option => option.value);
        
        // Parse tags from comma-separated list
        const tagsInput = formData.get('tags');
        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(Boolean) : [];
        
        // Build the data object
        const locationData = {
          name: formData.get('name'),
          description: formData.get('description'),
          types: selectedTypes,
          website: formData.get('website'),
          contactInfo: {
            phone: formData.get('contactInfo.phone'),
            email: formData.get('contactInfo.email')
          },
          tags
        };
        
        try {
          const response = await fetch(`/locations/${locationId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(locationData)
          });
          
          if (response.ok) {
            // Refresh page to show updated data
            window.location.reload();
          } else {
            alert('Failed to update location');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred while updating the location');
        }
      });
    }
  }
  
  // Delete Location Modal
  const deleteLocationModal = initModal('deleteLocationModal', '.delete-location-btn');
  if (deleteLocationModal) {
    const deleteButton = document.querySelector('.delete-location-btn');
    const confirmDeleteButton = document.querySelector('.confirm-delete-btn');
    
    if (deleteButton && confirmDeleteButton) {
      const locationId = deleteButton.dataset.locationId;
      
      confirmDeleteButton.addEventListener('click', async () => {
        try {
          const response = await fetch(`/locations/${locationId}`, {
            method: 'DELETE'
          });
          
          if (response.ok) {
            // Redirect to user trips or home page
            window.location.href = '/trips/my-trips';
          } else {
            alert('Failed to delete location');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred while deleting the location');
        }
      });
    }
  }
  
  // Add to Trip functionality
  const addToTripButton = document.querySelector('.add-to-trip-btn');
  const tripSelect = document.getElementById('tripSelect');
  
  if (addToTripButton && tripSelect) {
    const locationId = addToTripButton.dataset.locationId;
    
    // Populate trip select with user's trips
    async function loadUserTrips() {
      try {
        const response = await fetch('/trips/my-trips/list-json');
        
        if (response.ok) {
          const trips = await response.json();
          
          tripSelect.innerHTML = '<option value="">-- Select a Trip --</option>';
          
          trips.forEach(trip => {
            const option = document.createElement('option');
            option.value = trip._id;
            option.textContent = trip.title;
            tripSelect.appendChild(option);
          });
        } else {
          console.error('Failed to load trips');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
    
    loadUserTrips();
    
    // Handle add to trip button click
    addToTripButton.addEventListener('click', async () => {
      const tripId = tripSelect.value;
      
      if (!tripId) {
        alert('Please select a trip');
        return;
      }
      
      try {
        const response = await fetch(`/locations/${locationId}/add-to-trip/${tripId}`, {
          method: 'POST'
        });
        
        if (response.ok) {
          alert('Location added to trip successfully');
          // Could redirect to trip page
          // window.location.href = `/trips/${tripId}`;
        } else {
          alert('Failed to add location to trip');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding the location to trip');
      }
    });
  }
  
  // Location Search Page
  const searchButton = document.getElementById('searchButton');
  const locationSearchInput = document.getElementById('locationSearchInput');
  const typeFilter = document.getElementById('typeFilter');
  const resultsList = document.getElementById('resultsList');
  const resultsCountDisplay = document.getElementById('resultsCountDisplay');
  
  if (searchButton && locationSearchInput) {
    // Handle search button click
    searchButton.addEventListener('click', () => {
      performSearch();
    });
    
    // Handle enter key in search input
    locationSearchInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        performSearch();
      }
    });
    
    // Perform search function
    async function performSearch() {
      const query = locationSearchInput.value.trim();
      const type = typeFilter.value;
      
      if (!query) {
        showEmptyResults('Please enter a search term');
        return;
      }
      
      try {
        const url = new URL('/locations/search', window.location.origin);
        url.searchParams.append('query', query);
        if (type !== 'all') {
          url.searchParams.append('type', type);
        }
        url.searchParams.append('limit', 20);
        
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          displaySearchResults(data.data);
        } else {
          showEmptyResults('Error performing search');
        }
      } catch (error) {
        console.error('Error:', error);
        showEmptyResults('Error performing search');
      }
    }
    
    // Display search results
    function displaySearchResults(locations) {
      if (!locations || locations.length === 0) {
        showEmptyResults('No locations found matching your search');
        return;
      }
      
      // Update results count
      resultsCountDisplay.textContent = `${locations.length} locations found`;
      
      // Clear previous results
      resultsList.innerHTML = '';
      
      // Add each location to the results list
      locations.forEach(location => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.dataset.id = location._id;
        resultItem.dataset.lat = location.coordinates.lat;
        resultItem.dataset.lng = location.coordinates.lng;
        
        resultItem.innerHTML = `
          <div class="result-icon">
            <i class="fas fa-map-marker-alt"></i>
          </div>
          <div class="result-info">
            <h3 class="result-name">${location.name}</h3>
            ${location.address ? `
              <div class="result-address">
                ${location.address.formattedAddress || ''}
                ${!location.address.formattedAddress && location.address.city ? location.address.city : ''}
                ${!location.address.formattedAddress && location.address.country ? ', ' + location.address.country : ''}
              </div>
            ` : ''}
            ${location.types && location.types.length ? `
              <div class="result-types">
                ${location.types.map(type => `<span class="result-type">${type}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        `;
        
        // Add click event to select this location
        resultItem.addEventListener('click', () => {
          // This would trigger a marker click or some other action
          const lat = parseFloat(resultItem.dataset.lat);
          const lng = parseFloat(resultItem.dataset.lng);
          
          // We would normally call a function to focus the map on this location
          // For example: focusMapOnLocation(lat, lng);
          
          // Highlight the selected item
          const activeItems = document.querySelectorAll('.result-item.active');
          activeItems.forEach(item => item.classList.remove('active'));
          resultItem.classList.add('active');
        });
        
        resultsList.appendChild(resultItem);
      });
    }
    
    // Show empty results message
    function showEmptyResults(message) {
      resultsCountDisplay.textContent = '0 locations found';
      
      resultsList.innerHTML = `
        <div class="empty-results">
          <i class="fas fa-search"></i>
          <p>${message || 'No results found'}</p>
          <p class="hint">Try different keywords or filters</p>
        </div>
      `;
    }
  }
  
  // Create Location Modal
  const createLocationModal = initModal('createLocationModal', '#createLocationBtn');
  if (createLocationModal) {
    const createLocationForm = document.getElementById('createLocationForm');
    const latInput = document.getElementById('newLocationLat');
    const lngInput = document.getElementById('newLocationLng');
    
    if (createLocationForm) {
      // Set initial coordinates (e.g., to Bangkok)
      latInput.value = 13.7563; 
      lngInput.value = 100.5018;
      
      // Add validators for important fields
      const nameInput = document.getElementById('newLocationName');
      const validateCoordinates = () => {
        const lat = parseFloat(latInput.value);
        const lng = parseFloat(lngInput.value);
        
        if (isNaN(lat) || lat < -90 || lat > 90) {
          latInput.setCustomValidity('Latitude must be between -90 and 90');
          return false;
        } else {
          latInput.setCustomValidity('');
        }
        
        if (isNaN(lng) || lng < -180 || lng > 180) {
          lngInput.setCustomValidity('Longitude must be between -180 and 180');
          return false;
        } else {
          lngInput.setCustomValidity('');
        }
        
        return true;
      };
      
      // Validate name input
      nameInput.addEventListener('input', () => {
        if (nameInput.value.trim().length < 2) {
          nameInput.setCustomValidity('Name must be at least 2 characters');
        } else if (nameInput.value.trim().length > 100) {
          nameInput.setCustomValidity('Name must be less than 100 characters');
        } else {
          nameInput.setCustomValidity('');
        }
      });
      
      // Validate coordinates on input
      latInput.addEventListener('input', validateCoordinates);
      lngInput.addEventListener('input', validateCoordinates);
      
      // Handle form submission
      createLocationForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Validate form inputs
        if (!validateCoordinates()) {
          return;
        }
        
        // Collect form data
        const formData = new FormData(createLocationForm);
        
        // Handle multi-select for types
        const typeSelect = document.getElementById('newLocationType');
        const selectedTypes = Array.from(typeSelect.selectedOptions).map(option => option.value);
        
        // Parse tags from comma-separated list
        const tagsInput = formData.get('tags');
        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(Boolean) : [];
        
        // Generate a formatted address if not provided but individual address parts exist
        const street = formData.get('address.street') || '';
        const city = formData.get('address.city') || '';
        const state = formData.get('address.state') || '';
        const country = formData.get('address.country') || '';
        const postalCode = formData.get('address.postalCode') || '';
        
        // Build a formatted address from parts if available
        let formattedAddress = '';
        if (street) formattedAddress += street;
        if (city) {
          if (formattedAddress) formattedAddress += ', ';
          formattedAddress += city;
        }
        if (state) {
          if (formattedAddress) formattedAddress += ', ';
          formattedAddress += state;
        }
        if (country) {
          if (formattedAddress) formattedAddress += ', ';
          formattedAddress += country;
        }
        if (postalCode) {
          if (formattedAddress) formattedAddress += ' ';
          formattedAddress += postalCode;
        }
        
        // Build the location data object
        const locationData = {
          name: formData.get('name'),
          description: formData.get('description'),
          coordinates: {
            lat: parseFloat(formData.get('coordinates.lat')),
            lng: parseFloat(formData.get('coordinates.lng'))
          },
          address: {
            street: street,
            city: city,
            state: state,
            country: country,
            postalCode: postalCode,
            formattedAddress: formattedAddress
          },
          types: selectedTypes,
          website: formData.get('website') || '',
          contactInfo: {
            phone: formData.get('contactInfo.phone') || '',
            email: formData.get('contactInfo.email') || ''
          },
          tags
        };
        
        // Add tripId if it exists
        const tripId = formData.get('tripId');
        if (tripId) {
          locationData.tripId = tripId;
        }
        
        // Add loading indicator
        const submitButton = createLocationForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        
        try {
          const response = await fetch('/locations/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            body: JSON.stringify(locationData)
          });
          
          // Reset button state
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonText;
          
          if (response.ok) {
            const data = await response.json();
            
            // Close modal
            createLocationModal.classList.remove('is-active');
            
            // Show success message
            const successAlert = document.createElement('div');
            successAlert.className = 'alert alert-success';
            successAlert.innerHTML = `
              <i class="fas fa-check-circle"></i>
              <span>Location created successfully!</span>
              <button class="alert-close">&times;</button>
            `;
            document.querySelector('.search-content').prepend(successAlert);
            
            // Auto-remove alert after 5 seconds
            setTimeout(() => {
              successAlert.remove();
            }, 5000);
            
            // Close button functionality
            const closeButton = successAlert.querySelector('.alert-close');
            if (closeButton) {
              closeButton.addEventListener('click', () => {
                successAlert.remove();
              });
            }
            
            // Reset form
            createLocationForm.reset();
            
            // Redirect to the new location's detail page or back to trip
            if (tripId) {
              window.location.href = `/trips/${tripId}`;
            } else {
              window.location.href = `/locations/${data.data.location._id}`;
            }
          } else {
            // Handle error
            const errorData = await response.json();
            const errorMessage = errorData.message || 'Failed to create location';
            
            // Show error message
            const errorAlert = document.createElement('div');
            errorAlert.className = 'alert alert-error';
            errorAlert.innerHTML = `
              <i class="fas fa-exclamation-circle"></i>
              <span>${errorMessage}</span>
              <button class="alert-close">&times;</button>
            `;
            createLocationModal.querySelector('.modal-body').prepend(errorAlert);
            
            // Close button functionality
            const closeButton = errorAlert.querySelector('.alert-close');
            if (closeButton) {
              closeButton.addEventListener('click', () => {
                errorAlert.remove();
              });
            }
          }
        } catch (error) {
          console.error('Error:', error);
          
          // Reset button state
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonText;
          
          // Show error message
          const errorAlert = document.createElement('div');
          errorAlert.className = 'alert alert-error';
          errorAlert.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>An error occurred while creating the location</span>
            <button class="alert-close">&times;</button>
          `;
          createLocationModal.querySelector('.modal-body').prepend(errorAlert);
          
          // Close button functionality
          const closeButton = errorAlert.querySelector('.alert-close');
          if (closeButton) {
            closeButton.addEventListener('click', () => {
              errorAlert.remove();
            });
          }
        }
      });
    }
  }
});