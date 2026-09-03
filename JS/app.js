// Globale Variable für ALLE Produkte, damit wir sie nicht ständig neu laden müssen
let alleProdukteDaten = []; 

// ==========================================
// PRODUKTE LADEN (Aber noch nicht anzeigen!)
// ==========================================
async function ladeProdukte() {
    try {
        const antwort = await fetch('data/products.json');
        if (!antwort.ok) throw new Error(`Netzwerkfehler: ${antwort.status}`);
        
        alleProdukteDaten = await antwort.json(); // Wir speichern sie unsichtbar ab!
        
        // Wir zeigen beim Start absichtlich NICHTS an!
        // zeigeProdukteImShop(alleProdukteDaten); <- GELÖSCHT!

    } catch (fehler) {
        console.error("Fehler beim Laden:", fehler);
    }
}

// ==========================================
// KATEGORIE-KLICK LOGIK
// ==========================================
const kategorieContainer = document.getElementById('kategorie-auswahl');

if (kategorieContainer) {
    kategorieContainer.addEventListener('click', (event) => {
        // Wir suchen die angeklickte Kategorie-Karte
        const geklickteKarte = event.target.closest('.kategorie-karte');
        
        // Wenn man daneben geklickt hat, mach nichts
        if (!geklickteKarte) return;

        // --- Dein Rahmen-Zauber von vorhin ---
        document.querySelectorAll('.kategorie-karte').forEach(karte => {
            karte.classList.remove('ausgewaehlt');
        });
        geklickteKarte.classList.add('ausgewaehlt');
        // -------------------------------------

        // Welche Kategorie steht im 'data-kategorie' Attribut?
        const gewaehlteKategorie = geklickteKarte.dataset.kategorie;

        // Produkte filtern (z.B. nur alle Weine/Spirituosen holen)
        const gefilterteProdukte = alleProdukteDaten.filter((produkt) => {
            return produkt.kategorie === gewaehlteKategorie;
        });


        // ==============================================================
        // HIER IST SCHRITT 5: DIE INTELLIGENTE WEICHE FÜR DIE UNTER-FILTER
        // ==============================================================
        
        // Wir prüfen: Heißt die geklickte Kategorie "wein_spirituosen"? 
        // Wenn JA -> suche nach "art". Wenn NEIN -> suche nach "marke".
        let suchWort = (gewaehlteKategorie === 'wein_spirituosen') ? 'art' : 'marke';

        // Jetzt rufen wir die neue Funktion auf, die die kleinen Buttons baut!
        erstelleUnterFilter(gefilterteProdukte, geklickteKarte.innerText, suchWort);
        
        // ==============================================================


        // Zum Schluss wie gewohnt die Produkte auf der Seite anzeigen
        zeigeProdukteImShop(gefilterteProdukte, geklickteKarte.innerText);
    });
}

const suchfeld = document.getElementById('suchfeld');
const suchButton = document.getElementById('such-button');

function fuehreSucheAus() {
    const suchbegriff = suchfeld.value.toLowerCase().trim();

    if (suchbegriff === "") {
        return;
    }

    const gefilterteProdukte = alleProdukteDaten.filter((produkt) => {
        const produktName = produkt.name.toLowerCase();
        return produktName.includes(suchbegriff);
    });

    zeigeProdukteImShop(gefilterteProdukte, `Suchergebnisse für "${suchfeld.value}"`);
}

if (suchButton && suchfeld) {
    suchButton.addEventListener('click', fuehreSucheAus);
    
    suchfeld.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            fuehreSucheAus();
        }
    });
}

function zeigeProdukteImShop(produkte, kategorienName = "Produkte") {
    const htmlContainer = document.getElementById('produkt-liste');
    
    // Leeren und die neue Überschrift setzen
    htmlContainer.innerHTML = `<h2 class="kategorie-titel">${kategorienName}</h2>`; 

    let produktHTML = '';

    produkte.forEach(produkt => {
        let hauptEinheit = produkt.einheit ? produkt.einheit : "Kasten";
        let hatSixpack = produkt.preis_sechser > 0;

        let preisBoxHTML = `
            <p><strong>${hauptEinheit}:</strong> ${produkt.preis_kasten.toFixed(2)} € <br>
            <small>(+ ${produkt.pfand_kasten.toFixed(2)} € Pfand)</small></p>
        `;

        if (hatSixpack) {
            preisBoxHTML += `
            <p><strong>6er-Pack:</strong> ${produkt.preis_sechser.toFixed(2)} € <br>
            <small>(+ ${produkt.pfand_sechser.toFixed(2)} € Pfand)</small></p>
            `;
        }

        // --- ÄNDERUNG 1: data-ean zum Dropdown hinzugefügt ---
        let variantenHTML = '';
        if (hatSixpack) {
            variantenHTML = `
            <select class="varianten-auswahl" data-ean="${produkt.ean}">
                <option value="${hauptEinheit.toLowerCase()}">${hauptEinheit}</option>
                <option value="sechser">6er-Pack</option>
            </select>
            `;
        } else {
            variantenHTML = `<input type="hidden" class="varianten-auswahl" value="${hauptEinheit.toLowerCase()}">`;
        }

        // --- ÄNDERUNG 2: Der neue Bilderrahmen und die Etiketten (data-kasten & data-flasche) ---
        produktHTML += `
            <div class="produkt-karte">
                <a href="produkt.html?ean=${produkt.ean}" class="produkt-detail-link" style="text-decoration: none; color: inherit;">
                    
                    <div class="produkt-bild-container">
                        <img id="bild-${produkt.ean}" 
                             src="images/icons/${produkt.bild_kasten || produkt.bild_flasche || produkt.bild}" 
                             alt="${produkt.name}" 
                             class="produkt-bild"
                             data-kasten="${produkt.bild_kasten || produkt.bild}"
                             data-flasche="${produkt.bild_flasche || produkt.bild}">
                    </div>
                    
                    <h3>${produkt.name}</h3>
                </a>
                
                <div class="preis-box">
                    ${preisBoxHTML}
                </div>

                ${variantenHTML}

                <button class="kauf-button js-kauf-button" data-product-ean="${produkt.ean}">In den Warenkorb</button>
            </div>
        `;
    });
    
    // Alles auf einmal ins HTML schieben
    htmlContainer.innerHTML += produktHTML;

    // ==========================================
    // --- ÄNDERUNG 3: DER BILDWECHSEL-ZAUBER ---
    // (Muss hier stehen, weil das HTML erst ab jetzt existiert!)
    // ==========================================
    const alleDropdowns = document.querySelectorAll('.varianten-auswahl');

    alleDropdowns.forEach(dropdown => {
        dropdown.addEventListener('change', (event) => {
            const gewaehlteVariante = event.target.value;
            const produktEan = event.target.getAttribute('data-ean'); // Welche EAN hat das geklickte Dropdown?
            
            // Das Bild zur passenden EAN finden
            const passendesBild = document.getElementById(`bild-${produktEan}`);
            
            if (passendesBild) {
                const kastenDatei = passendesBild.getAttribute('data-kasten');
                const flaschenDatei = passendesBild.getAttribute('data-flasche');
                
                // Bild austauschen, falls Dateinamen existieren
                if (gewaehlteVariante === 'sechser' || gewaehlteVariante === 'flasche') {
                    if (flaschenDatei && flaschenDatei !== 'undefined') {
                        passendesBild.src = `images/icons/${flaschenDatei}`;
                    }
                } else {
                    if (kastenDatei && kastenDatei !== 'undefined') {
                        passendesBild.src = `images/icons/${kastenDatei}`;
                    }
                }
            }
        });
    });
}

// Die Funktion bekommt jetzt ein drittes Wort mitgeliefert: filterEigenschaft (z.B. 'marke' oder 'art')
function erstelleUnterFilter(produkte, kategorieName, filterEigenschaft) {
    const markenContainer = document.getElementById('marken-filter-container');
    markenContainer.innerHTML = ''; 

    // Wir holen dynamisch entweder die Marke ODER die Art aus der JSON!
    const alleWerte = produkte.map(produkt => produkt[filterEigenschaft]).filter(wert => wert !== undefined);
    const eindeutigeWerte = [...new Set(alleWerte)];

    if (eindeutigeWerte.length === 0) return;

    let filterHTML = `<button class="marken-button aktiv" data-filter="alle">Alle</button>`;

    eindeutigeWerte.forEach(wert => {
        filterHTML += `<button class="marken-button" data-filter="${wert}">${wert}</button>`;
    });

    markenContainer.innerHTML = filterHTML;

    // Klick-Logik für die neuen Buttons
    const markenButtons = markenContainer.querySelectorAll('.marken-button');
    
    markenButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            markenButtons.forEach(b => b.classList.remove('aktiv'));
            event.target.classList.add('aktiv');

            const gewaehlterFilter = event.target.getAttribute('data-filter');

            if (gewaehlterFilter === 'alle') {
                zeigeProdukteImShop(produkte, kategorieName);
            } else {
                // Hier filtert er jetzt schlau nach 'marke' oder 'art'
                const gefilterteProdukte = produkte.filter(p => p[filterEigenschaft] === gewaehlterFilter);
                zeigeProdukteImShop(gefilterteProdukte, gewaehlterFilter);
            }
        });
    });
}


ladeProdukte();