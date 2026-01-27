import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => setLanguage('es')}
        className={`px-2 py-1 transition-colors duration-300 ${
          language === 'es'
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        ES
      </button>
      <span className="text-border">|</span>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 transition-colors duration-300 ${
          language === 'en'
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSelector;
