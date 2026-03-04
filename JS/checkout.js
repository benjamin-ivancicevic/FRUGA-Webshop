// 1. Wir suchen den Container, der IMMER da ist (schon beim Laden der Seite)
const produktListe = document.getElementById('produkt-liste');

// 2. Wir hängen den "Ohrenöffner" (Event Listener) an diesen Haupt-Container
if (produktListe) {
    produktListe.addEventListener('click', (event) => {
        
        // 3. Wir prüfen: Wurde ein Element mit der Klasse 'js-kauf-button' geklickt?
        // Der Trick mit .closest() sorgt dafür, dass es auch klappt, wenn man z.B. einen Text im Button klickt
        const button = event.target.closest('.js-kauf-button');
        
        // Wenn kein Button geklickt wurde (sondern z.B. nur das Bild oder der Hintergrund), 
        // machen wir einfach gar nichts und brechen ab.
        if (!button) return;

        // =========================================================
        // AB HIER STARTET DEIN EIGENER, ORIGINALER CODE!
        // =========================================================

        const productEan = button.dataset.productEan;
        let matchingItem;
        let cartQuantity = 0;

        cart.forEach((item) => {
            if(productEan === item.productEan) {
                matchingItem = item;
            }
        });

        if (matchingItem) {
            matchingItem.quantity += 1;
        } else { 
            cart.push({
                productEan: productEan,
                quantity: 1
            });
        }   

        cart.forEach((item) => {
            cartQuantity += item.quantity
        });

        const warenkorbZahlHTML = document.getElementById('warenkorb-zaehler');
        
        // Dein Code zum Überschreiben der HTML (habe ich ein winziges bisschen verkürzt)
        warenkorbZahlHTML.innerHTML = `${cartQuantity}`;
        
        // Kleine Hilfe für dich: Zeigt dir im Hintergrund an, was gerade im Korb liegt
        console.log("Warenkorb aktuell:", cart);
    });
}