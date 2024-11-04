import React, { useState, useEffect, useContext } from "react";

import { useRouter } from "next/router";
import Loading from "./loading";
import { GlobalContext } from "../context/GlobalContext";

export default function CheckAuth(props) {
  const router = useRouter();
  const { user } = useContext(GlobalContext);
  const [showAuth, setShowAuth] = useState(true);

  useEffect(() => {
    console.log("User details:", user);

    if (!user || !user.email) {
      router.push("/login");
      console.log("User not logged in, redirecting to login");
      return;
    }

    setShowAuth(false);
  }, [user]);

  return showAuth ? <Loading /> : <>{props.children}</>;
}
