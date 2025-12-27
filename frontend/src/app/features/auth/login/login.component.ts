import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {AuthService} from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    loginForm: FormGroup;
    loading = false;
    errorMessage = '';
    returnUrl = '/';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });

        // Get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            this.loading = true;
            this.errorMessage = '';

            this.authService.login(this.loginForm.value).subscribe({
                next: () => {
                    this.router.navigate([this.returnUrl]);
                },
                error: (error) => {
                    //print error to console
                    console.debug('Login error:', error);
                    this.loading = false;
                    this.errorMessage = error.error?.detail || 'Login failed. Please try again.';
                }
            });
        }
    }
}
