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
    startFull: event.startFull || "",
    endFull: event.endFull || "",
    organizer: event.organizer || "",
    location: event.location || "",
    eventUrl: event.eventUrl || "",
    tags: Array.isArray(event.tags) ? event.tags : [],
  }))
  .filter((event) => isValidDate(event.start) && isValidDate(event.end))
  .sort((a, b) => toNum(a.start) - toNum(b.start));

const title = document.getElementById("calendar-title");
const grid = document.getElementById("calendar-grid");
const prev = document.getElementById("calendar-prev");
const next = document.getElementById("calendar-next");
const monthEventsTitle = document.getElementById("calendar-month-events-title");
const monthEventsList = document.getElementById("calendar-month-events");

let current = new Date();

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date)) return "";
  return date.toLocaleString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function urlize(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function makeIcon(emoji) {
  const icon = document.createElement("span");
  icon.className = "event-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = emoji;
  return icon;
}

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

      if (toNum(event.end) >= dateNum) {
        const link = document.createElement("a");
        link.className = "calendar-event";
        link.href = event.url;
        link.textContent = event.title;
        link.style.setProperty("--event-color", event.color);
        cell.appendChild(link);
      }
    }

    grid.appendChild(cell);
  }
}

function renderMonthEvents() {
  const year = current.getFullYear();
  const month = current.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const firstNum = toNum(
    `${year}-${String(month + 1).padStart(2, "0")}-01`
  );
  const lastNum = toNum(
    `${year}-${String(month + 1).padStart(2, "0")}-${String(
      last.getDate()
    ).padStart(2, "0")}`
  );

  monthEventsTitle.textContent = `Events in ${first.toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" }
  )}`;

  const monthEvents = events.filter((event) => {
    const startNum = toNum(event.start);
    const endNum = toNum(event.end);
    return startNum <= lastNum && endNum >= firstNum;
  });

  monthEventsList.innerHTML = "";

  if (!monthEvents.length) {
    const empty = document.createElement("p");
    empty.className = "next-event-empty";
    empty.textContent = "No events this month.";
    monthEventsList.appendChild(empty);
    return;
  }

  for (const event of monthEvents) {
    const li = document.createElement("li");
    li.className = "event-card event-card--compact clickable-card";
    li.dataset.href = event.url;
    li.dataset.tags = event.tags.map(urlize).join(",");
    li.setAttribute("role", "link");
    li.setAttribute("tabindex", "0");
    li.style.setProperty("--event-color", event.color);

    li.addEventListener("click", (evt) => {
      if (evt.target.closest("a, button")) return;
      window.location.href = event.url;
    });

    li.addEventListener("keydown", (evt) => {
      if (evt.key !== "Enter") return;
      if (evt.target.closest("a, button")) return;
      window.location.href = event.url;
    });

    const label = document.createElement("p");
    label.className = "event-label";
    label.appendChild(makeIcon("🏷️"));
    if (event.tags.length) {
      event.tags.forEach((tag, i) => {
        if (i) label.append(", ");
        const tagLink = document.createElement("a");
        tagLink.href = `/tags/${urlize(tag)}/`;
        tagLink.textContent = tag;
        label.appendChild(tagLink);
      });
    } else {
      label.append("Event");
    }
    li.appendChild(label);

    const heading = document.createElement("h3");
    heading.className = "event-card-title";
    const headingLink = document.createElement("a");
    headingLink.href = event.url;
    headingLink.textContent = event.title;
    const dot = document.createElement("span");
    dot.className = "event-card-color-dot";
    dot.setAttribute("aria-hidden", "true");
    heading.appendChild(headingLink);
    heading.appendChild(dot);
    li.appendChild(heading);

    const layout = document.createElement("div");
    layout.className = "event-card-layout";

    const info = document.createElement("div");
    info.className = "event-card-info";

    if (event.organizer) {
      const organizer = document.createElement("p");
      organizer.className = "event-organizer";
      organizer.appendChild(makeIcon("👥"));
      organizer.append(`Hosted by ${event.organizer}`);
      info.appendChild(organizer);
    }

    if (event.startFull || event.endFull) {
      const meta = document.createElement("p");
      meta.className = "event-meta-line";
      meta.appendChild(makeIcon("🗓️"));
      const startText = formatDateTime(event.startFull);
      const endText = formatDateTime(event.endFull);
      meta.append([startText, endText].filter(Boolean).join(" - "));
      info.appendChild(meta);
    }

    if (event.location) {
      const location = document.createElement("p");
      location.className = "event-location-line";
      location.appendChild(makeIcon("📍"));
      location.append(event.location);
      info.appendChild(location);
    }

    layout.appendChild(info);

    const actions = document.createElement("div");
    actions.className = "event-actions";

    if (event.eventUrl) {
      const websiteLink = document.createElement("a");
      websiteLink.className = "event_button";
      websiteLink.href = event.eventUrl;
      websiteLink.target = "_blank";
      websiteLink.rel = "noopener";
      websiteLink.appendChild(makeIcon("🎟️"));
      websiteLink.append("Register Now");
      actions.appendChild(websiteLink);
    }

    const icsLink = document.createElement("a");
    icsLink.className = "event_button";
    icsLink.href = `${event.url}event.ics`;
    icsLink.appendChild(makeIcon("🗓️"));
    icsLink.append("Add to Calendar");
    actions.appendChild(icsLink);

    layout.appendChild(actions);
    li.appendChild(layout);

    monthEventsList.appendChild(li);
  }
}

prev.addEventListener("click", () => {
  current = new Date(current.getFullYear(), current.getMonth() - 1, 1);
  renderCalendar();
  renderMonthEvents();
});

next.addEventListener("click", () => {
  current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  renderCalendar();
  renderMonthEvents();
});

renderCalendar();
renderMonthEvents();