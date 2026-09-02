const menuButton = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-nav]");

function closeMenu() {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open menu");
  navigation.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
  navigation?.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

navigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

const todayHours = document.querySelector("[data-today-hours]");
if (todayHours) {
  try {
    const salonDay = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      timeZone: todayHours.dataset.timeZone,
    }).format(new Date());
    const schedule = JSON.parse(decodeURIComponent(todayHours.dataset.hours));
    const hours = schedule.find((entry) => entry.day === salonDay);
    const label = todayHours.querySelector("[data-today-hours-label]");

    if (hours && label) {
      label.textContent = hours.closed ? "Closed today" : `Open today · ${hours.display}`;
      todayHours.classList.toggle("is-closed", hours.closed);
    }
  } catch {
    // Keep the useful link to the full hours list if local date formatting is unavailable.
  }
}

const lightbox = document.querySelector("[data-lightbox]");
if (lightbox instanceof HTMLDialogElement) {
  const triggers = [...document.querySelectorAll("[data-lightbox-trigger]")];
  const image = lightbox.querySelector("[data-lightbox-image]");
  const caption = lightbox.querySelector("[data-lightbox-caption]");
  let activeIndex = 0;

  function showImage(index) {
    activeIndex = (index + triggers.length) % triggers.length;
    const trigger = triggers[activeIndex];
    image.src = trigger.dataset.src;
    image.alt = trigger.dataset.alt;
    caption.textContent = trigger.dataset.alt;
  }

  triggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => {
      showImage(index);
      lightbox.showModal();
    });
  });

  lightbox.querySelector("[data-lightbox-close]")?.addEventListener("click", () => lightbox.close());
  lightbox.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => showImage(activeIndex - 1));
  lightbox.querySelector("[data-lightbox-next]")?.addEventListener("click", () => showImage(activeIndex + 1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") showImage(activeIndex - 1);
    if (event.key === "ArrowRight") showImage(activeIndex + 1);
  });
}
