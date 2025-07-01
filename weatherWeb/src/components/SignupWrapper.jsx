import React from "react";
import { useNavigate } from "react-router-dom";
import Signup from "./Signup";

const SignupWrapper = () => {
  const navigate = useNavigate();
  return <Signup navigate={navigate} />;
};

export default SignupWrapper;