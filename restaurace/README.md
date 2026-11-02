# Restaurace – zahájení objednávky

Část restaurace pro úlohu 1. Vyžaduje Node.js 18 nebo novější.

## Spuštění serveru

V terminálu v kořeni repozitáře spusťte:

```powershell
cd restaurace
npm install
npm start
```

Server vypíše `Restaurant runs on http://localhost:3001`.
Port lze změnit proměnnou prostředí `PORT`.
Endpoint `/update` a zpracování stavů objednávky budou doplněny v dalších úlohách.

## Odeslání objednávky

Kurýrní server musí běžet na `http://localhost:3000` (spouští jej tým kurýra).
V dalším terminálu ve složce `restaurace` spusťte:

```powershell
npm run test-order
```

Skript odešle `POST /order` s hlavičkou `Content-Type: application/json`
a JSON objektem obsahujícím unikátní `id` (automaticky vytvořené UUID)
a `callbackUrl` nastavené na `http://localhost:3001/update`.
Vlastní identifikátor lze předat jako argument:

```powershell
npm run test-order -- objednavka1
```

Při úspěchu vypíše `Courier response: 202`. Tělo odpovědi nečte.
Při nedostupnosti kurýra, překročení 10 sekund nebo jiném HTTP statusu
vypíše chybu a skončí s návratovým kódem 1.
Skript lze pro tuto úlohu spustit i bez běžícího serveru restaurace,
protože kurýr zatím webhook nevolá.

## Komunikace mezi dvěma počítači

V PowerShellu nastavte adresu kurýra a adresu restaurace dosažitelnou z jeho počítače:

```powershell
$env:COURIER_URL = 'http://192.168.1.25:3000/order'
$env:CALLBACK_URL = 'http://192.168.1.26:3001/update'
npm run test-order
```

IP adresy nahraďte skutečnými adresami obou počítačů.
Pokud změníte port restaurace, upravte také `CALLBACK_URL`.
Formát objednávky odpovídá společnému README v kořeni repozitáře.
