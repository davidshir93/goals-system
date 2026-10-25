import { useLanguage } from '@/context/LanguageContext';
import { Button } from './ui/button';
import { GlobeIcon } from './icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type LanguageSwitcherProps = {
  variant?: 'button' | 'select';
};

export function LanguageSwitcher({ variant = 'button' }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();

  if (variant === 'select') {
    return (
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className="w-[120px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">
            <span className="flex items-center gap-2">
              <span>EN</span>
              <span className="text-muted-foreground">English</span>
            </span>
          </SelectItem>
          <SelectItem value="he">
            <span className="flex items-center gap-2">
              <span>HE</span>
              <span className="text-muted-foreground">עברית</span>
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    );
  }

  const next = language === 'en' ? 'he' : 'en';
  return (
    <Button
      variant="ghost"
      onClick={() => setLanguage(next)}
      aria-label={`${t('language.switchLanguage')}: ${next === 'he' ? 'עברית' : 'English'}`}
      title={t('language.switchLanguage')}
      className="h-9 gap-1.5 rounded-full px-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
    >
      <GlobeIcon />
      <span className="type-body-title" lang={next}>{next.toUpperCase()}</span>
    </Button>
  );
}
