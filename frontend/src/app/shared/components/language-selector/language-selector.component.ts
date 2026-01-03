import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.css']
})
export class LanguageSelectorComponent implements OnInit {
  currentLang = 'en';
  languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' }
  ];

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    // Load saved language preference from localStorage
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && this.languages.some(l => l.code === savedLang)) {
      this.currentLang = savedLang;
    } else {
      // Try to use browser language
      const browserLang = this.translate.getBrowserLang();
      this.currentLang = browserLang && ['en', 'nl'].includes(browserLang) ? browserLang : 'en';
    }
    this.translate.use(this.currentLang);
  }

  onLanguageChange(langCode: string): void {
    this.currentLang = langCode;
    this.translate.use(langCode);
    localStorage.setItem('preferredLanguage', langCode);
  }

  getCurrentLanguage(): { code: string; name: string; flag: string } | undefined {
    return this.languages.find(l => l.code === this.currentLang);
  }
}

