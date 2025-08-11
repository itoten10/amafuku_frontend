export default function SignupPage() {
  const createAccount = async (formData) => {
    "use server";

    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    console.log({ name, email, password });
  };

  return (
    <form action={createAccount} method="POST">
      <p>
        text: <input type="text" name="name" className="input input-bordered" />
      </p>
      <p>
        email:{" "}
        <input type="email" name="email" className="input input-bordered" />
      </p>
      <p>
        password:{" "}
        <input
          type="password"
          name="password"
          className="input input-bordered"
        />
      </p>
      <button className="btn btn-primary m-4 text-2xl">submit</button>
    </form>
  );
}
