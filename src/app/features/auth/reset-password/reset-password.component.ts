import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  loading = signal(false);
  verifying = signal(true);
  tokenValid = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  private token: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confermaPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';

    if (!this.token) {
      this.verifying.set(false);
      this.error.set('Token mancante.');
      return;
    }

    // Verifica validità del token
    this.authService.verificaTokenResetPassword(this.token).subscribe({
      next: () => {
        this.verifying.set(false);
        this.tokenValid.set(true);
      },
      error: () => {
        this.verifying.set(false);
        this.tokenValid.set(false);
        this.error.set('Il link di reset non è valido o è scaduto.');
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confermaPassword = control.get('confermaPassword');

    if (password && confermaPassword && password.value !== confermaPassword.value) {
      confermaPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.resetPassword({
      token: this.token,
      nuovaPassword: this.resetForm.value.password
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Errore durante il reset della password');
      }
    });
  }

  get f() {
    return this.resetForm.controls;
  }
}
