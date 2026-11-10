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
| `202 Accepted` | Objednávka převzata k dalšímu zpracování. Tělo odpovědi neobsahuje žádná data (je v něm jen text `Accepted`). Změny stavu pak přijdou přes webhook. |
| `400 Bad Request` | Chybí `id` nebo `callbackUrl`. Tělo: `{ "error": "..." }` |

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

### Testovací skripty kurýra (složka `kuryr/`)

| Příkaz | Co dělá |
|---|---|
| `npm start` | Spustí kurýrní server (port 3000) |
| `npm run test-order` | Pošle 1 testovací objednávku |
| `npm run test-order -- 3` | Pošle 3 objednávky najednou (test souběžného zpracování) |

---

## Webhook – stavy objednávky (kurýr → restaurace)

Po přijetí objednávky kurýr ihned odpoví `202` a pak sám postupně volá `callbackUrl` restaurace.

**Metoda:** `POST` na `callbackUrl` z objednávky (např. `http://localhost:3001/update`)

**Hlavičky:**

| Hlavička | Hodnota |
|---|---|
| `Content-Type` | `application/json` |
| `X-Signature` | HMAC-SHA256 těla zprávy (přesně odeslaného JSON řetězce v UTF-8) se sdíleným tajemstvím, zapsaný jako hex |

**Sdílené tajemství:** proměnná prostředí `SHARED_SECRET`, výchozí hodnota `tajne-heslo`. Kurýr i restaurace musí mít stejnou hodnotu. Restaurace podpis přepočítá z těla a porovná. Když nesedí nebo chybí, odpoví `401 Unauthorized` a stav neuloží.

**Tělo (JSON):**

| Pole | Typ | Popis |
|---|---|---|
| `event_id` | string | Unikátní ID této události (UUID). Při opakovaném odeslání (retry) zůstává stejné. |
| `id` | string | `id` objednávky, jak ho restaurace poslala |
| `status` | string | Nový stav objednávky (přesně jeden z textů níže, včetně diakritiky) |

```json
{ "event_id": "6e7e0687-1943-4052-b4df-28daba5704b5", "id": "objednavka1", "status": "Rozváží se" }
```

**Stavy a časování:**

| Čas od přijetí | `status` |
|---|---|
| ihned (stav samotné žádosti, webhook se neposílá) | `Žádost o objednávku` |
| 5 s | `Restaurace připravuje` |
| 10 s | `Rozváží se` |
| 15 s | `Doručeno` |

**Duplicitní notifikace:** kurýr některé webhooky úmyslně pošle podruhé (simulace retry, se stejným `event_id`, tělem i podpisem). Restaurace si pamatuje zpracovaná `event_id` a duplikát přeskočí: nic znovu neuloží, ale odpoví `200`, aby kurýr věděl, že je doručeno.

**Očekávaná odpověď restaurace:** `200 OK`, při neplatném podpisu `401 Unauthorized`. Kurýr kód odpovědi vypíše do konzole. Když restaurace neodpoví (neběží, špatná adresa), kurýr chybu jen zaloguje a nespadne.

Každá objednávka má vlastní časovače, takže více objednávek najednou se zpracovává souběžně a nezávisle.

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
