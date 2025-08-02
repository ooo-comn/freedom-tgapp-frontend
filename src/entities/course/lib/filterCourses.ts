import { IContact } from '../model/types'

export const filterCourses = (filteredData: IContact[]) => {
	return filteredData.reduce((acc, obj) => {
		if (obj.id === 79) {
			acc.unshift(obj)
		} else {
			acc.push(obj)
		}
		return acc
	}, [] as IContact[])
}
