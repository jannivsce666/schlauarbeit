function berechneCO2() {
    const strom = document.getElementById('stromverbrauch').value;
    const faktor = 0.401; // kg CO2 pro kWh (Durchschnitt)
    if (strom > 0) {
        const co2 = strom * faktor;
        document.getElementById('ergebnis').innerText = `Dein monatlicher CO₂-Ausstoß: ${co2.toFixed(2)} kg`;
    } else {
        document.getElementById('ergebnis').innerText = 'Bitte einen gültigen Wert eingeben.';
    }
}
