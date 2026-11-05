import { wedding } from "./site.config.js";

// Navigace na mobilu.
const navigation = document.querySelector("#navigation");
const menuToggle = document.querySelector(".menu-toggle");
function closeMenu() {
  navigation.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Otevřít menu");
}
menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  navigation.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Zavřít menu" : "Otevřít menu",
  );
});
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuToggle.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu();
    menuToggle.focus();
  }
});
window.matchMedia("(min-width: 561px)").addEventListener("change", closeMenu);

// Po návratu na kartu se čas znovu počítá podle hodin, ne podle počtu ticků.
const countdown = document.querySelector("#wedding-countdown");
const ceremonyTime = new Date(wedding.date).getTime();
let countdownTimer;
function updateCountdown() {
  clearTimeout(countdownTimer);
  if (!Number.isFinite(ceremonyTime)) return;
  const remaining = Math.max(0, Math.ceil((ceremonyTime - Date.now()) / 1000));
  const values = {
    days: Math.floor(remaining / 86400),
    hours: Math.floor((remaining % 86400) / 3600),
    minutes: Math.floor((remaining % 3600) / 60),
    seconds: remaining % 60,
  };
  for (const [unit, value] of Object.entries(values)) {
    const element = countdown.querySelector(`[data-countdown="${unit}"]`);
    const text = String(value).padStart(unit === "days" ? 3 : 2, "0");
    if (element.textContent !== text) element.textContent = text;
  }
  countdown.hidden = false;
  countdown.setAttribute(
    "aria-label",
    remaining > 0
      ? `Do obřadu zbývá ${values.days} dní, ${values.hours} hodin, ${values.minutes} minut a ${values.seconds} sekund.`
      : "Dočkali jsme se našeho ANO.",
  );
  if (remaining === 0) {
    countdown.querySelector(".countdown-caption").textContent =
      "Dočkali jsme se našeho ANO.";
    countdown.classList.add("is-complete");
  } else if (!document.hidden) {
    countdownTimer = setTimeout(
      updateCountdown,
      1000 - (Date.now() % 1000) + 10,
    );
  }
}
updateCountdown();
document.addEventListener("visibilitychange", updateCountdown);
window.addEventListener("pageshow", updateCountdown);

// Jedna otevřená odpověď udržuje FAQ kompaktní i ve starších prohlížečích.
const questions = [...document.querySelectorAll(".faq-list details")];
questions.forEach((question) =>
  question.addEventListener("toggle", () => {
    if (question.open)
      questions.forEach((other) => {
        if (other !== question) other.open = false;
      });
  }),
);

// Krátké zatřesení stránky a fajfka, ze které vyroste půllitr.
const celebration = document.querySelector("#celebration");
let shakeTimer;
function closeCelebration() {
  if (celebration.open) celebration.close();
}
celebration
  .querySelectorAll("button")
  .forEach((button) => button.addEventListener("click", closeCelebration));
celebration.addEventListener("click", (event) => {
  if (event.target !== celebration) return;
  const bounds = celebration.getBoundingClientRect();
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  )
    closeCelebration();
});
celebration.addEventListener("close", () => {
  document.body.classList.remove("is-celebrating", "celebration-open");
  clearTimeout(shakeTimer);
  document.querySelector("#form-success").focus({ preventScroll: true });
});
function celebrate() {
  // Prohlížeče bez dialogu mají stále plnohodnotné potvrzení ve formuláři.
  if (typeof celebration.showModal !== "function") return;
  celebration.showModal();
  document.body.classList.add("celebration-open");
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.body.classList.add("is-celebrating");
    shakeTimer = setTimeout(
      () => document.body.classList.remove("is-celebrating"),
      450,
    );
  }
}

// Jemné odhalování obsahu respektuje nastavení omezeného pohybu.
if (
  "IntersectionObserver" in window &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.08 },
  );
  for (const element of document.querySelectorAll(".reveal"))
    observer.observe(element);
  document.documentElement.classList.add("js-motion");
}

// Stažitelná pozvánka funguje bez účtu v Google/Apple/Microsoft kalendáři.
const calendarEscape = (text) =>
  text
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
const calendarDate = (date) =>
  new Date(date)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
function foldCalendarLine(line) {
  const encoder = new TextEncoder();
  let result = "";
  let length = 0;
  for (const char of line) {
    const bytes = encoder.encode(char).length;
    if (length + bytes > 75) {
      result += "\r\n ";
      length = 1;
    }
    result += char;
    length += bytes;
  }
  return result;
}
document.querySelectorAll("[data-calendar]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Alexandra a Krystof//Svatebni pozvanka//CS",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:alexandra-krystof-20270605@wedding.local",
      `DTSTAMP:${calendarDate(new Date())}`,
      `DTSTART:${calendarDate(wedding.date)}`,
      `DTEND:${calendarDate(wedding.end)}`,
      `SUMMARY:${calendarEscape(`Svatba — ${wedding.names}`)}`,
      `LOCATION:${calendarEscape(wedding.location)}`,
      `DESCRIPTION:${calendarEscape("Příjezd hostů od 13:00. Obřad ve 14:30. Obřad i hostina v Trojanově mlýně. Těšíme se na vás!")}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ];
    const url = URL.createObjectURL(
      new Blob([lines.map(foldCalendarLine).join("\r\n") + "\r\n"], {
        type: "text/calendar;charset=utf-8",
      }),
    );
    const download = document.createElement("a");
    download.href = url;
    download.download = "alexandra-a-krystof-5-6-2027.ics";
    document.body.append(download);
    download.click();
    download.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  });
});

// Přihlášky: pouze skutečná odpověď služby může zobrazit potvrzení o přijetí.
const form = document.querySelector("#rsvp-form");
const attendanceDetails = document.querySelector("#attendance-details");
const status = document.querySelector("#form-status");
const submit = form.querySelector('button[type="submit"]');
const submitLabel = submit.querySelector("span");
const success = document.querySelector("#form-success");
const setupNote = document.querySelector("#form-setup-note");
const endpoint = wedding.formEndpoint.trim();
const configured = /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint);
let submitting = false;

function attendanceChanged() {
  const attending = form.elements.attendance.value === "Ano, přijdu";
  attendanceDetails.hidden = !attending;
  attendanceDetails.disabled = !attending;
}
form.addEventListener("change", (event) => {
  if (event.target.name === "attendance") attendanceChanged();
});
window.addEventListener("pageshow", attendanceChanged);

if (configured) {
  form.action = endpoint;
  setupNote.hidden = true;
  submit.disabled = false;
  submitLabel.textContent = "Odeslat odpověď";
  form.elements._gotcha.disabled = false;
}

if (/^\d{4}-\d{2}-\d{2}$/.test(wedding.rsvpDeadline)) {
  const deadline = new Date(`${wedding.rsvpDeadline}T12:00:00+02:00`);
  if (!Number.isNaN(deadline.getTime())) {
    const label = document.querySelector(".rsvp-deadline");
    label.textContent = `Dejte nám prosím vědět do ${new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "long", year: "numeric", timeZone: wedding.timezone }).format(deadline)}.`;
    label.hidden = false;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (submitting) return;
  if (!configured) {
    status.textContent =
      "Přihlašování zatím není otevřené. Zkuste to prosím později.";
    status.focus();
    return;
  }
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const attending = data.get("attendance") === "Ano, přijdu";
  // Honeypot nikdy nevytváří falešné potvrzení o přijetí.
  if (data.get("_gotcha")) return;
  data.set("name", String(data.get("name")).trim());
  data.set("email", String(data.get("email")).trim());
  if (!data.get("name")) {
    form.elements.name.setCustomValidity("Napište prosím své jméno.");
    form.elements.name.reportValidity();
    return;
  }
  data.set(
    "_subject",
    `Svatba — ${attending ? "Potvrzení účasti" : "Omluva"} — ${data.get("name")}`,
  );

  status.textContent = "";
  submitting = true;
  submit.disabled = true;
  submitLabel.textContent = "Odesíláme…";
  form.setAttribute("aria-busy", "true");
  // Zabraňuje změnám během odesílání; FormData jsou už zachycená.
  const controls = [...form.querySelectorAll("input, select, textarea")];
  const originalDisabled = controls.map((control) => control.disabled);
  controls.forEach((control) => {
    control.disabled = true;
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) {
      if (response.status === 429) throw new Error("limit");
      if (response.status === 422) throw new Error("validation");
      throw new Error("server");
    }
    form.hidden = true;
    document.querySelector("#success-message").textContent = attending
      ? "Vaše odpověď dorazila. Máme radost, že náš den oslavíte s námi. Těšíme se na vás u mlýna!"
      : "Vaše odpověď dorazila. Děkujeme, že jste nám dali vědět. Budete nám chybět!";
    success.hidden = false;
    success.focus();
    celebrate();
  } catch (error) {
    const messages = {
      limit:
        "Odpovědí teď dorazilo více najednou. Počkejte prosím chvíli a zkuste odeslání znovu.",
      validation:
        "Odpověď se nepodařilo odeslat. Zkontrolujte prosím vyplněné údaje, především e-mail.",
      server:
        "Služba přihlášku nepřijala. Vaše údaje zůstávají vyplněné. Zkuste to prosím později, případně se ozvěte na kontakty níže.",
    };
    status.textContent =
      messages[error.message] ||
      "Nepodařilo se potvrdit přijetí odpovědi. Vaše údaje zůstávají vyplněné. Zkontrolujte připojení a zkuste to znovu; pokud potíže trvají, ozvěte se na kontakty níže.";
    status.focus();
  } finally {
    clearTimeout(timeout);
    submitting = false;
    submit.disabled = false;
    submitLabel.textContent = "Odeslat odpověď";
    controls.forEach((control, index) => {
      control.disabled = originalDisabled[index];
    });
    form.removeAttribute("aria-busy");
  }
});
form.elements.name.addEventListener("input", () =>
  form.elements.name.setCustomValidity(""),
);
document.querySelector("#another-response").addEventListener("click", () => {
  form.reset();
  form.elements.name.setCustomValidity("");
  attendanceChanged();
  status.textContent = "";
  success.hidden = true;
  form.hidden = false;
  form.querySelector('input[name="attendance"]').focus();
});
