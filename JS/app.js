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

        // Welche Kategorie steht im 'data-kategorie' Attribut? (z.B. "bier")
        const gewaehlteKategorie = geklickteKarte.dataset.kategorie;

        // DEN FILTER ANWENDEN!
        // Nimm alle Produkte und behalte nur die, deren Kategorie passt
        const gefilterteProdukte = alleProdukteDaten.filter((produkt) => {
            return produkt.kategorie === gewaehlteKategorie;
        });

        // Jetzt schicken wir nur diese kleine, gefilterte Liste an unsere Anzeige-Funktion!
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
        // 1. Welche Einheit ist die Haupt-Einheit? (Flasche oder Kasten)
        // Wenn in der JSON nichts steht, nehmen wir automatisch "Kasten"
        let hauptEinheit = produkt.einheit ? produkt.einheit : "Kasten";
        
        // 2. Gibt es überhaupt einen 6er-Pack? (Prüft, ob der Preis über 0 liegt)
        let hatSixpack = produkt.preis_sechser > 0;

        // 3. Den Preis-Bereich bauen
        let preisBoxHTML = `
            <p><strong>${hauptEinheit}:</strong> ${produkt.preis_kasten.toFixed(2)} € <br>
            <small>(+ ${produkt.pfand_kasten.toFixed(2)} € Pfand)</small></p>
        `;

        // Wenn es ein Sixpack gibt, fügen wir den 2. Preis dazu
        if (hatSixpack) {
            preisBoxHTML += `
            <p><strong>6er-Pack:</strong> ${produkt.preis_sechser.toFixed(2)} € <br>
            <small>(+ ${produkt.pfand_sechser.toFixed(2)} € Pfand)</small></p>
            `;
        }

        // 4. Das Dropdown ODER das unsichtbare Feld bauen
        let variantenHTML = '';
        if (hatSixpack) {
            // Dropdown anzeigen
            variantenHTML = `
            <select class="varianten-auswahl">
                <option value="${hauptEinheit.toLowerCase()}">${hauptEinheit}</option>
                <option value="sechser">6er-Pack</option>
            </select>
            `;
        } else {
            // Kein Sixpack? Dann nur ein unsichtbares Feld für unser JavaScript!
            variantenHTML = `<input type="hidden" class="varianten-auswahl" value="${hauptEinheit.toLowerCase()}">`;
        }

        

        // 5. Die komplette Karte zusammensetzen
        produktHTML += `
            <div class="produkt-karte">
                <a href="produkt.html?ean=${produkt.ean}" class="produkt-detail-link" style="text-decoration: none; color: inherit;">
                    <img src="images/produkte/icons/${produkt.bild}" alt="${produkt.name}" class="produkt-bild">
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
}


ladeProdukte();