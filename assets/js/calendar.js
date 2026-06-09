const events = JSON.parse(
  document.getElementById("calendar-events").textContent
).map((event) => ({
  title: event.title.replace(/^"|"$/g, ""),
  url: event.url.replace(/^"|"$/g, ""),
  start: event.start.replace(/^"|"$/g, ""),
  end: event.end.replace(/^"|"$/g, ""),
}));

const title = document.getElementById("calendar-title");
const grid = document.getElementById("calendar-grid");
const prev = document.getElementById("calendar-prev");
const next = document.getElementById("calendar-next");

function toNum(value) {
  return Number(String(value).replaceAll("-", ""));
}

let current = events.length
  ? new Date(
      Number(events[0].start.slice(0, 4)),
      Number(events[0].start.slice(5, 7)) - 1,
      1
    )
  : new Date();

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
    const dateNum = Number(
      String(year) +
        String(month + 1).padStart(2, "0") +
        String(dayNumber).padStart(2, "0")
    );

    const cell = document.createElement("div");
    cell.className = "calendar-day";

    const number = document.createElement("div");
    number.className = "calendar-day-number";
    number.textContent = dayNumber;
    cell.appendChild(number);

    events.forEach((event) => {
      if (dateNum >= toNum(event.start) && dateNum <= toNum(event.end)) {
        const link = document.createElement("a");
        link.className = "calendar-event";
        link.href = event.url;
        link.textContent = event.title;
        cell.appendChild(link);
      }
    });

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