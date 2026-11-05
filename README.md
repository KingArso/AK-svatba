# Alexandra & Kryštof · svatební web

Osobní digitální pozvánka na 5. června 2027. Čisté HTML, CSS a JavaScript, bez instalace balíčků a bez vlastního serveru. Web lze provozovat na GitHub Pages i na vlastní doméně.

## Lokální spuštění

Je potřeba Node.js 22 nebo novější. Z kořenové složky projektu:

```sh
npm run dev
```

Otevřete `http://localhost:5173`. Server ukončíte pomocí Ctrl+C.

```sh
npm run check     # kontrola syntaxe JavaScriptu
npm run build     # vytvoří samostatný web ve složce dist/
npm run preview   # náhled výsledné složky dist/
```

Složka `template/` obsahuje nedotčenou původní předlohu. Do `dist/` se nekopíruje. Fotografie v `assets/` jsou optimalizované, správně otočené a zbavené EXIF metadat.

## Aktivace přihlášek přes Formspree

Formulář je připravený, ale **dokud není doplněný endpoint, nic neodesílá** a jasně ukazuje, že přihlašování ještě není otevřené.

1. Přihlaste se nebo založte účet na [Formspree](https://formspree.io/).
2. Vytvořte projekt a formulář, například „Svatba Alexandra a Kryštof“.
3. V nastavení formuláře nastavte a ověřte cílový e-mail pro upozornění. Zkontrolujte, že jsou e-mailová upozornění zapnutá.
4. V části Integration zkopírujte veřejnou adresu ve formátu `https://formspree.io/f/xxxxxxxx`.
5. V `site.config.js` vyplňte `formEndpoint`. Nepotřebujeme vaše heslo ani soukromý API klíč. Endpoint je veřejná adresa určená pro použití v prohlížeči.
6. Znovu sestavte a publikujte web. Odešlete skutečnou zkušební odpověď ze zveřejněné stránky. Ověřte její přijetí v přehledu Formspree **i v cílovém e-mailu** (včetně spamu). Testovací záznam následně smažte v přehledu služby.
7. Před rozesláním pozvánky ověřte aktuální limit odpovědí svého tarifu. Omezení formuláře na vaši doménu a další ochrany lze nastavit podle možností účtu; při změně domény nezapomeňte aktualizovat povolené domény.

Odpovědi zůstávají v přehledu služby; doručování do e-mailu závisí na nastavení a ověření příjemce. Viz [oficiální návod Formspree](https://help.formspree.io/articles/building-your-form/building-an-html-form/).

Formulář sbírá účast / omluvu, jméno a e-mail. Při účasti navíc zobrazí zájem o ubytování a nepovinnou dietu. Vzkaz je nepovinný v obou případech. Každý pozvaný host vyplňuje svou odpověď; formulář nepřidává další doprovod. Zájem o ubytování není potvrzená rezervace.

Odesílání má ochranu proti dvojímu kliknutí, skryté antispamové pole, časový limit a chybové stavy. Potvrzení se zobrazí až po úspěšné HTTP odpovědi Formspree. Při problému se obsah formuláře zachová. Síťová chyba po přijetí přihlášky může znamenat, že opakované odeslání vytvoří duplicitní záznam; v takovém případě zkontrolujte přehled služby. Údaje hostů se neukládají do localStorage ani do repozitáře.

## GitHub Pages

Připravený workflow `.github/workflows/pages.yml` po pushi na `main` zkontroluje JavaScript, vytvoří `dist/` a publikuje jeho obsah.

1. Nahrajte projekt do svého GitHub repozitáře na větev `main`.
2. V repozitáři otevřete **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Na kartě Actions případně ručně spusťte workflow „Publish wedding website“.
4. Po dokončení bude adresa v části Pages a ve výsledku nasazení.

Všechny místní odkazy jsou relativní: fungují na `uzivatel.github.io/repozitar/` i na samostatné doméně. Publikuje se pouze `dist/`, nikoli předloha, README nebo vývojové skripty.

Pro vlastní doménu později nastavte doménu v **Settings → Pages → Custom domain**, ověřte ji u GitHubu, nastavte DNS u svého registrátora a zapněte HTTPS. U tohoto způsobu nasazování přes Actions není potřeba přidávat CNAME do zdrojů; GitHub doménu nastavuje v Pages. Řiďte se [aktuální dokumentací GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

GitHub Pages má veřejně dostupné stránky. Značka `noindex` žádá vyhledávače, aby web neindexovaly; nejde o heslo ani omezení přístupu. Kontaktní čísla z předlohy budou na webu viditelná návštěvníkům s odkazem.

## Co kde upravit

| Soubor           | Obsah                                                        |
| ---------------- | ------------------------------------------------------------ |
| `index.html`     | Texty, kontakty, program, struktura a pole formuláře         |
| `styles.css`     | Barvy, sazba, mobilní zobrazení, tisk a animace              |
| `site.config.js` | Formspree endpoint, volitelný termín RSVP, data pro kalendář |
| `app.js`         | Navigace, kalendář, podmíněná pole a odesílání               |
| `assets/`        | Fotografie a favicon                                         |

`rsvpDeadline` zatím zůstává prázdné. Po doplnění data ve formátu `2027-04-30` se zobrazí termín pro odpověď. Jde o informaci pro hosty, nikoli automatické uzavření formuláře.

Stažení kalendáře vytvoří soubor `.ics` s obřadem 5. června 2027 ve 14:30 a koncem oslavy 6. června v 01:30 v pražském letním čase. Pokud se termín změní, upravte kromě `site.config.js` také viditelné texty v `index.html`.

Záměrně nejsou vložené analytické trackery, externí fonty ani automaticky načítaná mapa. Odkaz do map se otevře až po kliknutí. Kresba mlýna je dekorativní ilustrace, nikoli mapa nebo přesný plán areálu.

## Ověření první verze

Prošla kontrola syntaxe, sestavení, místních odkazů, identifikátorů a popisků polí. Místní server vrací HTTP 200. Funkční kontroly v jsdom se simulovanými odpověďmi ověřily úspěšné odeslání, omluvu bez údajů o ubytování a dietě, HTTP 422/429/503, síťovou chybu, zachování údajů, ochranu před dvojím odesláním, validaci prázdného jména, reset, mobilní menu a časy/UTF-8 formát kalendáře. Při testech se žádné odpovědi skutečně neposílaly do Formspree. Testovací nástroje nejsou závislostmi webu.

V prostředí nebyl dostupný prohlížeč. Vizuální kontrola na mobilu a počítači a skutečné doručení z Formspree tedy ještě zbývají.
