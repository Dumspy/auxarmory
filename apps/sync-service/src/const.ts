import { set, subDays } from "date-fns";

import type { RegionsConst } from "@auxarmory/battlenet/types";

// 0 Sunday
// 1 Monday
// 2 Tuesday
// 3 Wednesday
// 4 Thursday
// 5 Friday
// 6 Saturday

export const Resets: Record<(typeof RegionsConst)[number], Date> = {
	eu: set(subDays(new Date(), (new Date().getUTCDay() - 3 + 7) % 7), {
		hours: 4,
		minutes: 0,
		seconds: 0,
		milliseconds: 0,
	}),
	us: set(subDays(new Date(), (new Date().getUTCDay() - 2 + 7) % 7), {
		hours: 15,
		minutes: 0,
		seconds: 0,
		milliseconds: 0,
	}),
	kr: set(subDays(new Date(), (new Date().getUTCDay() - 4 + 7) % 7), {
		hours: 2,
		minutes: 0,
		seconds: 0,
		milliseconds: 0,
	}),
	tw: set(subDays(new Date(), (new Date().getUTCDay() - 4 + 7) % 7), {
		hours: 2,
		minutes: 0,
		seconds: 0,
		milliseconds: 0,
	}),
	cn: set(subDays(new Date(), (new Date().getUTCDay() - 4 + 7) % 7), {
		hours: 23,
		minutes: 0,
		seconds: 0,
		milliseconds: 0,
	}),
};
