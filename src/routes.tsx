import React from "react";
import { Route, BrowserRouter } from "react-router-dom";
// ROTAS rotas
import Home from "../src/Pages/Home";
import CreatePoint from "../src/Pages/CreatePoint";

const src = () => {
  return (
    <BrowserRouter>
      <Route component={Home} path={"/"} exact />
      <Route component={CreatePoint} path={"/cadastro"} />
    </BrowserRouter>
  );
};

export default src;
