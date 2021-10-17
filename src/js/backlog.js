export default class Backlog {
  static renderBacklog({ tasks, searchString }) {
    const backlogTasksUl = document.querySelector(".tasks");
    const tasksNode = document.querySelectorAll(".task-wrapper");
    tasksNode.forEach((i) => i.remove());

    tasks.forEach((task) => {
      if (task.executor === null) {
        if (
          searchString.length > 2 &&
          !this.checkSubstring({ taskString: task.subject, searchString })
        ) {
          return;
        }

        const backlogTaskLi = document.createElement("li");
        backlogTaskLi.className = "task-wrapper";
        backlogTaskLi.innerHTML = `
                <div class="task" data-id="${task.id}">
                    <h4 class="task-title">${task.subject}</h4>
                    <p class="task-message">${task.description}</p>
                </div>
            `;

        backlogTasksUl.append(backlogTaskLi);
      }
    });
  }

  static checkSubstring({ taskString, searchString }) {
    if (taskString.toUpperCase().indexOf(searchString.toUpperCase()) === -1) {
      return false;
    }

    return true;
  }
}
