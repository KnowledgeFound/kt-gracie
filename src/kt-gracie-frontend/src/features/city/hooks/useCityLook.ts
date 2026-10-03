import { useSearchParams } from 'react-router-dom';
import { CityState } from '@/ENUMS/enums';
import type { City } from '@/models/City';
import type { CityLook } from '../types';

/** The look a city state is drawn with. */
export function cityLookFor(state: CityState | undefined): CityLook {
	if (state === CityState.DESTROYED) return 'destroyed';
	if (state === CityState.CORRUPT) return 'corrupt';
	return 'normal';
}

/**
 * Which look to draw the city (and the pages that share its backdrop) in.
 * In development `?cityState=corrupt` / `=destroyed` (or `=vibrant`) forces
 * a look so the artwork can be checked without editing the stored health.
 */
export function useCityLook(city: City | null | undefined): CityLook {
	const [searchParams] = useSearchParams();
	const forced = import.meta.env.DEV ? searchParams.get('cityState') : null;
	if (forced === 'corrupt') return 'corrupt';
	if (forced === 'destroyed') return 'destroyed';
	if (forced) return 'normal';
	return cityLookFor(city?.getCityState());
}
