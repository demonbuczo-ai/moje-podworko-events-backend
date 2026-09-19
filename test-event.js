// Test API - tworzenie wydarzenia i sprawdzanie

const BASE = "http://localhost:8100";

async function main() {
  console.log("=== Test 1: Health check ===");
  const health = await fetch(BASE + "/api/health").then(r => r.json());
  console.log(JSON.stringify(health, null, 2));

  console.log("\n=== Test 2: Utworz wydarzenie ===");
  const createRes = await fetch(BASE + "/api/event/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Kto idzie na piwo?",
      description: "Piatek wieczorem, spotkajmy sie w centrum",
      ownerId: "user-test-1",
      ownerName: "Kuba",
      type: "poll",
      dateFrom: "2026-09-20",
      dateTo: "2026-09-22",
      hourFrom: "18:00",
      hourTo: "23:00",
      deadlineHours: 24
    })
  }).then(r => r.json());
  console.log(JSON.stringify(createRes, null, 2));

  const eventId = createRes.eventId;
  if (!eventId) {
    console.log("BLAD: Brak eventId w odpowiedzi.");
    return;
  }

  console.log("\n=== Test 3: Pobierz szczegoly wydarzenia ===");
  const details = await fetch(BASE + "/api/event/" + eventId).then(r => r.json());
  console.log(JSON.stringify(details, null, 2));

  console.log("\n=== Test 4: Zapisz dostepnosc Kuba (pt 19:00, sob 20:00) ===");
  const avail1 = await fetch(BASE + "/api/event/" + eventId + "/availability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "user-test-1",
      userName: "Kuba",
      slots: ["2026-09-20_19:00", "2026-09-21_20:00"]
    })
  }).then(r => r.json());
  console.log(JSON.stringify(avail1, null, 2));

  console.log("\n=== Test 5: Dolacz Ania i zapisz jej dostepnosc ===");
  await fetch(BASE + "/api/event/" + eventId + "/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: "user-test-2", userName: "Ania" })
  });
  const avail2 = await fetch(BASE + "/api/event/" + eventId + "/availability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "user-test-2",
      userName: "Ania",
      slots: ["2026-09-20_19:00", "2026-09-21_20:00", "2026-09-21_21:00"]
    })
  }).then(r => r.json());
  console.log(JSON.stringify(avail2, null, 2));

  console.log("\n=== Test 6: Wyslij wiadomosc na czacie ===");
  const msgRes = await fetch(BASE + "/api/event/" + eventId + "/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "user-test-1",
      userName: "Kuba",
      text: "Hej, ja moge w piatek o 19!"
    })
  }).then(r => r.json());
  console.log(JSON.stringify(msgRes, null, 2));

  console.log("\n=== Test 7: Pobierz wiadomosci ===");
  const msgs = await fetch(BASE + "/api/event/" + eventId + "/messages").then(r => r.json());
  console.log(JSON.stringify(msgs, null, 2));

  console.log("\n=== GOTOWE ===");
  console.log("Event ID: " + eventId);
  console.log("Link do wydarzenia: " + BASE + "/api/event/" + eventId);
}

main().catch(err => { console.error("BLAD:", err); process.exit(1); });
