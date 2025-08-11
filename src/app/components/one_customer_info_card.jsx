export default function OneCustomerInfoCard({
  customer_id,
  customer_name,
  age,
  gender,
}) {
  return (
    <>
      <div className="m-4 card bordered bg-blue-200 duration-200 hover:border-r-red">
        <div className="card-body">
          <h2 className="card-title">{customer_name}さん</h2>
          <p>Customer ID: {customer_id}</p>
          <p>Age: {age}</p>
          <p>Gender: {gender}</p>
        </div>
      </div>
    </>
  );
}
