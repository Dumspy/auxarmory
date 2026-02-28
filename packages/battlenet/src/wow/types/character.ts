import { z } from 'zod/v4';

import { Realm } from '.';
import { KeyResponse } from '../../types';

export const CharacterResponse = z.strictObject({
	key: KeyResponse,
	name: z.string(),
	id: z.number(),
	realm: Realm,
});
