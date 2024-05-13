let map;
let marker;

function initMap() {
    const myLatLng = { lat: 0, lng: 0 };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: myLatLng
    });

    marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        draggable: true
    });

    map.addListener('click', (event) => {
        marker.setPosition(event.latLng);
        updateMarkerPosition(event.latLng);
    });

    marker.addListener('dragend', () => {
        updateMarkerPosition(marker.getPosition());
    });

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(pos);
            marker.setPosition(pos);
            updateMarkerPosition(pos);
        },
        () => handleLocationError(true)
    );
}

function updateMarkerPosition(latLng) {
    const locationInput = document.getElementById('location-input');
    locationInput.value = `${latLng.lat()}, ${latLng.lng()}`;
    const locationDisplay = document.getElementById('location-display');
    locationDisplay.innerText = `${latLng.lat()}, ${latLng.lng()}`;
}

function handleLocationError(browserHasGeolocation) {
    const locationDisplay = document.getElementById('location-display');
    locationDisplay.innerText = browserHasGeolocation
        ? 'Error: The Geolocation service failed.'
        : 'Error: Your browser doesn\'t support geolocation.';
}

const fileInput = document.getElementById('file-input');
const selectFromFolder = document.getElementById('select-from-folder');
const captureFromCamera = document.getElementById('capture-from-camera');
const locationOption = document.getElementsByName('location-option');
const manualLocationInput = document.getElementById('manual-location-input');
const mapContainer = document.getElementById('map-container');
const confirmLocationButton = document.getElementById('confirm-location');
const uploadedImages = document.getElementById('uploaded-images');

selectFromFolder.addEventListener('click', () => {
    fileInput.click();
});

captureFromCamera.addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const captureButton = document.createElement('button');
            captureButton.textContent = 'Capture';
            captureButton.addEventListener('click', () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const img = document.createElement('img');
                img.src = canvas.toDataURL('image/png');
                uploadedImages.appendChild(img);
                stream.getTracks().forEach(track => track.stop());
            });

            document.body.appendChild(video);
            document.body.appendChild(captureButton);
        })
        .catch(error => console.error(error));
});

locationOption.forEach(option => {
    option.addEventListener('change', () => {
        if (option.value === 'map') {
            manualLocationInput.style.display = 'none';
            mapContainer.style.display = 'block';
            confirmLocationButton.style.display = 'block';
            initMap();
        } else {
            manualLocationInput.style.display = 'block';
            mapContainer.style.display = 'none';
            confirmLocationButton.style.display = 'none';
        }
    });
});

confirmLocationButton.addEventListener('click', () => {
    const locationInput = document.getElementById('location');
    const locationInputHidden = document.getElementById('location-input');
    locationInputHidden.value = locationInput.value;
    const locationDisplay = document.getElementById('location-display');
    locationDisplay.innerText = locationInput.value;
});

const form = document.getElementById('image-upload-form');
form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    fetch('/upload/image', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.file_path) {
            const img = document.createElement('img');
            img.src = data.file_path;
            img.alt = 'Uploaded Image';
            img.style.maxWidth = '300px';
            img.style.maxHeight = '200px';
            uploadedImages.appendChild(img);
        }
    })
    .catch(error => console.error(error));
});