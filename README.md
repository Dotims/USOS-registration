
# Instrukcja obsługi bota rejestracyjnego USOSweb

## A. Opcja 1: Wtyczka Chrome (Zalecane)
To jest najnowsza wersja bota, działająca jako oddzielne rozszerzenie.

### Instalacja w Chrome / Edge / Opera:
1.  Otwórz przeglądarkę i wpisz w pasku adresu: `chrome://extensions` (lub wejdź w Menu -> Więcej narzędzi -> Rozszerzenia).
2.  W prawym górnym rogu włącz **"Tryb dewelopera"** (Developer mode).
3.  Pojawi się nowy pasek narzędzi. Kliknij przycisk **"Załaduj rozpakowane"** (Load unpacked).
4.  Wybierz folder: `c:\Users\rados\Desktop\projects\studia_rejestracje\extension`.
5.  Gotowe! Wtyczka powinna być widoczna na liście i aktywna.

### Konfiguracja:
Aby zmienić numer grupy lub godzinę:
1.  Otwórz plik `extension/content.js` w notatniku.
2.  Zmień wartości na początku pliku (`TARGET_GROUP_NUMBER`, `TARGET_HOUR` itd.).
3.  Zapisz plik.
4.  Wróć do strony `chrome://extensions` i kliknij ikone **odświeżania** (zakręcona strzałka) przy wtyczce "USOS Registration Bot".

## B. Opcja 2: Tampermonkey (Starsza wersja)
Jeśli wolisz używać Tampermonkey...

## 1. Instalacja
Aby skrypt działał, musisz zainstalować rozszerzenie do przeglądarki obsługujące tzw. "Userscripts". Polecam **Tampermonkey**.

1.  Zainstaluj **Tampermonkey** dla swojej przeglądarki (Chrome, Firefox, Edge, Opera).
    -   [Link do Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
2.  Po zainstalowaniu, kliknij ikonę Tampermonkey na pasku rozszerzeń i wybierz "Dodaj nowy skrypt" (Create a new script).
3.  Otwórz plik `registration_bot.user.js` (znajdziesz go w tym folderze) w notatniku.
4.  Skopiuj całą jego zawartość.
5.  Wklej zawartość do edytora w Tampermonkey (zastępując domyślny szablon).
6.  Zapisz skrypt (File -> Save lub Ctrl+S).

## 2. Konfiguracja
Domyślnie skrypt jest ustawiony na:
-   **Grupę nr 3** (`TARGET_GROUP_NUMBER = "3"`)
-   **Godzinę 6:00:00** (`TARGET_HOUR`, `TARGET_MINUTE`, `TARGET_SECOND`)

Jeśli chcesz zmienić grupę lub czas:
1.  Edytuj skrypt w Tampermonkey.
2.  Zmień wartości na początku pliku w sekcji `--- KONFIGURACJA ---`.

```javascript
    const TARGET_GROUP_NUMBER = "3"; // Zmień "3" na numer swojej grupy/ćwiczeń
    const TARGET_HOUR = 6;           // Godzina
```

## 3. Działanie
1.  Wejdź na stronę przedmiotu w USOSweb (tam gdzie jest tabela z grupami).
2.  Jeśli jest przed godziną 6:00:
    -   Skrypt automatycznie **zaznaczy checkbox** przy wybranej grupie (powinien się podświetlić na niebiesko).
    -   Skrypt znajdzie przycisk **"Zarejestruj"** (lub podobny) i **otoczy go czerwoną ramką** (oznacza to, że jest gotowy do kliknięcia).
3.  Gdy wybije godzina **6:00:00** (wg zegara systemowego komputera!):
    -   Skrypt automatycznie kliknie ten przycisk.

## 4. Ważne uwagi
-   **Otwórz wiele kart**: Skrypt działa niezależnie w każdej karcie. Możesz otworzyć 5 przedmiotów w 5 kartach, a skrypt w każdym z nich zaznaczy grupę i kliknie o 6:00.
-   **Testowanie**: Możesz przetestować działanie zmieniając godzinę w skrypcie na np. za 2 minuty i sprawdzając, czy kliknie (oczywiście nie rób tego na ważnej rejestracji, chyba że chcesz sprawdzić samo kliknięcie).
-   **Synchronizacja czasu**: Upewnij się, że zegar w Twoim systemie Windows jest dobrze zsynchronizowany z czasem internetowym/serwerowym. Skrypt polega na Twoim zegarze.

Powodzenia w rejestracji!
