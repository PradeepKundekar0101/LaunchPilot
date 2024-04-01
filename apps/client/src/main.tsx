import ReactDOM from "react-dom/client";
import "./index.css";
import {  RouterProvider } from "react-router-dom";
import { store } from "./store/store.ts";
import { Provider } from "react-redux";
import router from "./routes/index.tsx";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <RouterProvider router={router}/>
  </Provider>
);
