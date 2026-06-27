const PROJECT_ID = 'dashboard-gestao-notas';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function firestorePatch(path, fields) {
  const headers = { 'Content-Type': 'application/json' };
  console.log(`Sending PATCH to ${FIRESTORE_BASE}/${path}`);
  const res = await fetch(`${FIRESTORE_BASE}/${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fields })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firestore ${res.status}: ${err.slice(0, 200)}`);
  }
  return res.json();
}

async function test() {
  try {
    await firestorePatch('test_collection/test_doc', { testField: { stringValue: 'hello' } });
    console.log("Success");
  } catch (e) {
    console.error(e.message);
  }
}

test();
