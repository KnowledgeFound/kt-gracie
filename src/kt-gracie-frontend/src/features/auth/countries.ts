import { Region } from '@/ENUMS/enums';

export interface Country {
	name: string;
	/** UN M49 sub-region, which is what the `Region` enum models. */
	region: Region;
}

const R = Region;

/** Every UN member and observer state plus a few commonly chosen territories, A–Z. */
export const COUNTRIES: readonly Country[] = [
	// Northern Africa
	...['Algeria', 'Egypt', 'Libya', 'Morocco', 'Sudan', 'Tunisia', 'Western Sahara'].map((name) => ({ name, region: R.NORTHERN_AFRICA })),
	// Eastern Africa
	...['Burundi', 'Comoros', 'Djibouti', 'Eritrea', 'Ethiopia', 'Kenya', 'Madagascar', 'Malawi', 'Mauritius', 'Mozambique', 'Rwanda', 'Seychelles', 'Somalia', 'South Sudan', 'Tanzania', 'Uganda', 'Zambia', 'Zimbabwe'].map((name) => ({ name, region: R.EASTERN_AFRICA })),
	// Middle Africa
	...['Angola', 'Cameroon', 'Central African Republic', 'Chad', 'Congo (Republic)', 'Democratic Republic of the Congo', 'Equatorial Guinea', 'Gabon', 'São Tomé and Príncipe'].map((name) => ({ name, region: R.MIDDLE_AFRICA })),
	// Southern Africa
	...['Botswana', 'Eswatini', 'Lesotho', 'Namibia', 'South Africa'].map((name) => ({ name, region: R.SOUTHERN_AFRICA })),
	// Western Africa
	...['Benin', 'Burkina Faso', 'Cabo Verde', "Côte d'Ivoire", 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Liberia', 'Mali', 'Mauritania', 'Niger', 'Nigeria', 'Senegal', 'Sierra Leone', 'Togo'].map((name) => ({ name, region: R.WESTERN_AFRICA })),
	// Caribbean
	...['Antigua and Barbuda', 'Bahamas', 'Barbados', 'Cuba', 'Dominica', 'Dominican Republic', 'Grenada', 'Haiti', 'Jamaica', 'Puerto Rico', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Trinidad and Tobago'].map((name) => ({ name, region: R.CARIBBEAN })),
	// Central America
	...['Belize', 'Costa Rica', 'El Salvador', 'Guatemala', 'Honduras', 'Mexico', 'Nicaragua', 'Panama'].map((name) => ({ name, region: R.CENTRAL_AMERICA })),
	// South America
	...['Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela'].map((name) => ({ name, region: R.SOUTH_AMERICA })),
	// Northern America
	...['Canada', 'United States'].map((name) => ({ name, region: R.NORTHERN_AMERICA })),
	// Central Asia
	...['Kazakhstan', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan', 'Uzbekistan'].map((name) => ({ name, region: R.CENTRAL_ASIA })),
	// Eastern Asia
	...['China', 'Hong Kong', 'Japan', 'Mongolia', 'North Korea', 'South Korea', 'Taiwan'].map((name) => ({ name, region: R.EASTERN_ASIA })),
	// South-Eastern Asia
	...['Brunei', 'Cambodia', 'Indonesia', 'Laos', 'Malaysia', 'Myanmar', 'Philippines', 'Singapore', 'Thailand', 'Timor-Leste', 'Vietnam'].map((name) => ({ name, region: R.SOUTH_EASTERN_ASIA })),
	// Southern Asia
	...['Afghanistan', 'Bangladesh', 'Bhutan', 'India', 'Iran', 'Maldives', 'Nepal', 'Pakistan', 'Sri Lanka'].map((name) => ({ name, region: R.SOUTHERN_ASIA })),
	// Western Asia
	...['Armenia', 'Azerbaijan', 'Bahrain', 'Cyprus', 'Georgia', 'Iraq', 'Israel', 'Jordan', 'Kuwait', 'Lebanon', 'Oman', 'Palestine', 'Qatar', 'Saudi Arabia', 'Syria', 'Türkiye', 'United Arab Emirates', 'Yemen'].map((name) => ({ name, region: R.WESTERN_ASIA })),
	// Eastern Europe
	...['Belarus', 'Bulgaria', 'Czechia', 'Hungary', 'Moldova', 'Poland', 'Romania', 'Russia', 'Slovakia', 'Ukraine'].map((name) => ({ name, region: R.EASTERN_EUROPE })),
	// Northern Europe
	...['Denmark', 'Estonia', 'Finland', 'Iceland', 'Ireland', 'Latvia', 'Lithuania', 'Norway', 'Sweden', 'United Kingdom'].map((name) => ({ name, region: R.NORTHERN_EUROPE })),
	// Southern Europe
	...['Albania', 'Andorra', 'Bosnia and Herzegovina', 'Croatia', 'Greece', 'Italy', 'Kosovo', 'Malta', 'Montenegro', 'North Macedonia', 'Portugal', 'San Marino', 'Serbia', 'Slovenia', 'Spain', 'Vatican City'].map((name) => ({ name, region: R.SOUTHERN_EUROPE })),
	// Western Europe
	...['Austria', 'Belgium', 'France', 'Germany', 'Liechtenstein', 'Luxembourg', 'Monaco', 'Netherlands', 'Switzerland'].map((name) => ({ name, region: R.WESTERN_EUROPE })),
	// Oceania
	...['Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru', 'New Zealand', 'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu'].map((name) => ({ name, region: R.OCEANIA })),
].sort((a, b) => a.name.localeCompare(b.name));

/** The region a country belongs to, or undefined for an unknown name. */
export function regionForCountry(name: string): Region | undefined {
	return COUNTRIES.find((c) => c.name === name)?.region;
}
