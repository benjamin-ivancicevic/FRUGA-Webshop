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
            // Wenn nicht, setzen wir einen Platzhaltertext.
           const beschreibung = gesuchtesProdukt.beschreibung ? gesuchtesProdukt.beschreibung : "Für dieses Produkt liegt noch keine genaue Beschreibung vor.";
            const allergene = gesuchtesProdukt.allergene ? gesuchtesProdukt.allergene : "Keine Angaben zu Allergenen.";

            // 1. Logik für Einheit und Sixpack (Genau wie auf der Startseite!)
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

            // 4. Das HTML für die Detailseite bauen (mit Preis, Dropdown und Button)
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
            `;
            
            document.getElementById('einzelprodukt-container').innerHTML = detailHTML;
            // Das Dropdown-Menü und das Bild aus dem HTML greifen
            const variantenDropdown = document.getElementById('detail-variante');
            const produktBild = document.getElementById('detail-produkt-bild');

            // Prüfen, ob das Dropdown existiert (manche Produkte haben ja keine Auswahl)
            if (variantenDropdown && produktBild) {
                variantenDropdown.addEventListener('change', (event) => {
                    const gewaehlteVariante = event.target.value;
                    
                    // Wenn "6er-Pack" (oder Einzelflasche) gewählt wird -> Flaschenbild zeigen
                    if (gewaehlteVariante === 'sechser') {
                        produktBild.src = `images/icons/${gesuchtesProdukt.bild_flasche}`;
                    } 
                    // Ansonsten (Kasten) -> Kastenbild zeigen
                    else {
                        produktBild.src = `images/icons/${gesuchtesProdukt.bild_kasten}`;
                    }
                });
}

            // ==========================================
            // NEU: Dem Button das Leben einhauchen!
            // ==========================================
            const kaufButton = document.getElementById('detail-kauf-button');
            kaufButton.addEventListener('click', () => {
                const productEan = kaufButton.dataset.productEan;
                const produktArt = document.getElementById('detail-variante').value;
                let matchingItem;

                // Prüfen ob schon im Korb
                cart.forEach((item) => {
                    if(productEan === item.productEan && produktArt === item.produktArt) {
                        matchingItem = item;
                    }
                });

                // Hinzufügen oder erhöhen
                if (matchingItem) {
                    matchingItem.quantity += 1;
                } else { 
                    cart.push({
                        productEan: productEan,
                        quantity: 1,
                        produktArt: produktArt
                    });
                }   

                // Speichern und rote Zahl oben aktualisieren! (Funktionen aus warenkorb.js)
                speichereWarenkorb();
                aktualisiereZaehler();

                // Button kurz grün machen
                const originalText = kaufButton.innerText;
                kaufButton.innerText = "Hinzugefügt! ✔";
                kaufButton.style.backgroundColor = "#218838";
                setTimeout(() => {
                    kaufButton.innerText = originalText;
                    kaufButton.style.backgroundColor = "#28a745";
                }, 1000);
            });
        }

    } catch (fehler) {
        console.error("Fehler:", fehler);
    }
}

// Skript starten!
ladeProduktDetails();