// 1. Wir suchen den Container, der IMMER da ist (schon beim Laden der Seite)
const produktListe = document.getElementById('produkt-liste');

// 2. Wir hängen den "Ohrenöffner" (Event Listener) an diesen Haupt-Container
if (produktListe) {
    produktListe.addEventListener('click', (event) => {
        
        // 3. Wir prüfen: Wurde ein Element mit der Klasse 'js-kauf-button' geklickt?
        const button = event.target.closest('.js-kauf-button');
        
        // Wenn kein Button geklickt wurde (sondern z.B. nur das Bild oder der Hintergrund), 
        // machen wir einfach gar nichts und brechen ab.
        if (!button) return;

  

        const productEan = button.dataset.productEan;
        let matchingItem;
        let cartQuantity = 0;

        const produktKarte = button.closest('.produkt-karte');
        const selectFeld = produktKarte.querySelector('.type-selection');
        let produktArt = selectFeld ? selectFeld.value : 'Kasten';

        cart.forEach((item) => {
            if(productEan === item.productEan  && produktArt === item.produktArt) {
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
        
        
        console.log("Warenkorb aktuell:", cart);

        const originalText = button.innerText;
        button.innerText = "Hinzugefügt! ✔";
        button.style.backgroundColor = "#218838";
        setTimeout(() => {
            button.innerText = originalText;
            button.style.backgroundColor = "#28a745";
        }, 1000);
    });
}

async function ladeProdukte() {
    try {
        const antwort = await fetch('data/products.json');
        if (!antwort.ok) throw new Error(`Netzwerkfehler: ${antwort.status}`);
        
        const produkte = await antwort.json();
        
        zeigeProdukteImWarenkorb(produkte);
    

    } catch (fehler) {
        console.error("Fehler:", fehler);
        const htmlContainer = document.querySelector('.order-summary');
        if (htmlContainer) {
            htmlContainer.innerHTML = `<h2 style="color: red;">Fehler: ${fehler.message}</h2>`;
        }
    }
}

function zeigeProdukteImWarenkorb(produkte) {
    let cartSummaryHTML = '';
    
    // Unsere Taschenrechner-Variablen
    let gesamtWarenwert = 0;
    let gesamtPfand = 0;

    // Wenn der Korb leer ist
    if (!cart || cart.length === 0) {
        document.querySelector('.order-summary').innerHTML = '<p>Dein Warenkorb ist leider noch leer.</p>';
        document.querySelector('.payment-summary').innerHTML = ''; // Rechte Box verstecken
        return;
    }

    cart.forEach((cartItem) => {
        const productEan = cartItem.productEan;
        const produktArt = cartItem.produktArt; // "Kasten" oder "Sixpack"
        let matchingProduct;

        produkte.forEach((product) => {
            if (productEan === product.ean) {
                matchingProduct = product;
            }
        });

        if (matchingProduct) {
            // 1. WELCHER PREIS GILT? (Kasten oder 6er-Pack)
            let itemPreis = 0;
            let itemPfand = 0;
            let artText = "";

            if (produktArt === "Kasten" || produktArt === "kasten") {
                itemPreis = matchingProduct.preis_kasten;
                itemPfand = matchingProduct.pfand_kasten;
                artText = "Kasten";
            } else {
                itemPreis = matchingProduct.preis_sechser;
                itemPfand = matchingProduct.pfand_sechser;
                artText = "6er-Pack";
            }

            // 2. RECHNEN: Preis mal Menge
            gesamtWarenwert += (itemPreis * cartItem.quantity);
            gesamtPfand += (itemPfand * cartItem.quantity);

            // 3. HTML FÜR DEN ARTIKEL BAUEN
            cartSummaryHTML += `
            <div class="cart-item-container">
                <div class="cart-item-details-grid">
                    <img class="produkt-image" src="images/produkte/icons/${matchingProduct.bild}">
                    <div class="cart-item-details">
                        <div class="produkt-name"><strong>${matchingProduct.name}</strong> (${artText})</div>
                        <div class="produkt-price">
                            <div>Einzelpreis: ${itemPreis.toFixed(2)} €</div>
                            <div>Pfand: ${itemPfand.toFixed(2)} €</div>
                            <div class="produkt-menge"><strong>Menge: ${cartItem.quantity}</strong></div>
                            <button class="delete-button js-delete-button" data-product-ean="${productEan}" data-produkt-art="${produktArt}">Löschen</button> 
                        </div>
                    </div>
                </div>
            </div>
            `;
        }
    });

    // Linke Spalte befüllen
    document.querySelector('.order-summary').innerHTML = cartSummaryHTML;

    // 4. DIE RECHTE KASSEN-BOX BAUEN
    const gesamtSumme = gesamtWarenwert + gesamtPfand;
    
    const checkoutBoxHTML = `
        <div class="kassen-box">
            <h3>Bestellübersicht</h3>
            <div class="summary-row">
                <span>Zwischensumme:</span>
                <span>${gesamtWarenwert.toFixed(2)} €</span>
            </div>
            <div class="summary-row">
                <span>Pfand:</span>
                <span>${gesamtPfand.toFixed(2)} €</span>
            </div>
            <hr>
            <div class="summary-row total-row">
                <span>Gesamtsumme:</span>
                <span>${gesamtSumme.toFixed(2)} €</span>
            </div>
            <button class="checkout-button">Zahlungspflichtig bestellen</button>
            <p class="hinweis-text">Bezahlung erfolgt in bar bei der Lieferung,oder per Überweisung im Anschluss.</p>
        </div>
    `;

    document.querySelector('.payment-summary').innerHTML = checkoutBoxHTML;
}

const orderSummaryContainer = document.querySelector('.order-summary');

// Prüfen, ob wir uns überhaupt auf der Warenkorb-Seite befinden
if (orderSummaryContainer) {
    orderSummaryContainer.addEventListener('click', (event) => {
        
        // 1. Wurde ein Löschen-Button geklickt?
        const deleteButton = event.target.closest('.js-delete-button');
        if (!deleteButton) return;

        // 2. Heraussuchen, WAS gelöscht werden soll (EAN und Variante)
        const eanZumLoeschen = deleteButton.dataset.productEan;
        const artZumLoeschen = deleteButton.dataset.produktArt;

        // 3. Den Korb filtern! 
        // Wir bauen den Korb neu auf. Es dürfen nur Artikel rein, die NICHT genau dieses Produkt sind.
        cart = cart.filter((cartItem) => {
            if (cartItem.productEan === eanZumLoeschen && cartItem.produktArt === artZumLoeschen) {
                return false; // Rauswerfen!
            } else {
                return true;  // Behalten!
            }
        });

        
        speichereWarenkorb();
        
        
        aktualisiereZaehler();

        
        ladeProdukte(); 
    });
}

ladeProdukte();