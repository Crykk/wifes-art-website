// Odotetaan, että koko sivu on ladattu ennen kuin kosketaan elementteihin
document.addEventListener('DOMContentLoaded', () => {
    // Haetaan gallerian liukukisko
    const galleryTrack = document.getElementById('galleryTrack');
    // Haetaan vasemman nuolen painike
    const prevBtn = document.getElementById('prevBtn');
    // Haetaan oikean nuolen painike
    const nextBtn = document.getElementById('nextBtn');
    // Haetaan gallerian päivityspainike
    const refreshBtn = document.getElementById('refreshBtn');
    // Haetaan modal-ikkuna
    const modal = document.getElementById('paintingModal');
    // Haetaan modaalin kuva
    const modalImage = document.getElementById('modalImage');
    // Haetaan modaalin otsikko
    const modalTitle = document.getElementById('modalTitle');
    // Haetaan modaalin tekniikkateksti
    const modalMedium = document.getElementById('modalMedium');
    // Haetaan modaalin hintateksti
    const modalPrice = document.getElementById('modalPrice');
    // Haetaan modaalin sulkunappi
    const modalClose = document.getElementById('modalClose');
    
    // Nykyinen kortti gallerian keskellä
    let currentIndex = 0;
    // Estetään tuplaanimaatio
    let isAnimating = false;
    // Lista gallerian korteista
    let paintings = [];
    // Kappalemäärä
    let totalPaintings = 0;
    // Lista löydetyistä kuvista
    let imageList = [];
    // Captcha-vastauksen oikea arvo
    let captchaAnswer = 0;

    // Sallitut kuvatiedostojen päätteet
    const supportedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    // Luetaan hintadata, jos se on saatavilla
    function getPricesData() {
        return typeof PRICES_DATA !== 'undefined' ? PRICES_DATA : {};
    }

    // Luodaan yksinkertainen laskutehtävä botteja vastaan
    function generateCaptcha() {
        // Ensimmäinen satunnainen numero
        const num1 = Math.floor(Math.random() * 10) + 1;
        // Toinen satunnainen numero
        const num2 = Math.floor(Math.random() * 10) + 1;
        // Mahdolliset laskuoperaatiot
        const operators = ['+', '-', '×'];
        // Valitaan satunnainen operaattori
        const operator = operators[Math.floor(Math.random() * operators.length)];
        
        // Oikea vastaus tähän laskuun
        let answer;
        // Näytettävä kysymys
        let question;
        
        // Muodostetaan lasku operaattorin mukaan
        switch(operator) {
            case '+':
                // Yhteenlasku
                answer = num1 + num2;
                // Kysymys käyttäjälle
                question = `${num1} + ${num2} = ?`;
                break;
            case '-':
                // Valitaan suurempi ja pienempi, jotta tulos on positiivinen
                const larger = Math.max(num1, num2);
                const smaller = Math.min(num1, num2);
                // Vähennyslasku
                answer = larger - smaller;
                // Kysymys käyttäjälle
                question = `${larger} - ${smaller} = ?`;
                break;
            case '×':
                // Kertolasku
                answer = num1 * num2;
                // Kysymys käyttäjälle
                question = `${num1} × ${num2} = ?`;
                break;
        }
        
        // Tallennetaan oikea vastaus talteen
        captchaAnswer = answer;
        // Haetaan kysymyskenttä
        const captchaQuestion = document.getElementById('captchaQuestion');
        // Asetetaan kysymys näkyviin
        if (captchaQuestion) {
            captchaQuestion.textContent = question;
        }
    }

    // Ladataan teoskuvat kansiosta
    async function loadPaintings() {
        // Tyhjennetään aiempi sisältö
        galleryTrack.innerHTML = '';
        // Nollataan kuvien lista
        imageList = [];
        
        // Lasketaan peräkkäiset epäonnistumiset
        let consecutiveFailures = 0;
        // Lopetetaan, jos liian monta putkeen puuttuu
        const maxConsecutiveFailures = 10;
        // Maksimimäärä kuvia, joita etsitään
        const maxImages = 100;
        // Vältetään välimuistin vanhat kuvat
        const cacheBuster = `?t=${Date.now()}`;
        // Luetaan hinnat
        const pricesData = getPricesData();
        
        // Kokeillaan kuvia järjestyksessä
        for (let i = 1; i <= maxImages && consecutiveFailures < maxConsecutiveFailures; i++) {
            // Oletetaan, ettei kuvaa löytynyt
            let found = false;
            // Kokeillaan kaikkia päätteitä
            for (const ext of supportedExtensions) {
                // Luodaan uusi kuvaelementti
                const img = new Image();
                // Rakennetaan kuvan polku
                const src = `images/paintings/${i}.${ext}${cacheBuster}`;
                
                try {
                    // Odotetaan, että kuva latautuu tai epäonnistuu
                    await new Promise((resolve, reject) => {
                        // Lataus onnistui
                        img.onload = () => {
                            // Lisätään kuva listaan
                            imageList.push({ 
                                src: `images/paintings/${i}.${ext}`, 
                                number: i
                            });
                            // Vahvistetaan onnistuminen
                            resolve(true);
                        };
                        // Lataus epäonnistui
                        img.onerror = () => reject(false);
                        // Käynnistetään lataus
                        img.src = src;
                    });
                    // Kuva löytyi
                    found = true;
                    // Nollataan epäonnistumislaskuri
                    consecutiveFailures = 0;
                    // Siirrytään seuraavaan numeroon
                    break;
                } catch (e) {
                    // Jatketaan seuraavaan päätteeseen
                    continue;
                }
            }
            
            // Jos kuvaa ei löytynyt millään päätteellä
            if (!found) {
                // Kasvatetaan epäonnistumisten määrää
                consecutiveFailures++;
            }
        }
        
        // Rakennetaan kortit löydetyille kuville
        imageList.forEach((imgData, index) => {
            // Teoksen numero
            const paintingNum = imgData.number;
            // Hintatiedot tälle teokselle
            const priceInfo = pricesData[paintingNum] || {};
            // Näytettävä nimi
            const displayName = priceInfo.name || `Maalaus ${paintingNum}`;
            // Näytettävä hinta
            const price = priceInfo.price || 'Hinta pyydettäessä';
            // Saatavuustieto
            const available = priceInfo.available !== false;
            
            // Luodaan kortti elementti
            const card = document.createElement('div');
            // Asetetaan luokka
            card.className = 'painting-card';
            // Tallennetaan numero data-attribuuttiin
            card.dataset.number = paintingNum;
            // Rakennetaan kortin sisältö
            card.innerHTML = `
                <div class="painting-wrapper">
                    <img src="${imgData.src}" alt="${displayName}">
                    ${!available ? '<div class="sold-badge">MYYTY</div>' : ''}
                </div>
                <div class="painting-info">
                    <h3>${displayName}</h3>
                    <p class="painting-price">${price}</p>
                    <p class="painting-status">${available ? 'Saatavilla' : 'Myyty'}</p>
                </div>
            `;
            // Lisätään kortti galleriaan
            galleryTrack.appendChild(card);
        });
        
        // Kerätään kaikki kortit talteen
        paintings = Array.from(document.querySelectorAll('.painting-card'));
        // Päivitetään määrä
        totalPaintings = paintings.length;
        
        // Varmistetaan, että indeksi on sallittu
        if (currentIndex >= totalPaintings) {
            currentIndex = Math.max(0, totalPaintings - 1);
        }
        
        // Lisätään tapahtumat kortteihin
        setupPaintingEvents();
        // Päivitetään näkyvä asettelu
        updateCarousel();
    }

    // Päivitetään korttien paikat ja luokat
    function updateCarousel() {
        // Käydään kaikki kortit läpi
        paintings.forEach((card, index) => {
            // Tyhjennetään aiemmat sijaintiluokat
            card.classList.remove('center', 'side-left', 'side-right', 'far-left', 'far-right', 'hidden', 'visible');
            
            // Lasketaan kortin paikka suhteessa keskelle
            let position = index - currentIndex;
            
            // Kääritään sijainti ympäri, jotta kierto toimii
            if (position > totalPaintings / 2) position -= totalPaintings;
            // Kääritään myös toiseen suuntaan
            if (position < -totalPaintings / 2) position += totalPaintings;
            
            // Keskellä oleva kortti
            if (position === 0) {
                card.classList.add('center', 'visible');
            } else if (position === -1) {
                // Vasen viereinen kortti
                card.classList.add('side-left', 'visible');
            } else if (position === 1) {
                // Oikea viereinen kortti
                card.classList.add('side-right', 'visible');
            } else if (position === -2) {
                // Vasemmanpuoleinen kauempi kortti
                card.classList.add('far-left', 'visible');
            } else if (position === 2) {
                // Oikeanpuoleinen kauempi kortti
                card.classList.add('far-right', 'visible');
            } else {
                // Piilotetaan muut kortit
                card.classList.add('hidden');
            }
        });
    }

    // Siirrytään seuraavaan teokseen
    function rotateNext() {
        // Ei tehdä mitään, jos animaatio käynnissä tai ei teoksia
        if (isAnimating || totalPaintings === 0) return;
        // Lukitaan animaatio
        isAnimating = true;
        
        // Päivitetään indeksin sijainti
        currentIndex = (currentIndex + 1) % totalPaintings;
        // Päivitetään näkymä
        updateCarousel();
        
        // Vapautetaan lukko hetken päästä
        setTimeout(() => {
            isAnimating = false;
        }, 500);
    }

    // Siirrytään edelliseen teokseen
    function rotatePrev() {
        // Ei tehdä mitään, jos animaatio käynnissä tai ei teoksia
        if (isAnimating || totalPaintings === 0) return;
        // Lukitaan animaatio
        isAnimating = true;
        
        // Päivitetään indeksin sijainti
        currentIndex = (currentIndex - 1 + totalPaintings) % totalPaintings;
        // Päivitetään näkymä
        updateCarousel();
        
        // Vapautetaan lukko hetken päästä
        setTimeout(() => {
            isAnimating = false;
        }, 500);
    }

    // Avataan modaalissa isompi kuva
    function openModal(imgSrc, paintingNum) {
        // Luetaan hintadata
        const pricesData = getPricesData();
        // Haetaan teoksen tiedot
        const priceInfo = pricesData[paintingNum] || {};
        // Muodostetaan nimi
        const displayName = priceInfo.name || `Maalaus ${paintingNum}`;
        // Muodostetaan hinta
        const price = priceInfo.price || 'Hinta pyydettäessä';
        // Saatavuustieto
        const available = priceInfo.available !== false;
        
        // Asetetaan kuvan lähde
        modalImage.src = imgSrc;
        // Asetetaan otsikko
        modalTitle.textContent = displayName;
        // Asetetaan tekniikka + mitat
        const dimensions = priceInfo.dimensions ? `, ${priceInfo.dimensions}` : '';
        modalMedium.textContent = `Öljy kankaalle${dimensions}`;
        // Asetetaan hinta, jos kenttä löytyy
        if (modalPrice) {
            modalPrice.textContent = `${price} ${!available ? '(MYYTY)' : ''}`;
        }
        // Näytetään modal
        modal.classList.add('active');
        // Estetään taustan rullaus
        document.body.style.overflow = 'hidden';
    }

    // Suljetaan modal-ikkuna
    function closeModal() {
        // Piilotetaan modal
        modal.classList.remove('active');
        // Palautetaan rullaus
        document.body.style.overflow = '';
    }

    // Lisätään klikkaustapahtumat korteille
    function setupPaintingEvents() {
        // Käydään kortit läpi
        paintings.forEach((card, index) => {
            // Klikkaus kortissa
            card.addEventListener('click', (e) => {
                // Estetään toiminta animaation aikana
                if (isAnimating) return;
                
                // Tarkistetaan, onko kortti keskellä
                const isCenter = card.classList.contains('center');
                
                // Jos keskellä, avataan modal
                if (isCenter) {
                    // Haetaan kuvan elementti
                    const img = card.querySelector('img');
                    // Haetaan teoksen numero
                    const paintingNum = card.dataset.number;
                    // Avataan isompi näkymä
                    openModal(img.src, paintingNum);
                } else if (card.classList.contains('side-left') || card.classList.contains('far-left')) {
                    // Lasketaan montako askelta vasemmalle
                    const steps = (currentIndex - index + totalPaintings) % totalPaintings;
                    // Siirretään askel askeleelta
                    for (let i = 0; i < steps; i++) {
                        setTimeout(() => rotatePrev(), i * 150);
                    }
                } else if (card.classList.contains('side-right') || card.classList.contains('far-right')) {
                    // Lasketaan montako askelta oikealle
                    const steps = (index - currentIndex + totalPaintings) % totalPaintings;
                    // Siirretään askel askeleelta
                    for (let i = 0; i < steps; i++) {
                        setTimeout(() => rotateNext(), i * 150);
                    }
                }
            });
        });
    }

    // Nuolipainike vasemmalle
    prevBtn.addEventListener('click', rotatePrev);
    // Nuolipainike oikealle
    nextBtn.addEventListener('click', rotateNext);

    // Päivitä-painike lataa sivun uudelleen
    refreshBtn.addEventListener('click', () => {
        location.reload();
    });

    // Suljetaan modal napilla
    modalClose.addEventListener('click', closeModal);
    
    // Suljetaan modal, jos klikataan taustaa
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Kuunnellaan näppäimistöä
    document.addEventListener('keydown', (e) => {
        // Jos modal on auki, käsitellään se erikseen
        if (modal.classList.contains('active')) {
            // Esc sulkee modaalin
            if (e.key === 'Escape') {
                closeModal();
            }
            return;
        }
        
        // Haetaan gallerian sijainti ruudulla
        const galleryRect = document.querySelector('.gallery-section').getBoundingClientRect();
        // Ikkunan korkeus
        const windowHeight = window.innerHeight;
        
        // Sallitaan nuolinäppäimet vain, kun galleria on näkyvissä
        if (galleryRect.top < windowHeight * 0.7 && galleryRect.bottom > windowHeight * 0.3) {
            if (e.key === 'ArrowLeft') {
                // Estetään sivun rullaus
                e.preventDefault();
                // Siirrytään vasemmalle
                rotatePrev();
            } else if (e.key === 'ArrowRight') {
                // Estetään sivun rullaus
                e.preventDefault();
                // Siirrytään oikealle
                rotateNext();
            }
        }
    });

    // Asetukset näkyvyystarkkailijalle
    const observerOptions = {
        // Käytetään näkymäikkunaa juurena
        root: null,
        // Ei lisämarginaalia
        rootMargin: '0px',
        // Näkyvyysraja
        threshold: 0.1
    };

    // Luodaan elementtien sisäänliukuvan näkyvyyden tarkkailija
    const fadeObserver = new IntersectionObserver((entries) => {
        // Käydään kaikki havainnot läpi
        entries.forEach(entry => {
            // Kun elementti tulee näkyviin
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Haetaan yhteydenottolomake
    const contactForm = document.getElementById('contactForm');
    // Varmistetaan, että lomake löytyy
    if (contactForm) {
        // Luodaan captcha heti alkuun
        generateCaptcha();
        
        // Haetaan captcha-kenttä
        const captchaInput = document.getElementById('captcha');
        if (captchaInput) {
            // Poistetaan punainen korostus, kun kenttään mennään
            captchaInput.addEventListener('focus', () => {
                captchaInput.style.borderColor = '';
            });
        }
        
        // Käsitellään lomakkeen lähetys
        contactForm.addEventListener('submit', (e) => {
            // Luetaan käyttäjän vastaus numerona
            const userAnswer = parseInt(captchaInput.value, 10);
            
            // Jos vastaus on väärä
            if (userAnswer !== captchaAnswer) {
                // Estetään lähetys
                e.preventDefault();
                // Korostetaan kenttää punaisella
                captchaInput.style.borderColor = '#e74c3c';
                // Tyhjennetään kenttä
                captchaInput.value = '';
                // Luodaan uusi captcha
                generateCaptcha();
                
                // Luodaan virheilmoitus
                const errorMsg = document.querySelector('.captcha-error') || document.createElement('p');
                // Asetetaan luokka
                errorMsg.className = 'captcha-error';
                // Asetetaan väri
                errorMsg.style.color = '#e74c3c';
                // Asetetaan fonttikoko
                errorMsg.style.fontSize = '0.85rem';
                // Asetetaan yläreunan marginaali
                errorMsg.style.marginTop = '0.5rem';
                // Asetetaan viesti
                errorMsg.textContent = 'Väärä vastaus, yritä uudelleen';
                
                // Haetaan captcha-ryhmä
                const captchaGroup = document.querySelector('.captcha-group');
                // Lisätään virheviesti, jos sitä ei ole
                if (captchaGroup && !document.querySelector('.captcha-error')) {
                    captchaGroup.appendChild(errorMsg);
                }
                
                // Poistetaan viesti hetken päästä
                setTimeout(() => {
                    if (errorMsg.parentNode) {
                        errorMsg.remove();
                    }
                }, 3000);
                return;
            }
            
            // Haetaan lähetyspainike
            const submitBtn = contactForm.querySelector('.submit-btn');
            // Tallennetaan alkuperäinen teksti
            const originalText = submitBtn.querySelector('span').textContent;
            // Näytetään lähetyksen tila
            submitBtn.querySelector('span').textContent = 'Lähetetään...';
            // Estetään tuplalähetys
            submitBtn.disabled = true;
            
            // Palautetaan painike normaaliksi viiveen jälkeen
            setTimeout(() => {
                submitBtn.querySelector('span').textContent = originalText;
                submitBtn.disabled = false;
                generateCaptcha();
                captchaInput.value = '';
            }, 3000);
        });
    }

    // Ladataan teokset heti alussa
    loadPaintings();
});
