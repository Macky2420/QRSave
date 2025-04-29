import { createBrowserRouter } from "react-router-dom";
import Hero from "../pages/Hero";
import Layout from "../layout/Layout";
import Home from "../pages/Home";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Hero/>
  },
  {
    path: "/home/:userId",
    element: <Layout/>,
    children: [
      {
        index: true,
        element: <Home/>
      }
    ]
  }
])