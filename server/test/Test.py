class ToDoList:
    def __init__(self):
        self.tasks = []

    def add_task(self, task):
        self.tasks.append({"task": task, "done": False})
        print(f"Added: {task}")

    def remove_task(self, index):
        if 0 <= index < len(self.tasks):
            removed = self.tasks.pop(index)
            print(f"Removed: {removed['task']}")
        else:
            print("Invalid index.")

    def mark_done(self, index):
        if 0 <= index < len(self.tasks):
            self.tasks[index]["done"] = True
            print(f"Marked as done: {self.tasks[index]['task']}")
        else:
            print("Invalid index.")

    def show_tasks(self):
        if not self.tasks:
            print("No tasks available.")
        else:
            for i, task in enumerate(self.tasks):
                status = "✔" if task["done"] else "✘"
                print(f"{i}. [{status}] {task['task']}")


def main():
    todo = ToDoList()
    while True:
        print("\n1. Add Task\n2. Remove Task\n3. Mark Done\n4. View Tasks\n5. Exit")
        choice = input("Choose an option: ")

        if choice == "1":
            task = input("Enter task: ")
            todo.add_task(task)
        elif choice == "2":
            index = int(input("Enter task index to remove: "))
            todo.remove_task(index)
        elif choice == "3":
            index = int(input("Enter task index to mark as done: "))
            todo.mark_done(index)
        elif choice == "4":
            todo.show_tasks()
        elif choice == "5":
            print("Exiting...")
            break
        else:
            print("Invalid choice. Try again.")


if __name__ == "__main__":
    main()
