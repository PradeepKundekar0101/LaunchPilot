export interface User{
    id:string,
    email:string,
    userName:string,
    isEmailVerified?:boolean
}
export interface Project{
    id:string,
    projectName:string,
    gitUrl:string,
    userId:string
}
