/**
 * MixTrip Summer - Trip Page JavaScript
 * Contains functionality for trip-related pages
 */

document.addEventListener('DOMContentLoaded', () => {
  // Trip Detail Page
  
  // Like Button Functionality
  const likeButton = document.querySelector('.like-button');
  if (likeButton) {
    likeButton.addEventListener('click', async () => {
      const tripId = likeButton.dataset.tripId;
      const isLiked = likeButton.dataset.liked === 'true';
      
      try {
        const response = await fetch(`/trips/${tripId}/like`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Update UI
          likeButton.classList.toggle('far');
          likeButton.classList.toggle('fas');
          likeButton.dataset.liked = data.liked.toString();
          
          // Update like count
          const likeCount = document.getElementById('like-count');
          if (likeCount) {
            likeCount.textContent = `${data.likeCount} likes`;
          }
        } else {
          if (response.status === 401) {
            // Redirect to login if not authenticated
            window.location.href = `/auth/login?redirect=/trips/${tripId}`;
          } else {
            console.error('Failed to toggle like');
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    });
  }
  
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
  
  // Upload Cover Image Modal
  const uploadCoverModal = initModal('uploadCoverModal', '.upload-cover-btn');
  if (uploadCoverModal) {
    const coverUploadForm = document.getElementById('coverUploadForm');
    
    coverUploadForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const tripId = document.querySelector('.delete-trip-btn').dataset.tripId;
      const coverImage = document.getElementById('coverImage').files[0];
      
      if (!coverImage) {
        alert('Please select an image to upload');
        return;
      }
      
      const formData = new FormData();
      formData.append('coverImage', coverImage);
      
      try {
        const response = await fetch(`/trips/${tripId}/upload-cover`, {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Update cover image
          const tripHeader = document.querySelector('.trip-header');
          tripHeader.style.backgroundImage = `url('/images/trips/${data.data.coverImage}')`;
          
          // Close modal
          uploadCoverModal.classList.remove('is-active');
          
          // Reset form
          coverUploadForm.reset();
        } else {
          alert('Failed to upload cover image');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while uploading the image');
      }
    });
  }
  
  // Delete Trip Modal
  const deleteTripModal = initModal('deleteTripModal', '.delete-trip-btn');
  if (deleteTripModal) {
    const deleteButton = document.querySelector('.delete-trip-btn');
    const deleteTripForm = document.getElementById('deleteTripForm');
    
    if (deleteButton && deleteTripForm) {
      const tripId = deleteButton.dataset.tripId;
      
      deleteTripForm.setAttribute('action', `/trips/${tripId}/delete`);
    }
  }
  
  // Add Activity Modal
  const addActivityModal = initModal('addActivityModal', '.add-activity-btn');
  if (addActivityModal) {
    const addActivityButtons = document.querySelectorAll('.add-activity-btn');
    const addActivityForm = document.getElementById('addActivityForm');
    
    addActivityButtons.forEach(button => {
      button.addEventListener('click', () => {
        const day = button.dataset.day;
        document.getElementById('activityDay').value = day;
      });
    });
    
    if (addActivityForm) {
      addActivityForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const tripId = document.querySelector('.delete-trip-btn')?.dataset.tripId;
        
        if (!tripId) {
          console.error('Trip ID not found');
          return;
        }
        
        // Collect form data
        const formData = new FormData(addActivityForm);
        const activity = {
          day: parseInt(formData.get('day')),
          title: formData.get('title'),
          location: formData.get('location') || null,
          startTime: formData.get('startTime') || null,
          endTime: formData.get('endTime') || null,
          description: formData.get('description') || null,
          notes: formData.get('notes') || null
        };
        
        try {
          const response = await fetch(`/trips/${tripId}/activities`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(activity)
          });
          
          if (response.ok) {
            // Refresh page to show new activity
            window.location.reload();
          } else {
            alert('Failed to add activity');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred while adding the activity');
        }
      });
    }
  }
  
  // Share Trip Modal
  const shareTripModal = initModal('shareTripModal', '.share-trip-btn');
  if (shareTripModal) {
    const copyLinkBtn = shareTripModal.querySelector('.copy-link-btn');
    const shareLinkInput = document.getElementById('shareLinkInput');
    
    if (copyLinkBtn && shareLinkInput) {
      copyLinkBtn.addEventListener('click', () => {
        shareLinkInput.select();
        document.execCommand('copy');
        
        const originalText = copyLinkBtn.textContent;
        copyLinkBtn.textContent = 'Copied!';
        
        setTimeout(() => {
          copyLinkBtn.textContent = originalText;
        }, 2000);
      });
    }
  }
  
  // Create Itinerary Button
  const createItineraryBtn = document.querySelector('.create-itinerary-btn');
  if (createItineraryBtn) {
    const tripId = document.querySelector('.delete-trip-btn')?.dataset.tripId;
    
    createItineraryBtn.addEventListener('click', async () => {
      // Generate a new itinerary based on trip duration
      try {
        const response = await fetch(`/trips/${tripId}/create-itinerary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          // Refresh page to show new itinerary
          window.location.reload();
        } else {
          alert('Failed to create itinerary');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while creating the itinerary');
      }
    });
  }
  
  // Add Location Button
  const addLocationBtn = document.querySelector('.add-location-btn');
  if (addLocationBtn) {
    addLocationBtn.addEventListener('click', () => {
      // Redirect to location search page
      const tripId = document.querySelector('.delete-trip-btn')?.dataset.tripId;
      window.location.href = `/locations/search?tripId=${tripId}`;
    });
  }
  
  // Trip Create/Edit Page
  const tripForm = document.querySelector('.trip-form');
  if (tripForm) {
    // Date validation
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput && endDateInput) {
      // Update min date on end date input when start date changes
      startDateInput.addEventListener('change', () => {
        if (startDateInput.value) {
          endDateInput.min = startDateInput.value;
          
          // If end date is before start date, clear it
          if (endDateInput.value && endDateInput.value < startDateInput.value) {
            endDateInput.value = '';
          }
        }
      });
    }
    
    // Tag input enhancements
    const tagInput = document.getElementById('tags');
    if (tagInput) {
      // Convert comma-separated tags to badges
      tagInput.addEventListener('blur', () => {
        const tags = tagInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        if (tags.length > 0) {
          tagInput.value = tags.join(', ');
        }
      });
    }
  }
});
