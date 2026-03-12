import type { ClientReturn } from '../types'
import { WoWProfileClient } from '../wow'
import { BaseClient } from './base'
import type { BaseClientOptions, BaseRequestOptions } from './base'

export interface AccountOptions extends BaseClientOptions {
	accessToken: string
}

type AccountRequestOptions<T> = Omit<
	BaseRequestOptions<T>,
	'authorization' | 'namespace'
>

export class AccountClient extends BaseClient {
	protected accessToken: string
	public wow: WoWProfileClient

	constructor(options: AccountOptions) {
		super(options)
		this.accessToken = options.accessToken
		this.wow = new WoWProfileClient(this)
	}

	public override async request<T>(
		opt: AccountRequestOptions<T>,
	): Promise<ClientReturn<T>> {
		return super.request({
			...opt,
			authorization: this.accessToken,
			namespace: 'profile',
		})
	}
}
