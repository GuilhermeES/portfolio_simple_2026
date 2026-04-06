/**
 * i18n.js
 * Gerenciamento de internacionalização com i18next
 * Traduções em assets/locales/{lng}/translation.json
 */

const i18nManager = (() => {

    // ─── Configuração ────────────────────────────────────────────────────────────

    const SUPPORTED_LANGS = ['pt-BR', 'en'];
    const DEFAULT_LANG    = 'pt-BR';
    const STORAGE_KEY     = 'preferred_lang';

    // ─── Inicialização ───────────────────────────────────────────────────────────

    async function init() {
        const savedLang    = localStorage.getItem(STORAGE_KEY);
        const browserLang  = navigator.language;
        const detectedLang = SUPPORTED_LANGS.includes(browserLang) ? browserLang : DEFAULT_LANG;
        const lng          = savedLang || detectedLang;

        await i18next
            .use(i18nextHttpBackend)
            .use(i18nextBrowserLanguageDetector)
            .init({
                lng,
                fallbackLng: DEFAULT_LANG,
                supportedLngs: SUPPORTED_LANGS,
                debug: false,
                backend: {
                    loadPath: 'assets/locales/{{lng}}/translation.json', // caminho relativo
                },
                detection: {
                    order: ['localStorage', 'navigator'],
                    caches: ['localStorage'],
                    lookupLocalStorage: STORAGE_KEY,
                },
            });

        translatePage();
        setActiveLangButton(lng);
    }

    // ─── Tradução dos elementos ──────────────────────────────────────────────────

    function translatePage() {
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            el.textContent = i18next.t(el.getAttribute('data-i18n'));
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            el.placeholder = i18next.t(el.getAttribute('data-i18n-placeholder'));
        });

        document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
            el.setAttribute('aria-label', i18next.t(el.getAttribute('data-i18n-aria')));
        });

        document.documentElement.lang = i18next.language;
    }

    // ─── Troca de idioma ─────────────────────────────────────────────────────────

    async function changeLanguage(lng) {
        if (!SUPPORTED_LANGS.includes(lng)) {
            console.warn(`[i18n] Idioma não suportado: ${lng}`);
            return;
        }
        await i18next.changeLanguage(lng);
        localStorage.setItem(STORAGE_KEY, lng);
        translatePage();
        setActiveLangButton(lng);
    }

    // ─── Botões de idioma ────────────────────────────────────────────────────────

    function setActiveLangButton(lng) {
        document.querySelectorAll('[data-lang]').forEach((btn) => {
            const isActive = btn.getAttribute('data-lang') === lng;
            btn.classList.toggle('lang-active', isActive);
            btn.setAttribute('aria-pressed', String(isActive));
        });
    }

    function bindLangButtons() {
        document.querySelectorAll('[data-lang]').forEach((btn) => {
            btn.addEventListener('click', () => {
                changeLanguage(btn.getAttribute('data-lang'));
            });
        });
    }

    // ─── API pública ─────────────────────────────────────────────────────────────

    return {
        init,
        bindLangButtons,
        changeLanguage,
        t: (key) => i18next.t(key),
        currentLang: () => i18next.language,
    };

})();

// ─── Bootstrap ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    await i18nManager.init();
    i18nManager.bindLangButtons();
});