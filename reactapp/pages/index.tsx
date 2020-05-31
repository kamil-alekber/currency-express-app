import React, { useEffect, useState } from "react";

function index() {
  const [data, setData] = useState({});
  const [_csrf, set_csrf] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetch("http://localhost:5000/api", {
          headers: {
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "content-type,x-requested-with",
          },
          credentials: "include",
        });
        const parsedData = await data.json();
        set_csrf(parsedData._csrf);
        setData(parsedData);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement> & {
      target: { email: { value: string }; password: { value: string } };
    }
  ) {
    e.preventDefault();
    const email = e?.target?.email?.value;
    const password = e?.target?.password.value;

    const res = await fetch("http://localhost:5000/api", {
      credentials: "include",
      method: "POST",
      redirect: "follow",
      mode: "cors",
      referrerPolicy: "origin",
      headers: {
        "Content-Type": "application/json",
        "csrf-token": _csrf,
        "X-Custom-Header": "ProcessThisImmediately",
      },
      body: JSON.stringify({ email, password }),
    });
    const parsedData = await res.text();
    console.warn(parsedData);
  }
  return (
    <div>
      <div>next js app {JSON.stringify(data)}</div>;
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" name="email" defaultValue="kamil" />
        <label htmlFor="password">password</label>
        <input
          id="password"
          type="text"
          name="password"
          defaultValue="test1234"
        />
        <button>submit</button>
      </form>
    </div>
  );
}

export default index;
