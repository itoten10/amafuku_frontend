"use client";
import { useRouter } from "next/navigation";

const BackButton = (props) => {
  const router = useRouter();

  return (
    <button onClick={() => router.back()}>
      <div className="btn btn-primary m-4 text-2xl">{props.children}</div>
    </button>
  );
};

export default BackButton;
