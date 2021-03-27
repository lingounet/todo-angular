import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { Todo } from './todo';

@Injectable({
  providedIn: 'root'
})
export class TodoService {

  private url = 'https://stgo-dsi-dp-todo-web.azurewebsites.net/todos';

  constructor(private http: HttpClient) { }

  findAll(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.url);
  }

  create(todo: Todo): Observable<Todo> {
    return this.http.post<Todo>(this.url, todo);
  }

  update(todo: Todo): Observable<Todo> {
    return this.http.put<Todo>(this.url + '/' + todo.id, todo);
  }

  removeCompleted(): Observable<void> {
    return this.http.delete<void>(this.url);
  }

  delete(todo: Todo): Observable<void> {
    return this.http.delete<void>(this.url + '/' + todo.id);
  }
}
