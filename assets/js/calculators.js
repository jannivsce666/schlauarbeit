// calculators.js
(() => {
  // Tabs
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-panel');
  tabs.forEach(t => t.addEventListener('click', () => {
    const k = t.dataset.tab;
    tabs.forEach(x => x.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    t.classList.add('active');
    document.getElementById('tab-' + k)?.classList.add('active');
  }));

  // Strom
  const pf = document.getElementById('powerForm');
  const pr = document.getElementById('powerResult');
  pf && pf.addEventListener('submit', (e) => {
    e.preventDefault();
    const W = parseFloat(pf.powerWatts.value || '0');
    const h = parseFloat(pf.powerHours.value || '0');
    const price = parseFloat(pf.powerPrice.value || '0');
    const kWhDay = (W / 1000) * h;
    const costDay = kWhDay * price;
    const costYear = costDay * 365;
    pr.innerHTML = `Tagesverbrauch: <strong>${kWhDay.toFixed(2)} kWh</strong> • Kosten/Tag: <strong>${costDay.toFixed(2)} €</strong> • Kosten/Jahr: <strong>${costYear.toFixed(2)} €</strong>`;
  });

  // Wasser
  const wf = document.getElementById('waterForm');
  const wr = document.getElementById('waterResult');
  wf && wf.addEventListener('submit', (e) => {
    e.preventDefault();
    const lpm = parseFloat(wf.flowLpm.value || '0');
    const m = parseFloat(wf.minutes.value || '0');
    const price = parseFloat(wf.waterPrice.value || '0');
    const liters = lpm * m;
    const m3 = liters / 1000;
    const cost = m3 * price;
    wr.innerHTML = `Verbrauch: <strong>${liters.toFixed(1)} L</strong> • Kosten: <strong>${cost.toFixed(2)} €</strong>`;
  });

  // CO2
  const cf = document.getElementById('co2Form');
  const cr = document.getElementById('co2Result');
  cf && cf.addEventListener('submit', (e) => {
    e.preventDefault();
    const p = parseFloat(cf.co2Power.value || '0');   // kWh/Jahr
    const g = parseFloat(cf.co2Heat.value || '0');    // kWh/Jahr (Gas)
    const km = parseFloat(cf.co2Km.value || '0');     // km/Jahr
    // einfache Faktoren (Näherung)
    const EF_POWER = 0.35;   // kg/kWh
    const EF_GAS = 0.201;    // kg/kWh
    const EF_CAR = 0.150;    // kg/km
    const kg = p * EF_POWER + g * EF_GAS + km * EF_CAR;
    cr.innerHTML = `Schätzung: <strong>${(kg / 1000).toFixed(2)} t CO₂/Jahr</strong>`;
  });
})();
