import { Component, OnDestroy, OnInit } from '@angular/core';
import { Todo } from "./todo";
import { forkJoin, Subscription } from 'rxjs';
import { TodoService } from './todo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'todo-ui';

  visibility: string = 'all';
  newTodo: Todo = { title: '', completed: false, order: 1 };
  editedTodo: number = -1;

  todos: Todo[] = [];
  remaining: number = 0;

  private titleStorage: string = '';
  private sub$: Subscription = new Subscription();

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.sub$.add(
      this.todoService.findAll()
        .subscribe(todos => {
          this.todos = todos;
        })
    );
  }

  ngOnDestroy(): void {
    this.sub$.unsubscribe();
  }

  addTodo(event: KeyboardEvent): void {
    if (event.key !== "Enter") {
      return;
    }
    if (!this.newTodo.title) {
      return;
    }
    this.newTodo.order = this.todos.length + 1;
    this.sub$.add(
      this.todoService.create(this.newTodo)
        .subscribe(todo => {
          this.todos.push(todo);
          this.newTodo = { title: '', completed: false, order: 1 };
        })
    );
  }

  markCompleted(): void {
    const obs$ = this.todos.map(t => {
      t.completed = true;
      return this.todoService.update(t);
    });
    this.sub$.add(
      forkJoin(obs$)
        .subscribe()
    );
  }

  toggleTodo(todo: Todo): void {
    todo.completed = !todo.completed;
    this.sub$.add(
      this.todoService.update(todo)
        .subscribe()
    );
  }

  editTodo(todo: Todo): void {
    if (!todo.id) {
      return;
    }
    this.editedTodo = todo.id;
    this.titleStorage = todo.title;
  }

  removeTodo(todo: Todo): void {
    this.sub$.add(
      this.todoService.delete(todo)
        .subscribe(() => {
          this.todos = this.todos.filter(t => t.id !== todo.id);
        })
    );
  }

  doneEdit(todo: Todo, event: KeyboardEvent): void {
    if (!event || event.key === 'Enter') {
      this.sub$.add(
        this.todoService.update(todo)
          .subscribe(() => {
            this.editedTodo = -1;
          })
      );
    } else if (event.key === 'Escape') {
      this.editedTodo = -1;
      todo.title = this.titleStorage;
    }
  }

  removeCompleted(): void {
    this.sub$.add(
      this.todoService.removeCompleted()
        .subscribe(() => {
          this.todos = this.todos.filter(t => !t.completed);
        })
    );
  }

  check(visibility: string): void {
    this.visibility = visibility;
  }

  remainingText(): string {
    if (!this.todos || this.todos.length === 0) {
      return '';
    }
    const remain = this.todos.filter(todo => !todo.completed).length;
    return remain + ' item' + (remain === 1 ? '' : 's') + ' left';
  }
}
