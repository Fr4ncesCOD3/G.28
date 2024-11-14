"use strict";

// Seleziona elementi HTML
const cards = document.querySelectorAll(".card");
const loadImagesBtn = document.querySelector('.btn-primary');
const loadSecondaryBtn = document.querySelector('.btn-secondary');

// API Pexels
const apiKey = "HAodK8EZfPf2Bg2icBw5SfUDK1pWGGYeZa3lRBrCxsVXtyIB5ac2bxqN";
const baseUrl = "https://api.pexels.com/v1/search";

// Funzione per calcolare il colore medio
// Se non c'è un colore medio, usa il bianco come colore di default
//avg_color è un codice esadecimale per il colore
const getAverageColor = (photo) => photo.avg_color || '#FFFFFF';

// Funzione per aprire il modale con l'immagine
const openImageModal = (photo) => {
  let modal = document.getElementById('imageModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-bottom-0">
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-4">
            <div class="row">
              <!-- Colonna immagine -->
              <div class="col-md-8">
                <img class="img-fluid rounded w-100" 
                     style="max-height: 70vh; object-fit: contain;" alt="">
              </div>
              <!-- Colonna dettagli -->
              <div class="col-md-4 d-flex flex-column">
                <h4 class="modal-photographer mb-3"></h4>
                <p class="modal-description flex-grow-1 mb-4"></p>
                <div class="mt-auto">
                  <a class="photographer-link btn btn-outline-secondary w-100" 
                     href="" target="_blank">
                    View on Pexels
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-up-right ms-2" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/>
                      <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Configura il modale
  const modalInstance = new bootstrap.Modal(modal);
  const modalImg = modal.querySelector('.modal-body img');
  const modalPhotographer = modal.querySelector('.modal-photographer');
  const modalDescription = modal.querySelector('.modal-description');
  const photographerLink = modal.querySelector('.photographer-link');
  const modalContent = modal.querySelector('.modal-content');
  
  // Imposta i contenuti
  modalImg.src = photo.src.large;
  modalImg.alt = photo.alt;
  modalPhotographer.textContent = photo.photographer;
  modalDescription.textContent = photo.alt || 'No description available';
  photographerLink.href = photo.url;
  
  // Imposta il background color come media dei colori
  const avgColor = getAverageColor(photo);
  modalContent.style.backgroundColor = avgColor;
  
  // Adatta il colore del testo in base allo sfondo
  const brightness = parseInt(avgColor.slice(1), 16);
  const textColor = brightness > 0x7FFFFF ? '#000000' : '#FFFFFF';
  modalPhotographer.style.color = textColor;
  modalDescription.style.color = textColor;
  photographerLink.style.color = textColor;
  photographerLink.style.borderColor = textColor;
  
  // Mostra il modale
  modalInstance.show();
};

// Funzione per aggiornare una card esistente
const updateCard = (cardElement, photo) => {
  // Aggiorna immagine
  const img = cardElement.querySelector('img');
  img.src = photo.src.medium;
  img.alt = photo.alt;
  
  // Aggiorna titolo e testo
  const title = cardElement.querySelector('.card-title');
  title.textContent = photo.photographer;
  
  const text = cardElement.querySelector('.card-text');
  text.textContent = photo.alt || 'Bella immagine da Pexels';
  
  // Aggiorna ID al posto di "9 mins"
  cardElement.querySelector('.text-muted').textContent = photo.id;
  
  // Modifica il pulsante Edit in Hide
  const editBtn = cardElement.querySelector('.btn-group button:last-child');
  editBtn.textContent = 'Hide';
  editBtn.onclick = () => {
    const col = cardElement.closest('.col-md-4');
    col.style.transition = "opacity 0.3s ease";
    col.style.opacity = "0";
    setTimeout(() => col.remove(), 300);
  };
  
  // Modifica il pulsante View per aprire il modale
  const viewBtn = cardElement.querySelector('.btn-group button:first-child');
  viewBtn.onclick = () => openImageModal(photo);
  
  // Aggiungi classe per dimensioni uniformi
  cardElement.classList.add('h-100');
  cardElement.querySelector('.card-body').classList.add('d-flex', 'flex-column');
  cardElement.querySelector('.d-flex.justify-content-between').classList.add('mt-auto');
};

// Funzione per caricare le immagini
const loadImages = async (query) => {
  try {
    const response = await fetch(`${baseUrl}?query=${query}&per_page=9`, {
      headers: {
        Authorization: apiKey
      }
    });

    if (!response.ok) throw new Error('Errore nella risposta API');

    const data = await response.json();
    const cardElements = document.querySelectorAll('.col-md-4');

    // Aggiungi classe per il layout a griglia
    const row = document.querySelector('#album');
    row.classList.add('row-cols-1', 'row-cols-md-3', 'g-4');

    // Aggiorna ogni card esistente con i nuovi dati
    cardElements.forEach((cardContainer, index) => {
      if (data.photos[index]) {
        cardContainer.style.transition = "opacity 0.3s ease";
        cardContainer.style.opacity = "1";
        updateCard(cardContainer.querySelector('.card'), data.photos[index]);
      }
    });

  } catch (error) {
    console.error('Errore nel caricamento delle immagini:', error);
  }
};

// Event listeners per i pulsanti di caricamento
document.addEventListener('DOMContentLoaded', () => {
  loadImagesBtn.addEventListener('click', () => loadImages('nature'));
  loadSecondaryBtn.addEventListener('click', () => loadImages('ocean'));
});

