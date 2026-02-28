export function getUserInitial(name: string | null | undefined) {
	return name?.slice(0, 1).toUpperCase() || 'U'
}
