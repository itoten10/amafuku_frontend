export default async function fetchCustomers() {
  const res = await fetch(process.env.NEXT_PUBLIC_API_ENDPOINT + "/allcustomers", {
    cache: "no-cache",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch customers");
  }
  return res.json();
}
