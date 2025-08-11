"use client";
import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import fetchCustomer from "./fetchCustomer";
import updateCustomer from "./updateCustomer";

export default function UpdatePage(props) {
  const params = use(props.params);
  const router = useRouter();
  const id = params.id;
  const formRef = useRef();
  const [customerInfo, setCustomerInfo] = useState([]);

  useEffect(() => {
    const fetchAndSetCustomer = async () => {
      const customerData = await fetchCustomer(id);
      setCustomerInfo(customerData);
    };
    fetchAndSetCustomer();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(formRef.current);
    await updateCustomer(formData);
    router.push(`./${formData.get("customer_id")}/confirm`);
  };

  const previous_customer_name = customerInfo.customer_name;
  const previous_customer_id = customerInfo.customer_id;
  const previous_age = customerInfo.age;
  const previous_gender = customerInfo.gender;

  return (
    <>
      <div className="card bordered bg-white border-blue-200 border-2 max-w-md m-4">
        <div className="m-4 card bordered bg-blue-200 duration-200 hover:border-r-red">
          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="card-body">
              <h2 className="card-title">
                <p>
                  <input
                    type="text"
                    name="customer_name"
                    defaultValue={previous_customer_name}
                    className="input input-bordered"
                  />
                  さん
                </p>
              </h2>
              <p>
                Customer ID:
                <input
                  type="text"
                  name="customer_id"
                  defaultValue={previous_customer_id}
                  className="input input-bordered"
                />
              </p>
              <p>
                Age:
                <input
                  type="number"
                  name="age"
                  defaultValue={previous_age}
                  className="input input-bordered"
                />
              </p>
              <p>
                Gender:
                <input
                  type="text"
                  name="gender"
                  defaultValue={previous_gender}
                  className="input input-bordered"
                />
              </p>
            </div>
            <div className="flex justify-center">
              <button className="btn btn-primary m-4 text-2xl">更新</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
