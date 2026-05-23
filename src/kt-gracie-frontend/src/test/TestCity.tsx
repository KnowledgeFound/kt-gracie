import { FormEvent } from "react";
import {createCity, saveCityToLocalStorage, getCityFromLocalStorage} from "../services/cityService";

export default function TestCity() {

    async function handleSubmit(event: FormEvent<HTMLFormElement>){
        event.preventDefault(); 
       
        const city = createCity("Johannesburg");

        console.log(city);

        saveCityToLocalStorage(city);

        const storedCity = getCityFromLocalStorage();

        storedCity?.setContentScore(85);

        console.log(storedCity);

    }
    
    return (
        <>
            <form action="#" onSubmit={handleSubmit}>
                <label htmlFor="name">Enter your name:&nbsp;</label>
                <input id="name" name="name" alt="Name" type="text" />
                <button type="submit">Click Me!</button>
            </form>
        </>
    )
}