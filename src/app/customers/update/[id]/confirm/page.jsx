"use client";
import OneCustomerInfoCard from "@/app/components/one_customer_info_card.jsx";
import fetchCustomer from "./../fetchCustomer";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { Suspense } from "react"

export default function ConfirmPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmPage />
    </Suspense>
  );
}

function ConfirmPage(props) {
  const params = use(props.params);
  const router = useRouter();
  const id = params.id;
  const [customer, setCustomer] = useState([]);

  useEffect(() => {
    const fetchAndSetCustomer = async () => {
      const customerData = await fetchCustomer(id);
      setCustomer(customerData);
    };
    fetchAndSetCustomer();
  }, []);

  return (
    <>
      <div className="card bordered bg-white border-blue-200 border-2 max-w-sm m-4">
        <div className="alert alert-success p-4 text-center">更新しました</div>
        <OneCustomerInfoCard {...customer} />
        <a href="/customers" className="flex justify-center">
          <button className="btn btn-outline btn-accent">一覧に戻る</button>
        </a>
      </div>
    </>
  );
}
