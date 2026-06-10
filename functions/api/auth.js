export async function onRequestGet() {
  return new Response("AUTH ROUTE TEST", {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}