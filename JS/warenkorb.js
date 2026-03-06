let cart = JSON.parse(localStorage.getItem('frugaWarenkorb')) || [];


function speichereWarenkorb() {
    localStorage.setItem('frugaWarenkorb', JSON.stringify(cart));
}

function aktualisiereZaehler() {
    let cartQuantity = 0;
    
    // Zählt alle Artikel im Warenkorb zusammen
    cart.forEach((item) => {
        cartQuantity += item.quantity;
    });

    // Sucht den roten Kreis in der Navbar und trägt die Zahl ein
    const zaehlerElement = document.getElementById('warenkorb-zaehler');
    if (zaehlerElement) {
        zaehlerElement.innerHTML = cartQuantity;
    }
}

// Wir rufen die Funktion sofort einmal auf, wenn die Seite lädt!
aktualisiereZaehler();



