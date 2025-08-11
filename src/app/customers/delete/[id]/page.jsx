"use client";
import OneCustomerInfoCard from "@/app/components/one_customer_info_card.jsx";
import deleteCustomer from "./deleteCustomer";
import fetchCustomer from "./fetchCustomer";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";

export default function DeletePage(props) {
  const params = use(props.params);
  const customer_id = params.id;
  const router = useRouter();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const fetchAndSetCustomer = async () => {
      const customerInfo = await fetchCustomer(customer_id);
      setCustomer(customerInfo);
    };
    fetchAndSetCustomer();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await deleteCustomer(customer_id);
    router.push(`./delete/confirm?customer_id=${customer_id}`);
  };

  return (
    <>
      <div className="card bordered bg-white border-blue-200 border-2 max-w-sm m-4">
        <OneCustomerInfoCard {...customer} />

        <button onClick={handleSubmit}>
          <div className="btn btn-primary m-4 text-2xl">削除</div>
        </button>
      </div>
    </>
  );
}
