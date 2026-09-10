import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { UserProvider, useUser } from "../context";
import { getCityFromLocalStorage } from "../../../services/cityService";
import { City } from "../../../models/City";
import { Gender, AgeBucket } from "../../../ENUMS/enums";

const wrapper = ({ children }: { children: ReactNode }) => (
	<UserProvider>{children}</UserProvider>
);

const INPUT = {
	firstName: "Alice",
	ageBucket: AgeBucket.AGE_20_22,
	gender: Gender.FEMALE,
};

beforeEach(() => {
	localStorage.clear();
});

describe("UserProvider city sync (Bug 1)", () => {
	it("starts with no city when local storage is empty", () => {
		const { result } = renderHook(() => useUser(), { wrapper });
		expect(result.current.city).toBeNull();
	});

	it("exposes the city in context immediately after createUser (no refresh)", () => {
		const { result } = renderHook(() => useUser(), { wrapper });

		act(() => {
			result.current.createUser(INPUT);
		});

		// Context state is updated in the same session — the auth redirect
		// gate `if (user && city)` can now fire without a page reload.
		expect(result.current.user).not.toBeNull();
		expect(result.current.city).toBeInstanceOf(City);
		expect(result.current.city?.getName()).toBe("UN City");

		// And it was persisted.
		expect(getCityFromLocalStorage()).toBeInstanceOf(City);
	});

	it("clears the city from context and storage on deleteUser", () => {
		const { result } = renderHook(() => useUser(), { wrapper });

		act(() => {
			result.current.createUser(INPUT);
		});
		expect(result.current.city).not.toBeNull();

		act(() => {
			result.current.deleteUser();
		});

		expect(result.current.user).toBeNull();
		expect(result.current.city).toBeNull();
		expect(getCityFromLocalStorage()).toBeNull();
	});
});
