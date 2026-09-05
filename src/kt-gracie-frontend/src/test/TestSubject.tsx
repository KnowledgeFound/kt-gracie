import { FormEvent } from "react";
import { useCreateSubjectHook } from "../hooks/subjectHooks";
import { CreateSubjectInput } from "../types/types";
import { completeAssessment } from "@/services/completionService";
import * as CorpusService from "../services/corpusService";

export default function TestSubject() {

    // const createSubject = useCreateSubjectHook()

    // let newSubject: CreateSubjectInput = {
    //     name: "test name",
    //     code: "test code",
    //     duration: BigInt(84),
    //     description: "test description"
    // }

    async function handleSubmit(event: FormEvent<HTMLFormElement>){
       event.preventDefault(); 
        //  let res = await createSubject.mutateAsync(newSubject);

        //  console.log(res);

        console.log(await CorpusService.getCorpus());

        // console.log(await CorpusService.getPersistedCorpus());

        completeAssessment("KU-001", 1);

        console.log("done!");

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