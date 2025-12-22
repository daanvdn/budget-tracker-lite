import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../core/services/user.service';
import { User } from '../../shared/models/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './users.component.html',
  styles: [`
    .user-form {
      margin: 20px 0;
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .users-table {
      width: 100%;
      margin-top: 20px;
    }
  `]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  showForm = false;
  editingId: number | null = null;
  userForm: FormGroup;
  displayedColumns = ['name', 'created_at', 'actions'];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => this.users = data,
      error: (err) => this.showError('Failed to load users')
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.cancelEdit();
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
      const { name } = this.userForm.value;

      if (this.editingId) {
        this.userService.updateUser(this.editingId, name).subscribe({
          next: () => {
            this.showSuccess('User updated successfully');
            this.loadUsers();
            this.cancelEdit();
          },
          error: (err) => this.showError('Failed to update user')
        });
      } else {
        this.userService.createUser(name).subscribe({
          next: () => {
            this.showSuccess('User created successfully');
            this.loadUsers();
            this.cancelEdit();
          },
          error: (err) => this.showError('Failed to create user')
        });
      }
    }
  }

  editUser(user: User) {
    this.editingId = user.id;
    this.showForm = true;
    this.userForm.patchValue({ name: user.name });
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.showSuccess('User deleted successfully');
          this.loadUsers();
        },
        error: (err) => this.showError('Failed to delete user')
      });
    }
  }

  cancelEdit() {
    this.showForm = false;
    this.editingId = null;
    this.userForm.reset();
  }

  showSuccess(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }
}
