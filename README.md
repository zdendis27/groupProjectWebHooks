# Kurýrní server – objednávky

Kurýrní server pro školní projekt **Kurýr ↔ Restaurace**. Restaurace pošle kurýrovi žádost o doručení objednávky. Kurýr ji přijme a v dalších úlohách bude posílat změny stavu zpět na webhook restaurace (`callbackUrl`).

## Struktura repozitáře

```
├── kuryr/         ← kurýrní server (tým kurýr)
├── restaurace/    ← server restaurace (tým restaurace)
├── README.md      ← společná dokumentace API
└── .gitignore
```

## Spuštění kurýrního serveru

Je potřeba **Node.js 18+**.

```bash
cd kuryr
npm install
node server.js
```

Po spuštění se vypíše:

```
Courier runs on http://localhost:3000
```

Server běží na portu **3000**.

---

## API pro restauraci

### `POST /order` – nová objednávka k doručení

**URL:** `http://localhost:3000/order`
(Pokud jsme každý na jiném PC, místo `localhost` použijte IP adresu kurýrního počítače, např. `http://192.168.1.25:3000/order`.)

**Hlavička:** `Content-Type: application/json`

**Tělo požadavku (JSON):**

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `id` | string | ano | Unikátní identifikátor objednávky, např. `"objednavka1"` |
| `callbackUrl` | string | ano | URL webhooku na serveru restaurace, kam bude kurýr posílat změny stavu |

Příklad:

```json
{
  "id": "objednavka1",
  "callbackUrl": "http://localhost:3001/update"
}
```

**Odpověď:**

| Status | Význam |
|---|---|
| `202 Accepted` | Objednávka převzata k dalšímu zpracování. Tělo odpovědi neobsahuje žádná data (je v něm jen text `Accepted`). |

### Ukázka volání z restaurace (Node.js 18+)

```js
fetch('http://localhost:3000/order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'objednavka1',
    callbackUrl: 'http://localhost:3001/update'
  })
})
  .then(res => res.status)
  .then(status => console.log('Courier response:', status)); // 202
```

### Ukázka přes curl

```bash
curl -X POST http://localhost:3000/order \
  -H "Content-Type: application/json" \
  -d '{"id":"objednavka1","callbackUrl":"http://localhost:3001/update"}' -i
```

Ve složce `kuryr/` je i skript `test-order.js`, který pošle testovací objednávku: `node test-order.js`.

---

## Webhook – co bude kurýr posílat restauraci (další úlohy)

Kurýr bude na `callbackUrl` posílat informace o tom, jak se mění stav objednávky. Stav projde postupně těmito hodnotami:

1. **Žádost o objednávku**
2. **Restaurace připravuje**
3. **Rozváží se**
4. **Doručeno**

> 🚧 Zatím není implementováno. Přesný formát zprávy pro webhook (název pole se stavem, metoda POST apod.) tady doplníme, až se na něm domluvíme. Restaurace si má připravit endpoint na adrese, kterou posílá v `callbackUrl` (např. `POST /update` na portu 3001).

---

## Porty

| Aplikace | Port |
|---|---|
| Kurýrní server | 3000 |
| Server restaurace | 3001 |

---

## Jak spolupracujeme

1. **Každý tým mění jen svou složku**, tedy `kuryr/` nebo `restaurace/`.
2. **Do `main` se nepushuje přímo.** Všechno jde přes Pull Request.
3. Před začátkem práce si stáhněte aktuální `main`:
   ```bash
   git checkout main
   git pull
   ```
4. Na každý úkol založte novou větev ve tvaru `tym/co-delam`:
   ```bash
   git checkout -b kuryr/webhook-status
   ```
   Příklady: `kuryr/order-endpoint`, `restaurace/update-endpoint`.
5. Hotovou práci commitněte a pushněte, pak na GitHubu otevřete **Pull Request** do `main`:
   ```bash
   git add .
   git commit -m "Popis změny"
   git push -u origin kuryr/webhook-status
   ```
6. **Kód schvaluje parťák z vlastního týmu.**
7. **Změny tohoto README (API) schvaluje někdo z druhého týmu.** Změna API je samostatný PR. Programuje se podle ní až po schválení.
8. Po merge větev smažte (GitHub to nabídne tlačítkem).
