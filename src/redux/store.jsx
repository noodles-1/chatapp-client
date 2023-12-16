import { configureStore } from "@reduxjs/toolkit";
import shown from "./shown";

export default configureStore({
    reducer: {
        shown: shown
    }
})