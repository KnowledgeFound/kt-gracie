export const STORAGE_KEY = 'gracie_user' as const;

export const AGE_BUCKET_LABELS: Record<string, string> = {
	AGE_17_19: '17 – 19',
	AGE_20_22: '20 – 22',
	AGE_23_25: '23 – 25',
	AGE_UNDISCLOSED: 'Prefer not to say',
};

export const GENDER_LABELS: Record<string, string> = {
	MALE: 'Male',
	FEMALE: 'Female',
	UNDISCLOSED: 'Prefer not to say',
};

export const REGION_LABELS: Record<string, string> = {
	NORTHERN_AFRICA: 'Northern Africa',
	EASTERN_AFRICA: 'Eastern Africa',
	MIDDLE_AFRICA: 'Middle Africa',
	SOUTHERN_AFRICA: 'Southern Africa',
	WESTERN_AFRICA: 'Western Africa',
	CARIBBEAN: 'Caribbean',
	CENTRAL_AMERICA: 'Central America',
	SOUTH_AMERICA: 'South America',
	NORTHERN_AMERICA: 'Northern America',
	CENTRAL_ASIA: 'Central Asia',
	EASTERN_ASIA: 'Eastern Asia',
	SOUTH_EASTERN_ASIA: 'South-Eastern Asia',
	SOUTHERN_ASIA: 'Southern Asia',
	WESTERN_ASIA: 'Western Asia',
	EASTERN_EUROPE: 'Eastern Europe',
	NORTHERN_EUROPE: 'Northern Europe',
	SOUTHERN_EUROPE: 'Southern Europe',
	WESTERN_EUROPE: 'Western Europe',
	OCEANIA: 'Oceania',
};
