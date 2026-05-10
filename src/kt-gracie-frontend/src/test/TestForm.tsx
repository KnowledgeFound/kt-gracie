import { FormEvent } from "react";
import { useCreateSubjectHook } from "../hooks/subjectHooks";
import { CreateSubjectInput } from "../types/types";

export default function TestForm() {

    const createSubject = useCreateSubjectHook()

    let newSubject: CreateSubjectInput = {
        name: "test name",
        code: "test code",
        duration: BigInt(84),
        description: "test description"
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>){
       event.preventDefault(); 
       let res = await createSubject.mutateAsync(newSubject);

       console.log(res);
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