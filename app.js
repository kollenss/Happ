// Registrera service worker om den finns
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(()=>{});
}

// Schema för veckan – morgon / em (NAC) / kväll
const schedule = [
  {
    day: "Sön",
    d3: true,
    morning: [
      ["Sertralin",1],
      ["Tyrosin 500 mg",1],
      ["Rhodiola",1],
      ["Omega-3",2],
      ["D3 (5 kapslar)",5],
      ["Vitamin K2",1]
    ],
    afternoon: [
      ["Core NAC 600",1]
    ],
    evening: [
      ["Magnesium Bisglycinat",1],
      ["Zink + Selen",1]
    ]
  },
  {
    day: "Mån",
    d3: false,
    morning: [
      ["Sertralin",1],
      ["Tyrosin 500 mg",1],
      ["Rhodiola",1],
      ["Omega-3",2]
    ],
    afternoon: [
      ["Core NAC 600",1]
    ],
    evening: [
      ["Magnesium Bisglycinat",1]
    ]
  },
  {
    day: "Tis",
    d3: true,
    morning: [
      ["Sertralin",1],
      ["Tyrosin 500 mg",1],
      ["Rhodiola",1],
      ["B-Complex",1],
      ["Omega-3",2],
      ["D3 (5 kapslar)",5],
      ["Vitamin K2",1]
    ],
    afternoon: [
      ["Core NAC 600",1]
    ],
    evening: [
      ["Magnesium Bisglycinat",1],
      ["Zink + Selen",1]
    ]
  },
  {
    day: "Ons",
    d3: false,
    morning: [
      ["Sertralin",1],
      ["Tyrosin 500 mg",1],
      ["Rhodiola",1],
      ["B-Complex",1],
      ["Omega-3",2]
    ],
    afternoon: [
      ["Core NAC 600",1]
    ],
    evening: [
      ["Magnesium Bisglycinat",1],
      ["Zink + Selen",1]
    ]
  },
  {
    day: "Tors",
    d3: true,
    morning: [
      ["Sertralin",1],
      ["Tyrosin 500 mg",1],
      ["Rhodiola",1],
      ["B-Complex",1],
      ["Omega-3",2],
      ["D3 (5 kapslar)",5],
      ["Vitamin K2",1]
    ],
    afternoon: [
      ["Core NAC 600",1]
    ],
    evening: [
      ["Magnesium Bisglycinat",1],
      ["Zink + Selen",1]
    ]
  },
  {
    day: "Fre",
    d3: false,
    morning: [
      ["Sertralin",1],
      ["Tyrosin 500 mg",1],
      ["Rhodiola",1],
      ["B-Complex",1],
      ["Omega-3",2]
    ],
    afternoon: [
      ["Core NAC 600",1]
    ],
    evening: [
      ["Magnesium Bisglycinat",1],
      ["Zink + Selen",1]
    ]
  },
  {
    day: "Lör",
    d3: true,
    morning: [
      ["Sertralin",1],
      ["B-Complex",1],
      ["Omega-3",2],
      ["D3 (5 kapslar)",5],
      ["Vitamin K2",1]
    ],
    afternoon: [
      ["Core NAC 600",1]
    ],
    evening: [
      ["Magnesium Bisglycinat",1],
      ["Zink + Selen",1]
    ]
  }
];

function storageKey(day, part, index) {
  return `hp_${day}_${part}_${index}`;
}

function createSlot(dayLabel, partKey, labelText, items, badgeClass) {
  const det = document.createElement('details');
  det.open = true;

  const sum = document.createElement('summary');
  const badgeText =
    partKey === 'morning' ? 'Morgon' :
    partKey === 'afternoon' ? 'Em' : 'Kväll';
  sum.innerHTML = `<strong>${labelText}</strong> <span class="badge ${badgeClass}">${badgeText}</span>`;
  det.appendChild(sum);

  const list = document.createElement('div');
  list.className = 'list';

  items.forEach((it, i) => {
    const row = document.createElement('div');
    row.className = 'item';

    const lab = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox';

    const key = storageKey(dayLabel, partKey, i);
    cb.checked = localStorage.getItem(key) === '1';
    cb.addEventListener('change', () => {
      localStorage.setItem(key, cb.checked ? '1' : '0');
    });

    const name = document.createElement('span');
    name.textContent = `${it[0]} (${it[1]} kaps)`;

    lab.appendChild(cb);
    lab.appendChild(name);

    row.appendChild(lab);
    list.appendChild(row);
  });

  det.appendChild(list);
  return det;
}

function render() {
  const root = document.getElementById('days');
  root.innerHTML = "";

  schedule.forEach(dayObj => {
    const card = document.createElement('div');
    card.className = 'card';

    const head = document.createElement('div');
    head.className = 'day';
    head.textContent = dayObj.day;
    card.appendChild(head);

    if (dayObj.d3) {
      const small = document.createElement('div');
      small.className = 'muted';
      small.textContent = "D3 + K2-dag";
      card.appendChild(small);
    }

    card.appendChild(
      createSlot(dayObj.day, "morning", "Morgon ~08:00", dayObj.morning, "badge-morgon")
    );
    card.appendChild(
      createSlot(dayObj.day, "afternoon", "Efter middag ~19:00", dayObj.afternoon, "badge-em")
    );
    card.appendChild(
      createSlot(dayObj.day, "evening", "Kväll ~21:00", dayObj.evening, "badge-kvall")
    );

    root.appendChild(card);
  });
}

// Knappar
document.getElementById('btn-reset').addEventListener('click', () => {
  if (!confirm("Nollställ alla bockningar för veckan?")) return;
  Object.keys(localStorage).forEach(k => {
    if (k.startsWith('hp_')) localStorage.removeItem(k);
  });
  render();
});

document.getElementById('btn-clear-today').addEventListener('click', () => {
  const days = ["Sön","Mån","Tis","Ons","Tors","Fre","Lör"];
  const today = days[new Date().getDay()];
  if (!confirm(`Rensa bockningar för ${today}?`)) return;

  ["morning","afternoon","evening"].forEach(part => {
    for (let i = 0; i < 20; i++) {
      const key = storageKey(today, part, i);
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
      }
    }
  });
  render();
});

document.getElementById('btn-today').addEventListener('click', () => {
  const days = ["Sön","Mån","Tis","Ons","Tors","Fre","Lör"];
  const today = days[new Date().getDay()];
  const cards = Array.from(document.querySelectorAll('.card'));
  const index = schedule.findIndex(d => d.day === today);
  if (index >= 0 && cards[index]) {
    cards[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

render();