import { describe, it, expect } from "vitest";
import { City } from "../City";
import { CityState } from "../../ENUMS/enums";

describe("City health (single source of truth)", () => {
	it("starts at 0 health for a fresh city", () => {
		const city = new City("UN City");
		expect(city.getHealth()).toBe(0);
	});

	it("getHealth reflects a value set via setHealth (no longer a dead write)", () => {
		const city = new City("UN City");
		city.setHealth(72);
		expect(city.getHealth()).toBe(72);
	});

	it("decayCityHealth actually lowers the value returned by getHealth", () => {
		const city = new City("UN City");
		city.setHealth(50);
		city.decayCityHealth(); // default decay = 5
		expect(city.getHealth()).toBe(45);
	});

	it("recomputes health from scores minus decay when a score changes", () => {
		const city = new City("UN City");
		city.setContentScore(80); // 0.5*80 - 5 = 35
		expect(city.getHealth()).toBe(35);

		city.setFinalAssessmentScore(40); // 0.5*80 + 0.5*40 - 5 = 55
		expect(city.getHealth()).toBe(55);
	});
});

describe("City state tiers", () => {
	it("is CORRUPT at low health (fresh city)", () => {
		expect(new City("UN City").getCityState()).toBe(CityState.CORRUPT);
	});

	it("is NORMAL between 40 and 59", () => {
		const city = new City("UN City");
		city.setHealth(45);
		expect(city.getCityState()).toBe(CityState.NORMAL);
	});

	it("is VIBRANT at 60+", () => {
		const city = new City("UN City");
		city.setHealth(75);
		expect(city.getCityState()).toBe(CityState.VIBRANT);
	});
});

describe("City serialization round-trip preserves stored health", () => {
	it("restores the persisted health rather than recomputing it", () => {
		const original = new City("UN City");
		original.setHealth(63);

		// Mirror cityService.getCityFromLocalStorage() restore order.
		const parsed = JSON.parse(JSON.stringify(original)) as {
			name: string;
			contentScore: number;
			finalAssessmentScore: number;
			health: number;
		};
		const restored = new City(parsed.name);
		restored.setContentScore(parsed.contentScore);
		restored.setFinalAssessmentScore(parsed.finalAssessmentScore);
		restored.setHealth(parsed.health);

		expect(restored.getHealth()).toBe(63);
	});
});
