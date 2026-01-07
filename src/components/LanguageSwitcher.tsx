import { useLanguage } from '@/context/LanguageContext';
import { Button } from './ui/button';
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

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLanguage(language === 'en' ? 'he' : 'en')}
      title={t('language.switchLanguage')}
      className="h-9 w-9"
    >
      <span className="text-sm font-medium">
        {language === 'en' ? 'HE' : 'EN'}
      </span>
    </Button>
  );
}
