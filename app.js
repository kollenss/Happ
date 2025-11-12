// Registrera service worker om den finns
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

// ----- Hjälp-funktioner för datum -----

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateKey(date) {
  const d = startOfDay(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDayTitle(date) {
  const d = startOfDay(date);
  const weekdays = ["Sön", "Mån", "Tis", "Ons", "Tors", "Fre", "Lör"];
  const months = [
    "jan", "feb", "mar", "apr", "maj", "jun",
    "jul", "aug", "sep", "okt", "nov", "dec"
  ];
  return `${weekdays[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}

function getWeekdayTemplate(date) {
  const d = startOfDay(date);
  const weekday = d.getDay(); // 0=sön
  return weeklyTemplate[weekday];
}

// ----- Veckoschema (mall) -----
// index 0= Söndag ... 6 = Lördag
const weeklyTemplate = [
  {
    label: "Sön",
    d3: true,
    morning: [
      ["Sertralin", 1],
      ["Tyrosin 500 mg", 1],
      ["Rhodiola", 1],
      ["Omega-3", 2],
      ["D3", 5],
      ["Vitamin K2", 1]
    ],
    afternoon: [
      ["Core NAC 600", 1]
    ],
    evening: [
      ["Magnesium Bisglycinat", 1],
      ["Zink + Selen", 1]
    ],
    training: [
      ["Träningspass zon 2–3 (promenad 30–40 min eller löpning 3–5 km)", 1]
    ]
  },
  {
    label: "Mån",
    d3: false,
    morning: [
      ["Sertralin", 1],
      ["Tyrosin 500 mg", 1],
      ["Rhodiola", 1],
      ["Omega-3", 2]
    ],
    afternoon: [
      ["Core NAC 600", 1]
    ],
    evening: [
      ["Magnesium Bisglycinat", 1]
    ],
    training: [
      ["Träningspass zon 2–3 (promenad 30–40 min eller löpning 3–5 km)", 1]
    ]
  },
  {
    label: "Tis",
    d3: true,
    morning: [
      ["Sertralin", 1],
      ["Tyrosin 500 mg", 1],
      ["Rhodiola", 1],
      ["B-Complex", 1],
      ["Omega-3", 2],
      ["D3", 5],
      ["Vitamin K2", 1]
    ],
    afternoon: [
      ["Core NAC 600", 1]
    ],
    evening: [
      ["Magnesium Bisglycinat", 1],
      ["Zink + Selen", 1]
    ],
    training: [
      ["Träningspass zon 2–3 (promenad 30–40 min eller löpning 3–5 km)", 1]
    ]
  },
  {
    label: "Ons",
    d3: false,
    morning: [
      ["Sertralin", 1],
      ["Tyrosin 500 mg", 1],
      ["Rhodiola", 1],
      ["B-Complex", 1],
      ["Omega-3", 2]
    ],
    afternoon: [
      ["Core NAC 600", 1]
    ],
    evening: [
      ["Magnesium Bisglycinat", 1],
      ["Zink + Selen", 1]
    ],
    training: [
      ["Träningspass zon 2–3 (promenad 30–40 min eller löpning 3–5 km)", 1]
    ]
  },
  {
    label: "Tors",
    d3: true,
    morning: [
      ["Sertralin", 1],
      ["Tyrosin 500 mg", 1],
      ["Rhodiola", 1],
      ["B-Complex", 1],
      ["Omega-3", 2],
      ["D3", 5],
      ["Vitamin K2", 1]
    ],
    afternoon: [
      ["Core NAC 600", 1]
    ],
    evening: [
      ["Magnesium Bisglycinat", 1],
      ["Zink + Selen", 1]
    ],
    training: [
      ["Träningspass zon 2–3 (promenad 30–40 min eller löpning 3–5 km)", 1]
    ]
  },
  {
    label: "Fre",
    d3: false,
    morning: [
      ["Sertralin", 1],
      ["Tyrosin 500 mg", 1],
      ["Rhodiola", 1],
      ["B-Complex", 1],
      ["Omega-3", 2]
    ],
    afternoon: [
      ["Core NAC 600", 1]
    ],
    evening: [
      ["Magnesium Bisglycinat", 1],
      ["Zink + Selen", 1]
    ],
    training: [
      ["Träningspass zon 2–3 (promenad 30–40 min eller löpning 3–5 km)", 1]
    ]
  },
  {
    label: "Lör",
    d3: true,
    morning: [
      ["Sertralin", 1],
      ["B-Complex", 1],
      ["Omega-3", 2],
      ["D3", 5],
      ["Vitamin K2", 1]
    ],
    afternoon: [
      ["Core NAC 600", 1]
    ],
    evening: [
      ["Magnesium Bisglycinat", 1],
      ["Zink + Selen", 1]
    ],
    training: [
      ["Träningspass zon 2–3 (promenad 30–40 min eller löpning 3–5 km)", 1]
    ]
  }
];

// ----- LocalStorage-nycklar -----

function storageKey(date, part, index) {
  const keyDate = formatDateKey(date);
  return `hp_${keyDate}_${part}_${index}`;
}

// ----- State -----

let selectedDate = startOfDay(new Date());
let currentMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);

// ----- DOM-element -----

const monthLabelEl = document.getElementById("month-label");
const calendarGridEl = document.getElementById("calendar-grid");
const dayTitleEl = document.getElementById("day-title");
const daySubtitleEl = document.getElementById("day-subtitle");
const dayContentEl = document.getElementById("day-content");

const btnToday = document.getElementById("btn-today");
const btnClearToday = document.getElementById("btn-clear-today");
const btnReset = document.getElementById("btn-reset");

const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const calendarPanel = document.getElementById("calendar-panel");

// ----- Kalender-rendering -----

function renderCalendar() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "Maj", "Jun",
    "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"
  ];
  monthLabelEl.textContent = `${monthNames[month]} ${year}`;

  calendarGridEl.innerHTML = "";

  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay(); // 0=sön
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const totalCells = 42; // 6 veckor á 7 dagar
  const todayKey = formatDateKey(new Date());
  const selectedKey = formatDateKey(selectedDate);

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "calendar-day";

    let dayNumber;
    let cellDate;
    let isOtherMonth = false;

    if (i < startWeekday) {
      // från föregående månad
      dayNumber = daysInPrevMonth - (startWeekday - 1 - i);
      cellDate = new Date(year, month - 1, dayNumber);
      isOtherMonth = true;
    } else if (i >= startWeekday + daysInMonth) {
      // från nästa månad
      dayNumber = i - (startWeekday + daysInMonth) + 1;
      cellDate = new Date(year, month + 1, dayNumber);
      isOtherMonth = true;
    } else {
      // denna månad
      dayNumber = i - startWeekday + 1;
      cellDate = new Date(year, month, dayNumber);
    }

    const inner = document.createElement("div");
    inner.className = "calendar-day-inner";
    inner.textContent = dayNumber;

    if (isOtherMonth) {
      cell.classList.add("other-month");
    }

    const cellKey = formatDateKey(cellDate);
    const isToday = cellKey === todayKey;
    const isSelected = cellKey === selectedKey;

    if (isToday) {
      cell.classList.add("today");
    }
    if (isSelected) {
      cell.classList.add("selected");
    }

    // Liten markör om nåt är ibockat för den dagen
    const hasAnyCheck = hasAnyCheckmarkForDate(cellDate);
    if (hasAnyCheck) {
      const dot = document.createElement("div");
      dot.className = "dot";
      inner.appendChild(dot);
    }

    cell.appendChild(inner);

    cell.addEventListener("click", () => {
      selectedDate = startOfDay(cellDate);
      renderCalendar();
      renderDaySheet();
    });

    calendarGridEl.appendChild(cell);
  }
}

// Kolla om det finns nån key i localStorage för datumet
function hasAnyCheckmarkForDate(date) {
  const prefix = `hp_${formatDateKey(date)}_`;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix) && localStorage.getItem(k) === "1") {
      return true;
    }
  }
  return false;
}

// ----- Dagens sheet -----

function createSlot(date, partKey, labelText, items, badgeClass) {
  const sectionCard = document.createElement("div");
  sectionCard.className = "card";

  const headerRow = document.createElement("div");
  headerRow.className = "section-title-row";

  const title = document.createElement("div");
  title.className = "section-title";
  title.textContent = labelText;

  const badge = document.createElement("div");
  badge.className = `section-badge ${badgeClass}`;
  const badgeText =
    partKey === "morning" ? "Morgon" :
    partKey === "afternoon" ? "Em" :
    partKey === "evening" ? "Kväll" :
    "Träning";
  badge.textContent = badgeText;

  headerRow.appendChild(title);
  headerRow.appendChild(badge);
  sectionCard.appendChild(headerRow);

  const list = document.createElement("div");
  list.className = "list";

  items.forEach((it, i) => {
    const row = document.createElement("div");
    row.className = "item";

    const lab = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";

    const key = storageKey(date, partKey, i);
    cb.checked = localStorage.getItem(key) === "1";
    cb.addEventListener("change", () => {
      localStorage.setItem(key, cb.checked ? "1" : "0");
      // uppdatera markör i kalendern
      renderCalendar();
    });

    const name = document.createElement("span");
    name.textContent = it[0];

    lab.appendChild(cb);
    lab.appendChild(name);
    row.appendChild(lab);
    list.appendChild(row);
  });

  sectionCard.appendChild(list);
  return sectionCard;
}

function renderDaySheet() {
  const tpl = getWeekdayTemplate(selectedDate);
  dayTitleEl.textContent = formatDayTitle(selectedDate);

  let subtitle = tpl.d3 ? "D3 + K2-dag" : "Standarddag";
  subtitle += " • Träning zon 2–3";
  daySubtitleEl.textContent = subtitle;

  dayContentEl.innerHTML = "";

  dayContentEl.appendChild(
    createSlot(selectedDate, "morning", "Morgon ~08:00", tpl.morning, "badge-morgon")
  );
  dayContentEl.appendChild(
    createSlot(selectedDate, "afternoon", "Efter middag ~19:00 (NAC)", tpl.afternoon, "badge-em")
  );
  dayContentEl.appendChild(
    createSlot(selectedDate, "evening", "Kväll ~21:00", tpl.evening, "badge-kvall")
  );
  if (tpl.training) {
    dayContentEl.appendChild(
      createSlot(selectedDate, "training", "Träning – zon 2–3", tpl.training, "badge-traning")
    );
  }
}

// ----- Knappar -----

btnToday.addEventListener("click", () => {
  selectedDate = startOfDay(new Date());
  currentMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  renderCalendar();
  renderDaySheet();
});

btnClearToday.addEventListener("click", () => {
  if (!confirm("Rensa alla bockningar för den här dagen?")) return;
  const parts = ["morning", "afternoon", "evening", "training"];
  const dateKey = formatDateKey(selectedDate);

  parts.forEach((part) => {
    for (let i = 0; i < 20; i++) {
      const key = `hp_${dateKey}_${part}_${i}`;
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
      }
    }
  });

  renderDaySheet();
  renderCalendar();
});

btnReset.addEventListener("click", () => {
  if (!confirm("Nollställ alla bockningar för alla dagar?")) return;
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("hp_")) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
  renderDaySheet();
  renderCalendar();
});

// ----- Månadsknappar -----

prevMonthBtn.addEventListener("click", () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  renderCalendar();
});

// ----- Swipe för månad -----

let touchStartX = null;

calendarPanel.addEventListener("touchstart", (e) => {
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
  }
});

calendarPanel.addEventListener("touchend", (e) => {
  if (touchStartX === null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const threshold = 40;
  if (dx > threshold) {
    // svep höger → föregående månad
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    renderCalendar();
  } else if (dx < -threshold) {
    // svep vänster → nästa månad
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    renderCalendar();
  }
  touchStartX = null;
});

// ----- Init -----

renderCalendar();
renderDaySheet();