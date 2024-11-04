import React, { createContext, useReducer, useEffect } from "react";

import * as actionTypes from "./actions";
import reducer from "./reducer";

const initialState = {
  user: {
    email: null,
    // other user properties
  },
};
export const GlobalContext = createContext(initialState);

export const GlobalProvider = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Check localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      dispatch({
        type: actionTypes.SET_USER,
        payload: JSON.parse(savedUser)
      });
    }
  }, []);

  function setAuth(user) {
    // Save to localStorage when setting auth
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({
      type: actionTypes.SET_USER,
      payload: user,
    });
  }

  return (
    <GlobalContext.Provider
      value={{
        user: state.user,
        setAuth,
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
};
