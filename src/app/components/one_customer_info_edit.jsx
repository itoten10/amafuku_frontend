export default function OneCustomerInfoEdit({
  customer_id,
  customer_name,
  age,
  gender,
}) {
  return (
    <>
      <div className="m-4 card bordered bg-blue-200 duration-200 hover:border-r-red">
        <div className="card-body">
          <h2 className="card-title">
            <p>
              <input
                type="text"
                name="customer_name"
                defaultValue={customer_name}
                className="input input-bordered"
              />
              さん
            </p>
          </h2>
          <p>Customer ID: {customer_id} </p>
          <p>
            Age:
            <input
              type="number"
              name="age"
              defaultValue={age}
              className="input input-bordered"
            />
          </p>
          <p>
            Gender:
            <input
              type="text"
              name="gender"
              defaultValue={gender}
              className="input input-bordered"
            />
          </p>
        </div>
        <button className="btn btn-primary m-4 text-2xl">更新</button>
      </div>
    </>
  );
}
