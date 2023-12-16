import { createSlice } from "@reduxjs/toolkit";

export const shownSlice = createSlice({
    name: 'shownSlice',
    initialState: {
        shown: false
    },
    reducers: {
        mobileShow: state => {
            state.shown = true
        },
        mobileHide: state => {
            state.shown = false
        }
    }
})

export const { mobileShow, mobileHide } = shownSlice.actions
export default shownSlice.reducer