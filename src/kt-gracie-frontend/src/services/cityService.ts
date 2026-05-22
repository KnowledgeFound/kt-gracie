import { City } from "../models/City";
import { setLocalStorage, getLocalStorage } from "../commons/utilts";

export function createCity(name: string): City {
    return new City(name);
};

export function saveCityToLocalStorage(city: City): void {
    setLocalStorage("city", JSON.stringify(city));
}

export function getCityFromLocalStorage(): City | null {
    const cityData = getLocalStorage("city");
    if (cityData) {
        const parsed = JSON.parse(cityData);

        var city = new City(parsed.name);
        city.setContentScore(parsed.contentScore);
        city.setFinalAssessmentScore(parsed.finalAssessmentScore);
        city.setHealth(parsed.health);
        
        return city;
    }
    return null;
}


export function deleteCityFromLocalStorage(): void {
    localStorage.removeItem("city");
}



