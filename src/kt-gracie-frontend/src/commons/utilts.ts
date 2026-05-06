export const setLocalStorage = (key: string,value:any) => {
    localStorage.setItem(key, JSON.stringify(value));
}

export const getLocalStorage = (key:string): any => {
    const item = localStorage.getItem(key);

    if(item){
        return JSON.parse(item);
    }

    return null;
}