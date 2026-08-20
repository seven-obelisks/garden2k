const rawEvents = JSON.parse(
  document.getElementById("calendar-events").textContent
);

const isValidDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const toNum = (value) => parseInt(value.replaceAll("-", ""), 10);

const events = rawEvents
  .map((event) => ({
    title: event.title || "",
    url: event.url || "",
    start: event.start || "",
    end: event.end || event.start || "",
    color: event.color || "#357edd",
  }))
  .filter((event) => isValidDate(event.start) && isValidDate(event.end))
  .sort((a, b) => toNum(a.start) - toNum(b.start));

const title = document.getElementById("calendar-title");
const grid = document.getElementById("calendar-grid");
const prev = document.getElementById("calendar-prev");
const next = document.getElementById("calendar-next");
const monthEventsTitle = document.getElementById("calendar-month-events-title");
const monthEventsEmpty = document.getElementById("calendar-month-events-empty");
const monthEventCards = document.querySelectorAll("#calendar-month-events > li[data-months]");

let current = new Date();

function renderCalendar() {
  const year = current.getFullYear();
  const month = current.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const now = new Date();
  const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  title.textContent = first.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  grid.innerHTML = "";

  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((day) => {
    const weekday = document.createElement("div");
    weekday.className = "calendar__weekday";
    weekday.textContent = day;
    grid.appendChild(weekday);
  });

  for (let i = 0; i < first.getDay(); i++) {
    const empty = document.createElement("div");
    empty.className = "calendar__day is-empty";
    grid.appendChild(empty);
  }

  for (let dayNumber = 1; dayNumber <= last.getDate(); dayNumber++) {
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      dayNumber
    ).padStart(2, "0")}`;

    const dateNum = toNum(dateString);

    const cell = document.createElement("div");
    cell.className = "calendar__day";
    if (dateString === todayString) {
      cell.classList.add("is-today");
    }

    const number = document.createElement("div");
    number.className = "calendar__day-number";
    number.textContent = dayNumber;
    cell.appendChild(number);

    let hasEvent = false;

    for (const event of events) {
      const startNum = toNum(event.start);

      if (startNum > dateNum) break;

      if (toNum(event.end) >= dateNum) {
        const link = document.createElement("a");
        link.className = "calendar__event";
        link.href = event.url;
        link.textContent = event.title;
        link.style.setProperty("--event-color", event.color);
        cell.appendChild(link);
        hasEvent = true;
      }
    }

    if (hasEvent) {
      cell.classList.add("has-events");
    }

    grid.appendChild(cell);
  }

  const totalCells = first.getDay() + last.getDate();
  const trailingEmpty = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < trailingEmpty; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar__day is-empty";
    grid.appendChild(empty);
  }
}

function filterMonthEvents() {
  const year = current.getFullYear();
  const month = current.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const first = new Date(year, month, 1);

  monthEventsTitle.textContent = `Events in ${first.toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" }
  )}`;

  let visibleCount = 0;

  monthEventCards.forEach((card) => {
    const months = card.dataset.months ? card.dataset.months.split(",") : [];
    const matches = months.includes(monthKey);
    card.classList.toggle("is-hidden", !matches);
    if (matches) visibleCount++;
  });

  monthEventsEmpty.hidden = visibleCount > 0;
}

prev.addEventListener("click", () => {
  current = new Date(current.getFullYear(), current.getMonth() - 1, 1);
  renderCalendar();
  filterMonthEvents();
});

next.addEventListener("click", () => {
  current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  renderCalendar();
  filterMonthEvents();
});

renderCalendar();
filterMonthEvents();