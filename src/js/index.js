import visibleDates from "./dates";
import User from "./user";
import Backlog from "./backlog";

const spinnerWrapper = document.querySelector(".spinner-wrapper");
const mainWrapper = document.querySelector(".main-wrapper");
const datesRow = document.querySelector(".dates-row");
const scheduler = document.querySelector(".scheduler");
const template = document.querySelector(".user-row-template");
const backlogTasksSelector = document.querySelector(".tasks");
const control = document.querySelector(".control");
const searchInput = document.querySelector(".search-input");
const searchButton = document.querySelector(".search-button");

let tasks = [];
let users = [];

async function fetchTasks() {
  const response = await fetch(
    "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks"
  );
  return [...(await response.json())];
}

async function fetchUsers() {
  const response = await fetch(
    "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users"
  );
  return [...(await response.json())];
}

function renderDateRow() {
  visibleDates.forEach((item) => {
    const dateDiv = document.createElement("div");
    dateDiv.className = "date";
    dateDiv.innerHTML = `<p>${item}</p>`;
    datesRow.append(dateDiv);
  });
}

function renderPage() {
  renderDateRow();

  users.forEach((userData) => {
    const clone = template.content.cloneNode(true);
    scheduler.appendChild(clone);
    const usersRows = document.querySelectorAll(".user-row");
    const user = new User({ userData, tasks });
    const userRowInnerHtml = user.createUserRowInnerHtml();
    usersRows[usersRows.length - 1].innerHTML = userRowInnerHtml;
  });

  Backlog.renderBacklog({ tasks, searchString: searchInput.value });
}

function refreshPage() {
  const userRows = document.querySelectorAll(".user-row");
  const datesSelector = document.querySelectorAll(".date");
  userRows.forEach((item) => item.remove());
  datesSelector.forEach((item) => item.remove());

  setTimeout(() => renderPage(), 0);
}

function moveWeekRight() {
  visibleDates.splice(0, 7);
  const farRightDate = visibleDates[visibleDates.length - 1].split("-");
  const [year, month, day] = farRightDate;

  new Array(7).fill(1).forEach((_item, index) => {
    const nextDate = new Date(year, Number(month - 1), Number(day) + index + 1);
    visibleDates.push(
      `${nextDate.getFullYear()}-${
        nextDate.getMonth() + 1
      }-${nextDate.getDate()}`
    );
  });

  refreshPage();
}

function moveWeekLeft() {
  visibleDates.splice(-7, 7);
  const farLeftDate = visibleDates[0].split("-");
  const [year, month, day] = farLeftDate;

  new Array(7).fill(1).forEach((_item, index) => {
    const prevDate = new Date(
      year,
      Number(month - 1),
      Number(day) - (index + 1)
    );
    visibleDates.unshift(
      `${prevDate.getFullYear()}-${
        prevDate.getMonth() + 1
      }-${prevDate.getDate()}`
    );
  });

  refreshPage();
}

function events() {
  backlogTasksSelector.onmousedown = (e) => {
    let currentDroppable = null;
    const clickedTask = e.target.closest("div");

    if (clickedTask.classList.contains("backlog")) {
      return;
    }

    function moveAt(pageX, pageY) {
      clickedTask.style.left = `${pageX - clickedTask.offsetWidth / 2}px`;
      clickedTask.style.top = `${pageY - clickedTask.offsetHeight / 2}px`;
    }

    clickedTask.style.position = "absolute";
    document.body.append(clickedTask);
    moveAt(e.pageX, e.pageY);

    function onMouseMove(event) {
      moveAt(event.pageX, event.pageY);
      clickedTask.style.display = "none";
      const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
      clickedTask.style.display = "block";

      if (elemBelow === null) {
        return;
      }

      const droppableBelow =
        elemBelow.closest(".user-cell") || elemBelow.closest(".user-name");

      if (droppableBelow === null) {
        return;
      }

      if (currentDroppable !== droppableBelow) {
        if (currentDroppable) {
          currentDroppable.style.borderColor = "";
        }

        currentDroppable = droppableBelow;

        if (currentDroppable) {
          currentDroppable.style.borderColor = "red";
        }
      }
    }

    document.addEventListener("mousemove", onMouseMove);

    clickedTask.onmouseup = () => {
      const task = tasks.find((item) => item.id === clickedTask.dataset.id);

      if (
        currentDroppable !== null &&
        (currentDroppable.classList.contains("user-cell") ||
          currentDroppable.classList.contains("user-name"))
      ) {
        task.executor = Number(currentDroppable.dataset.id);

        if (currentDroppable.classList.contains("user-cell")) {
          task.planStartDate = currentDroppable.dataset.date;
          task.planEndDate = currentDroppable.dataset.date;
        }
      }

      document.removeEventListener("mousemove", onMouseMove);
      clickedTask.onmouseup = null;

      clickedTask.remove();
      refreshPage();
    };
  };

  control.addEventListener("click", (e) => {
    if (e.target.classList.contains("left-btn")) {
      moveWeekLeft();
      return;
    }

    if (e.target.classList.contains("right-btn")) {
      moveWeekRight();
    }
  });

  searchButton.addEventListener("click", () => {
    Backlog.renderBacklog({ tasks, searchString: searchInput.value });
  });
}

fetchTasks().then((responseTasks) => {
  tasks = responseTasks;
  fetchUsers().then((responseUsers) => {
    users = responseUsers;
    renderPage();
    events();
    spinnerWrapper.style.display = "none";
    mainWrapper.style.display = "block";
  });
});
