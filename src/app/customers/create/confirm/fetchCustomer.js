export default async function fetchCustomer(id) {
  const res = await fetch(`http://localhost:8000/customers?customer_id=${id}`, {
    cache: "no-cache",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch customer");
  }
  return res.json();
}
