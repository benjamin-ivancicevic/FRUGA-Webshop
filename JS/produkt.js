// ==========================================
// CROSS-SELLING LOGIK (Wörterbuch)
// ==========================================
const empfehlungsLogik = {
    'bier': ['wasser', 'limo_schorle'],
    'wein_spirituosen': ['wasser', 'limo_schorle'],
    'wasser': ['saft', 'bier'],
    'limo_schorle': ['bier', 'wasser'],
    'saft': ['wasser', 'wein_spirituosen']
};

const kategorieNamen = {
    'bier': 'Bieren',
    'wasser': 'Wässern',
    'limo_schorle': 'Limos & Schorlen',
    'saft': 'Säften',
    'wein_spirituosen': 'Weinen & Spirituosen'
};


// ==========================================
// HAUPTFUNKTION FÜR DIE PRODUKTSEITE
// ==========================================
async function ladeProduktDetails() {
    // 1. Die EAN aus der URL "klauen"
    const urlParams = new URLSearchParams(window.location.search);
    const eanAusUrl = urlParams.get('ean');

    if (!eanAusUrl) {
        document.getElementById('einzelprodukt-container').innerHTML = "<h2>Kein Produkt gefunden!</h2>";
        return;
    }

    try {
        // 2. Alle Produkte laden
        const antwort = await fetch('data/products.json');
        const produkte = await antwort.json();

        // 3. Genau das EINE Produkt suchen
        let gesuchtesProdukt;
        produkte.forEach((produkt) => {
            if (produkt.ean === eanAusUrl) {
                gesuchtesProdukt = produkt;
            }
        });

        if (gesuchtesProdukt) {
            // Wir checken ab, ob du in der JSON schon Beschreibung/Allergene angelegt hast.
            const beschreibung = gesuchtesProdukt.beschreibung ? gesuchtesProdukt.beschreibung : "Für dieses Produkt liegt noch keine genaue Beschreibung vor.";
            const allergene = gesuchtesProdukt.allergene ? gesuchtesProdukt.allergene : "Keine Angaben zu Allergenen.";

            // Logik für Einheit und Sixpack
            let hauptEinheit = gesuchtesProdukt.einheit ? gesuchtesProdukt.einheit : "Kasten";
            let hatSixpack = gesuchtesProdukt.preis_sechser > 0;

            let preisBoxHTML = `<p class="detail-preis"><strong>${hauptEinheit}:</strong> ${gesuchtesProdukt.preis_kasten.toFixed(2)} € <small>(+ ${gesuchtesProdukt.pfand_kasten.toFixed(2)} € Pfand)</small></p>`;
            
            let variantenHTML = '';
            if (hatSixpack) {
                preisBoxHTML += `<p class="detail-preis"><strong>6er-Pack:</strong> ${gesuchtesProdukt.preis_sechser.toFixed(2)} € <small>(+ ${gesuchtesProdukt.pfand_sechser.toFixed(2)} € Pfand)</small></p>`;
                variantenHTML = `
                <select class="varianten-auswahl-produkt" id="detail-variante">
                    <option value="${hauptEinheit.toLowerCase()}">${hauptEinheit}</option>
                    <option value="sechser">6er-Pack</option>
                </select>
                `;
            } else {
                variantenHTML = `<input type="hidden" id="detail-variante" value="${hauptEinheit.toLowerCase()}">`;
            }

            // 4. Das HTML für die Detailseite bauen (INKLUSIVE CROSS-SELLING BOX)
            const detailHTML = `
                <div class="detail-grid">
                    <div class="detail-bild-box">
                        <img id="detail-produkt-bild" src="images/icons/${gesuchtesProdukt.bild_kasten || gesuchtesProdukt.bild_flasche || gesuchtesProdukt.bild}" alt="${gesuchtesProdukt.name}">
                    </div>
                    
                    <div class="detail-info-box">
                        <h1>${gesuchtesProdukt.name}</h1>
                        <p class="detail-beschreibung">${beschreibung}</p>
                        <p class="detail-allergene"><strong>Allergene:</strong> ${allergene}</p>
                        
                        <div class="detail-kauf-bereich">
                            ${preisBoxHTML}
                            ${variantenHTML}
                            <button class="kauf-button" id="detail-kauf-button" data-product-ean="${gesuchtesProdukt.ean}">In den Warenkorb</button>
                        </div>
                        
                        <br><br>
                        <a href="index.html" class="zurueck-button">⬅ Zurück zum Shop</a>
                    </div>
                </div>

                <!-- NEU: Cross-Selling Bereich unter dem Produkt -->
                <div class="empfehlungen-bereich" style="margin-top: 40px; border-top: 2px solid #f1f2f6; padding-top: 25px;">
                    <h3 style="text-align: center; color: #2c3e50; margin-bottom: 20px; font-size: 1.4rem;">
                        Das könnte auch dazu passen:
                    </h3>
                    <div id="empfehlungen-container" style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                    </div>
                </div>
            `;
            
            document.getElementById('einzelprodukt-container').innerHTML = detailHTML;
            
            // Dropdown-Menü und Bild-Logik
            const variantenDropdown = document.getElementById('detail-variante');
            const produktBild = document.getElementById('detail-produkt-bild');

            if (variantenDropdown && produktBild) {
                variantenDropdown.addEventListener('change', (event) => {
                    const gewaehlteVariante = event.target.value;
                    if (gewaehlteVariante === 'sechser') {
                        produktBild.src = `images/icons/${gesuchtesProdukt.bild_flasche}`;
                    } else {
                        produktBild.src = `images/icons/${gesuchtesProdukt.bild_kasten}`;
                    }
                });
            }

            // Button Kauf-Logik
            const kaufButton = document.getElementById('detail-kauf-button');
            kaufButton.addEventListener('click', () => {
                const productEan = kaufButton.dataset.productEan;
                const produktArt = document.getElementById('detail-variante').value;
                let matchingItem;

                cart.forEach((item) => {
                    if(productEan === item.productEan && produktArt === item.produktArt) {
                        matchingItem = item;
                    }
                });

                if (matchingItem) {
                    matchingItem.quantity += 1;
                } else { 
                    cart.push({
                        productEan: productEan,
                        quantity: 1,
                        produktArt: produktArt
                    });
                }   

                speichereWarenkorb();
                aktualisiereZaehler();

                const originalText = kaufButton.innerText;
                kaufButton.innerText = "Hinzugefügt! ✔";
                kaufButton.style.backgroundColor = "#218838";
                setTimeout(() => {
                    kaufButton.innerText = originalText;
                    kaufButton.style.backgroundColor = "#28a745";
                }, 1000);
            });

            // ==========================================
            // NEU: EMPFEHLUNGEN AUFRUFEN!
            // ==========================================
            zeigeEmpfehlungen(gesuchtesProdukt.kategorie, produkte);
        }

    } catch (fehler) {
        console.error("Fehler:", fehler);
    }
}


// ==========================================
// FUNKTION ZUM GENERIEREN DER EMPFEHLUNGEN
// ==========================================
function zeigeEmpfehlungen(aktuelleKategorie, alleProdukte) {
    const container = document.getElementById('empfehlungen-container');
    if (!container) return; 

    const zielKategorien = empfehlungsLogik[aktuelleKategorie];
    if (!zielKategorien) return;

    let empfehlungsHTML = '';

    // Für jede der zwei Ziel-Kategorien ein zufälliges Produkt holen
    zielKategorien.forEach(zielKat => {
        const moeglicheProdukte = alleProdukte.filter(p => p.kategorie === zielKat);
        
        if (moeglicheProdukte.length > 0) {
            // Zufalls-Zahl generieren
            const zufallsIndex = Math.floor(Math.random() * moeglicheProdukte.length);
            const produkt = moeglicheProdukte[zufallsIndex];

            // Welches Bild?
            let bildName = produkt.bild_kasten || produkt.bild_flasche || produkt.bild;
            
            // HTML für die Karte
            empfehlungsHTML += `
                <div class="empfehlungs-karte" style="border: 1px solid #dfe4ea; border-radius: 10px; padding: 15px; width: 220px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); background: white;">
                    <img src="images/icons/${bildName}" alt="${produkt.name}" style="height: 120px; object-fit: contain; margin-bottom: 15px;">
                    <h4 style="font-size: 0.95rem; color: #2c3e50; margin-bottom: 15px; height: 35px; overflow: hidden;">${produkt.name}</h4>
                    
                    <!-- Button 1: Direktes Kaufen / Ansehen -->
                    <button class="empfehlung-produkt-btn" data-ean="${produkt.ean}" style="width: 100%; padding: 8px; background-color: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin-bottom: 8px;">
                        Ansehen
                    </button>
                    
                    <!-- Button 2: Zur Kategorie wechseln -->
                    <button class="empfehlung-kategorie-btn" style="width: 100%; padding: 8px; background-color: #f1f2f6; color: #2c3e50; border: 1px solid #ced6e0; border-radius: 5px; cursor: pointer; font-size: 0.85rem;">
                        Zu den ${kategorieNamen[zielKat]}
                    </button>
                </div>
            `;
        }
    });

    container.innerHTML = empfehlungsHTML;

    // Klick auf "Ansehen" -> Lädt die Produktseite mit der neuen EAN neu
    const produktButtons = container.querySelectorAll('.empfehlung-produkt-btn');
    produktButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const ean = e.target.getAttribute('data-ean');
            window.location.href = 'produkt.html?ean=' + ean; 
        });
    });

    // Klick auf "Zu den Kategorien" -> Schickt den User zur Startseite
    const katButtons = container.querySelectorAll('.empfehlung-kategorie-btn');
    katButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    });
}

// Skript starten!
ladeProduktDetails();