import React from "react";
import { Route } from "react-router-dom";
import Home from "../../pages/user/home/home";

const UserRoutes = () => (
  <>
    <Route path="/" element={<Home />} />
  </>
);

export default UserRoutes;
