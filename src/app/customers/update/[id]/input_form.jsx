// import OneCustomerInfoCard from "@/app/components/one_customer_info_card.jsx";

export default function InputForm({ updateCustomerFunc, customerInfo }) {
  const previous_customer_name = JSON.stringify(customerInfo[0].customer_name);
  const previous_customer_id = JSON.stringify(customerInfo[0].customer_id);
  const previous_age = JSON.stringify(customerInfo[0].age);
  const previous_gender = JSON.stringify(customerInfo[0].gender);

  return (
    <>
      <div className="card bordered bg-white border-blue-200 border-2 max-w-md m-4">
        <div className="m-4 card bordered bg-blue-200 duration-200 hover:border-r-red">
          <form action={updateCustomerFunc} method="POST">
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
