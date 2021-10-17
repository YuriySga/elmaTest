import visibleDates from "./dates";

export default class User {
  constructor({ userData, tasks }) {
    this.id = userData.id;
    this.username = userData.username;
    this.surname = userData.surname;
    this.firstName = userData.firstName;
    this.secondName = userData.secondName;
    this.tasks = tasks;
  }

  createUserRowInnerHtml() {
    const tasksRow = [];
    const userTasks = this.tasks.filter((task) => task.executor === this.id);

    const checkTaskTime = ({ planStartDate, planEndDate, currentDate }) => {
      if (
        new Date(planStartDate) <= new Date(currentDate) &&
        new Date(currentDate) <= new Date(planEndDate)
      ) {
        return true;
      }

      return false;
    };

    visibleDates.forEach((data) => {
      const todayTasks = userTasks.filter((task) =>
        checkTaskTime({
          planStartDate: task.planStartDate,
          planEndDate: task.planEndDate,
          currentDate: data,
        })
      );
      tasksRow.push(todayTasks);
    });

    let elements = "";

    tasksRow.forEach((dayTasks, dayTasksIndex) => {
      let dayEl = "";

      if (dayTasks.length) {
        dayTasks.forEach((item) => {
          dayEl = `${dayEl}<div class="user-task">
                        <p data-title="Описание: ${item.description}">${item.subject}</p>
                        </div>`;
        });
      }

      elements = `${elements}${`<div data-id=${this.id} data-date="${visibleDates[dayTasksIndex]}" class="user-cell">${dayEl}</div>`} `;
    });

    return `<div class="user-name" data-id=${this.id}>${this.firstName}</div>
                    ${elements}`;
  }
}
