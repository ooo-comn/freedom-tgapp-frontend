import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IContact } from './types'

interface CourseState {
	data: IContact | null
}

const initialState: CourseState = {
	data: null,
}

export const courseSlice = createSlice({
	name: 'course',
	initialState,
	reducers: {
		setCourseData: (state, action: PayloadAction<IContact>) => {
			state.data = action.payload
		},
	},
})

export const { setCourseData } = courseSlice.actions
export default courseSlice.reducer
