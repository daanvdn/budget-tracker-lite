import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="reset-password-container">
      <div class="reset-password-card">
        <h2>Reset Password</h2>
        <p class="description">Enter your reset token and new password.</p>
        
        <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="token">Reset Token</label>
            <input
              type="text"
              id="token"
              formControlName="token"
              class="form-control"
              [class.error]="resetPasswordForm.get('token')?.invalid && resetPasswordForm.get('token')?.touched"
            />
            <div class="error-message" *ngIf="resetPasswordForm.get('token')?.invalid && resetPasswordForm.get('token')?.touched">
              Reset token is required
            </div>
          </div>

          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              formControlName="newPassword"
              class="form-control"
              [class.error]="resetPasswordForm.get('newPassword')?.invalid && resetPasswordForm.get('newPassword')?.touched"
            />
            <div class="error-message" *ngIf="resetPasswordForm.get('newPassword')?.errors && resetPasswordForm.get('newPassword')?.touched">
              <div *ngIf="resetPasswordForm.get('newPassword')?.errors?.['required']">Password is required</div>
              <div *ngIf="resetPasswordForm.get('newPassword')?.errors?.['minlength']">Password must be at least 8 characters</div>
              <div *ngIf="resetPasswordForm.get('newPassword')?.errors?.['passwordStrength']">
                Password must contain at least 1 number and 1 uppercase letter
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              formControlName="confirmPassword"
              class="form-control"
              [class.error]="resetPasswordForm.get('confirmPassword')?.invalid && resetPasswordForm.get('confirmPassword')?.touched"
            />
            <div class="error-message" *ngIf="resetPasswordForm.get('confirmPassword')?.errors && resetPasswordForm.get('confirmPassword')?.touched">
              <div *ngIf="resetPasswordForm.get('confirmPassword')?.errors?.['required']">Please confirm your password</div>
              <div *ngIf="resetPasswordForm.get('confirmPassword')?.errors?.['passwordMismatch']">Passwords do not match</div>
            </div>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div class="success-message" *ngIf="successMessage">
            {{ successMessage }}
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="resetPasswordForm.invalid || loading">
            {{ loading ? 'Resetting...' : 'Reset Password' }}
          </button>
        </form>

        <div class="links">
          <a routerLink="/login">Back to Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reset-password-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f5f5f5;
      padding: 20px;
    }

    .reset-password-card {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      max-width: 400px;
      width: 100%;
    }

    h2 {
      margin: 0 0 10px 0;
      text-align: center;
      color: #333;
    }

    .description {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      color: #555;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }

    .form-control.error {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 12px;
      margin-top: 5px;
    }

    .success-message {
      color: #28a745;
      font-size: 14px;
      margin-bottom: 10px;
      padding: 10px;
      background: #d4edda;
      border-radius: 4px;
    }

    .btn {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .links {
      margin-top: 20px;
      text-align: center;
    }

    .links a {
      color: #007bff;
      text-decoration: none;
    }

    .links a:hover {
      text-decoration: underline;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.fb.group({
      token: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Pre-fill token if passed via query params
    const token = this.route.snapshot.queryParams['token'];
    if (token) {
      this.resetPasswordForm.patchValue({ token });
    }
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasNumber = /\d/.test(value);
    const hasUpper = /[A-Z]/.test(value);

    if (!hasNumber || !hasUpper) {
      return { passwordStrength: true };
    }

    return null;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const { token, newPassword } = this.resetPasswordForm.value;

      this.authService.resetPassword(token, newPassword).subscribe({
        next: () => {
          this.successMessage = 'Password reset successful! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.detail || 'Password reset failed. Please try again.';
        }
      });
    }
  }
}
