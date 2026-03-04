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

        cart.forEach((item) => {
            cartQuantity += item.quantity
        });

        const warenkorbZahlHTML = document.getElementById('warenkorb-zaehler');
        
        
        warenkorbZahlHTML.innerHTML = `${cartQuantity}`;
        
        
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