// JS/app.js

async function ladeProdukte() {
    try {
        const antwort = await fetch('data/products.json');
        if (!antwort.ok) throw new Error(`Netzwerkfehler: ${antwort.status}`);
        
        const produkte = await antwort.json();
        
        // Wir rufen jetzt unsere neue Funktion auf, anstatt nur Text anzuzeigen!
        zeigeProdukteImShop(produkte);

    } catch (fehler) {
        console.error("Fehler:", fehler);
        const htmlContainer = document.getElementById('produkt-liste');
        if (htmlContainer) {
            htmlContainer.innerHTML = `<h2 style="color: red;">Fehler: ${fehler.message}</h2>`;
        }
    }
}

function zeigeProdukteImShop(produkte) {
    const htmlContainer = document.getElementById('produkt-liste');
    htmlContainer.innerHTML = ''; // Vorherigen Lade-Text löschen

    // Wir gehen jedes einzelne Produkt in der Liste durch
    produkte.forEach(produkt => {
        
        // 1. Ausnahme: Wenn alles 0 kostet, ist es nur eine Überschrift (z.B. "Limos und Schorlen:")
        if (produkt.preis_kasten === 0 && produkt.preis_sechser === 0) {
            htmlContainer.innerHTML += `<h2 class="kategorie-titel">${produkt.name}</h2>`;
            return; // Beendet den Durchlauf für diesen Eintrag und geht zum nächsten
        }

        // 2. Normales Produkt: Wir bauen das HTML zusammen
        // .toFixed(2) sorgt dafür, dass aus 3.1 immer 3.10 Euro wird!
        const produktHTML = `
            <div class="produkt-karte">
                <img src="images/produkte/icons/${produkt.bild}" alt="${produkt.name}" class="produkt-bild">
                
                <h3>${produkt.name}</h3>
                
                <div class="preis-box">
                    <p><strong>Kasten:</strong> ${produkt.preis_kasten.toFixed(2)} € <br><small>(+ ${produkt.pfand_kasten.toFixed(2)} € Pfand)</small></p>
                    
                    ${produkt.preis_sechser > 0 ? `<p><strong>6er-Pack:</strong> ${produkt.preis_sechser.toFixed(2)} € <br><small>(+ ${produkt.pfand_sechser.toFixed(2)} € Pfand)</small></p>` : ''}
                </div>

                <button class="kauf-button">In den Warenkorb</button>
            </div>
        `;
        
        // Fügt das fertige Produkt-HTML zu unserer Webseite hinzu
        htmlContainer.innerHTML += produktHTML;
    });
}

// Startschuss!
ladeProdukte();