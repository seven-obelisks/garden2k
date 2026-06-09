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
  }))
  .filter((event) => isValidDate(event.start) && isValidDate(event.end))
  .sort((a, b) => toNum(a.start) - toNum(b.start));

const title = document.getElementById("calendar-title");
const grid = document.getElementById("calendar-grid");
const prev = document.getElementById("calendar-prev");
const next = document.getElementById("calendar-next");

let current = new Date();

function renderCalendar() {
  const year = current.getFullYear();
  const month = current.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  title.textContent = first.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  grid.innerHTML = "";

  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((day) => {
    const weekday = document.createElement("div");
    weekday.className = "calendar-weekday";
    weekday.textContent = day;
    grid.appendChild(weekday);
  });

  for (let i = 0; i < first.getDay(); i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day empty";
    grid.appendChild(empty);
  }

  for (let dayNumber = 1; dayNumber <= last.getDate(); dayNumber++) {
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      dayNumber
    ).padStart(2, "0")}`;

    const dateNum = toNum(dateString);

    const cell = document.createElement("div");
    cell.className = "calendar-day";

    const number = document.createElement("div");
    number.className = "calendar-day-number";
    number.textContent = dayNumber;
    cell.appendChild(number);

    for (const event of events) {
      const startNum = toNum(event.start);

      if (startNum > dateNum) break;

      // ISO date strings can be compared as YYYYMMDD numbers across month/year boundaries.
      if (toNum(event.end) >= dateNum) {
        const link = document.createElement("a");
        link.className = "calendar-event";
        link.href = event.url;
        link.textContent = event.title;
        cell.appendChild(link);
      }
    }

    grid.appendChild(cell);
  }
}

prev.addEventListener("click", () => {
  current = new Date(current.getFullYear(), current.getMonth() - 1, 1);
  renderCalendar();
});

next.addEventListener("click", () => {
  current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  renderCalendar();
});

renderCalendar();