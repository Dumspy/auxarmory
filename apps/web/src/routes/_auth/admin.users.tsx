import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'

import { platformPermissions } from '@auxarmory/auth/permissions'
import { Badge } from '@auxarmory/ui/components/ui/badge'
import { Button } from '@auxarmory/ui/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@auxarmory/ui/components/ui/card'
import { Input } from '@auxarmory/ui/components/ui/input'
import {
	Item,
	ItemActions,
	ItemContent,
} from '@auxarmory/ui/components/ui/item'
import {
	NativeSelect,
	NativeSelectOption,
} from '@auxarmory/ui/components/ui/native-select'

import { ensurePermissionOrRedirect } from '../../lib/route-auth'
import { authClient } from '../../lib/auth-client'
import { useTRPC } from '../../lib/trpc'

const PAGE_SIZE = 20

export const Route = createFileRoute('/_auth/admin/users' as never)({
	beforeLoad: async ({ context }) => {
		const queryClient = (context as { queryClient: QueryClient })
			.queryClient

		await ensurePermissionOrRedirect({
			queryClient,
			permission: platformPermissions.adminUsersList,
		})
	},
	component: AdminUsersPage,
})

function AdminUsersPage() {
	const trpc = useTRPC()
	const [searchInput, setSearchInput] = useState('')
	const [searchValue, setSearchValue] = useState('')
	const [offset, setOffset] = useState(0)
	const [setRoleError, setSetRoleError] = useState<string | null>(null)
	const { data: session } = authClient.useSession()

	const listUsersInput = useMemo(
		() => ({
			limit: PAGE_SIZE,
			offset,
			searchValue: searchValue.length > 0 ? searchValue : undefined,
		}),
		[offset, searchValue],
	)

	const usersQuery = useQuery(
		trpc.admin.users.list.queryOptions(listUsersInput),
	)

	const setRoleMutation = useMutation(
		trpc.admin.users.setRole.mutationOptions({
			onSuccess: async () => {
				await usersQuery.refetch()
			},
		}),
	)

	const users = usersQuery.data?.users ?? []
	const total = usersQuery.data?.total ?? 0
	const hasPreviousPage = offset > 0
	const hasNextPage = offset + PAGE_SIZE < total
	const currentUserId = session?.user?.id

	async function handleRoleChange(userId: string, role: 'user' | 'admin') {
		setSetRoleError(null)

		try {
			await setRoleMutation.mutateAsync({ userId, role })
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: 'Unable to update user role right now.'
			setSetRoleError(message)
		}
	}

	function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setOffset(0)
		setSearchValue(searchInput.trim())
	}

	return (
		<div className='space-y-6 p-2 md:p-4'>
			<div>
				<h1 className='text-foreground text-2xl font-bold'>Users</h1>
				<p className='text-muted-foreground'>
					Manage platform user roles and access.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>User Management</CardTitle>
					<CardDescription>
						Search users by email and update platform role.
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<form
						onSubmit={handleSearchSubmit}
						className='flex flex-col gap-2 sm:flex-row'
					>
						<Input
							placeholder='Search by email'
							value={searchInput}
							onChange={(event) =>
								setSearchInput(event.target.value)
							}
						/>
						<Button type='submit'>Search</Button>
					</form>

					{usersQuery.isPending ? (
						<p className='text-muted-foreground text-sm'>
							Loading users...
						</p>
					) : null}

					{usersQuery.isError ? (
						<p className='text-destructive text-sm'>
							Unable to load users right now.
						</p>
					) : null}

					{setRoleError ? (
						<p className='text-destructive text-sm'>
							{setRoleError}
						</p>
					) : null}

					{!usersQuery.isPending &&
					!usersQuery.isError &&
					users.length === 0 ? (
						<p className='text-muted-foreground text-sm'>
							No users found.
						</p>
					) : null}

					<div className='space-y-2'>
						{users.map((user) => {
							const currentRole =
								user.role === 'admin' ? 'admin' : 'user'
							const isCurrentUser = user.id === currentUserId
							const isUpdating =
								setRoleMutation.isPending &&
								setRoleMutation.variables?.userId === user.id

							return (
								<Item
									key={user.id}
									variant='outline'
									className='flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between'
								>
									<ItemContent className='min-w-0'>
										<p className='truncate text-sm font-medium'>
											{user.name ?? 'Unnamed user'}
										</p>
										<p className='text-muted-foreground truncate text-xs'>
											{user.email}
										</p>
									</ItemContent>

									<ItemActions className='w-full justify-start sm:w-auto sm:justify-end'>
										<Badge
											variant={
												currentRole === 'admin'
													? 'default'
													: 'outline'
											}
										>
											{currentRole}
										</Badge>

										<NativeSelect
											size='sm'
											className='min-w-24'
											value={currentRole}
											disabled={
												isUpdating || isCurrentUser
											}
											onChange={(event) => {
												const nextRole = event.target
													.value as 'user' | 'admin'

												if (nextRole !== currentRole) {
													void handleRoleChange(
														user.id,
														nextRole,
													)
												}
											}}
										>
											<NativeSelectOption value='user'>
												user
											</NativeSelectOption>
											<NativeSelectOption value='admin'>
												admin
											</NativeSelectOption>
										</NativeSelect>
										{isCurrentUser ? (
											<span className='text-muted-foreground text-xs'>
												You
											</span>
										) : null}
									</ItemActions>
								</Item>
							)
						})}
					</div>

					<div className='flex items-center justify-between'>
						<p className='text-muted-foreground text-xs'>
							Showing {Math.min(offset + 1, total)}-
							{Math.min(offset + users.length, total)} of {total}
						</p>
						<div className='flex gap-2'>
							<Button
								variant='outline'
								disabled={
									!hasPreviousPage || usersQuery.isFetching
								}
								onClick={() =>
									setOffset((current) =>
										Math.max(0, current - PAGE_SIZE),
									)
								}
							>
								Previous
							</Button>
							<Button
								variant='outline'
								disabled={!hasNextPage || usersQuery.isFetching}
								onClick={() =>
									setOffset((current) => current + PAGE_SIZE)
								}
							>
								Next
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
