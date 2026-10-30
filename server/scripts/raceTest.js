const BASE = "http://localhost:5000/api";
const eventId = process.argv[2];
const N = Number(process.argv[3]) || 20;

if (!eventId) {
  console.log("Usage: node scripts/raceTest.js <eventId> [users]");
  process.exit(1);
}

const post = async (path, token) => {
  const res = await fetch(`${BASE}${path.url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(path.body || {}),
  });
  return { status: res.status, data: await res.json() };
};

const stamp = Date.now();
const tokens = [];
for (let i = 0; i < N; i++) {
  const r = await post({
    url: "/auth/register",
    body: {
      name: `Racer ${i}`,
      email: `racer${stamp}_${i}@test.com`,
      password: "123456",
    },
  });
  tokens.push(r.data.token);
}
console.log(`${N} users ban gaye. Ab sab ek saath register kar rahe hain...`);

const results = await Promise.all(
  tokens.map((t) => post({ url: `/events/${eventId}/register` }, t))
);

const summary = {};
results.forEach((r) => (summary[r.status] = (summary[r.status] || 0) + 1));
console.log("Status counts:", summary);