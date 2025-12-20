import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-user-list',
  template: `
    <div class="user-list">
      <h2>Users</h2>
      <ul *ngIf="users.length > 0">
        <li *ngFor="let user of users">
          {{ user.name }} ({{ user.email }})
        </li>
      </ul>
      <p *ngIf="users.length === 0">No users found.</p>
    </div>
  `
})
export class UserListComponent implements OnInit {
  users: User[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe(
      data => this.users = data
    );
  }
}
