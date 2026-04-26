import {Assessment} from "./Assessment";

export type Subject = {
    name: string;
    code: string;
    assessments: Assessment[];
};