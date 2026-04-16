import { FormEvent } from "react";
import { useGreet } from "../hooks/useGreet";

export default function GreetingForm() {
  const greet = useGreet();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    greet.mutate({ name });
  }

  return (
    <>
      <form action="#" onSubmit={handleSubmit}>
        <label htmlFor="name">Enter your name:&nbsp;</label>
        <input id="name" name="name" alt="Name" type="text" />
        <button type="submit">Click Me!</button>
      </form>
      <section id="greeting">{greet.data ?? ""}</section>
    </>
  );
}
