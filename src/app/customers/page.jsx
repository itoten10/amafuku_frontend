"use client";
import OneCustomerInfoCard from "@/app/components/one_customer_info_card.jsx";
import Link from "next/link";
import { useEffect, useState } from "react";
import fetchCustomers from "./fetchCustomers";

export default function Page() {
  const [customerInfos, setCustomerInfos] = useState([]);

  useEffect(() => {
    const fetchAndSetCustomer = async () => {
      const customerData = await fetchCustomers();
      setCustomerInfos(customerData);
    };
    fetchAndSetCustomer();
  }, []);

  return (
    <>
      <div className="p-4">
        <Link href="/customers/create" className="mt-4 pt-4" prefetch={false}>
          <button className="btn btn-neutral w-full border-0 bg-blue-200 text-black hover:text-white">
            Create
          </button>
        </Link>
      </div>
      {customerInfos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customerInfos.map((customerInfo, index) => (
            <div
              key={index}
              className="card bordered bg-white border-blue-200 border-2 flex flex-row max-w-sm m-4"
            >
              <OneCustomerInfoCard {...customerInfo} />
              <div className="card-body flex flex-col justify-between">
                <Link href={`/customers/read/${customerInfo.customer_id}`}>
                  <button className="btn btn-neutral w-20 border-0 bg-blue-200 text-black hover:text-white">
                    Read
                  </button>
                </Link>
                <Link href={`/customers/update/${customerInfo.customer_id}`}>
                  <button className="btn btn-neutral w-20 border-0 bg-blue-200 text-black hover:text-white">
                    Update
                  </button>
                </Link>
                <Link href={`/customers/delete/${customerInfo.customer_id}`}>
                  <button className="btn btn-neutral w-20 border-0 bg-blue-200 text-black hover:text-white">
                    Delete
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-4">
          <p>顧客情報がありません。</p>
        </div>
      )}
    </>
  );
}
