document.addEventListener('DOMContentLoaded', () => {
    fetch('/uploads')
      .then(response => response.json())
      .then(data => {
        const airPollutionImages = document.getElementById('air-pollution-images');
        const waterPollutionImages = document.getElementById('water-pollution-images');
        const otherPollutionImages = document.getElementById('other-pollution-images');
        data.forEach(item => {
          const img = document.createElement('img');
          img.src = item.file_path;
          img.alt = 'Uploaded Image';
          img.style.maxWidth = '300px';
          img.style.maxHeight = '200px';
          const locationElement = document.createElement('p');
          locationElement.textContent = `Location: ${item.location}`;
          const container = document.createElement('div');
          container.appendChild(img);
          container.appendChild(locationElement);
          if (item.type === 'air') {
            airPollutionImages.appendChild(container);
          } else if (item.type === 'water') {
            waterPollutionImages.appendChild(container);
          } else {
            otherPollutionImages.appendChild(container);
          }
        });
      })
      .catch(error => console.error(error));
  });