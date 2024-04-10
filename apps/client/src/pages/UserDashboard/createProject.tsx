import { useMutation, useQuery } from "@tanstack/react-query";

import { Formik, Field, ErrorMessage, FormikValues } from "formik";
import { projectSchema } from "../../schema/project";
import useProjectApi from "../../hooks/useProject";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { service1, service2, service3 } from "../../assets";
import Section from "../../components/Section";
import Heading from "../../components/Heading";
import Button from "../../components/Button";

interface ProjectDetails {
  projectName: string;
  gitHubUrl: string;
}
const CreateProject = () => {
  const socketRef = useRef<any>(null);
  const [logs, setLogs] = useState<{ log: string; timestamp: string }[]>([]);
  const [deploymentUrl, setDeploymentUrl] = useState("");
  const [deploymentId, setDeploymentId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [env,setEnv] = useState<{key:string,value:string}[]>([{
    key:"",
    value:""
  }]);
  const details: ProjectDetails = {
    projectName: "",
    gitHubUrl: "",
  };

  const { createProject, deployProject, getLogs } = useProjectApi();

  const { mutate: mutateCreateProject } = useMutation({
    mutationKey: ["create_project"],
    mutationFn: async (values: ProjectDetails) => {
      setProjectName(values.projectName);
      const { data } = await createProject(
        values.gitHubUrl,
        values.projectName
      );
      return data.data;
    },
    onSuccess: (data) => {
      handleDeployment(data);
    },
    onError: (data) => {
      alert(data.message);
    },
  });

  const { mutate: mutateDeployProject } = useMutation({
    mutationKey: ["deploy_project"],
    mutationFn: async (projectId: string) => {
      const { data } = await deployProject(projectId);
      return data.data;
    },
    onSuccess: async (data) => {
      const { deploymentId, url } = data;
      setDeploymentUrl(url);
      setDeploymentId(deploymentId);
      const startTime = Date.now();
      const interval = setInterval(async () => {
        const res = await getLogs(deploymentId);

        const tlogs = res.data.data.logs;
        const sortedLogs = [...tlogs].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        const currTime = Date.now();
        setLogs(sortedLogs);
        const status = res.data.data.deploymentStatus;
        if (
          status === "FAIL" ||
          status === "DEPLOYED" ||
          currTime - startTime > 60000 * 5
        )
          clearInterval(interval);
      }, 2000);
    },
    onError: (data) => {
      console.log("On error");
      console.log(data);
      alert(data.message);
    },
  });
  const handleDeployment = async (data: any) => {
    try {
      mutateDeployProject(data.projectId);
    } catch (error) {}
  };
  const handleSubmit = (values: FormikValues) => {
    try {
      mutateCreateProject({
        projectName: values.projectName,
        gitHubUrl: values.gitHubUrl,
      });
    } catch (error) {}
  };
  return (
    <div>
      <Section id="create-project">
        <div className="container">
          <Heading
            title="Create a new Project"
            text="Create a new project and get it deployed!"
          />

          <div className="relative overflow-y-hidden">
            <div className="w-full relative z-1 flex items-center h-[39rem] mb-5 p-8 border border-n-1/10 rounded-3xl overflow-hidden md:p-20 xl:h-[46rem]">
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none md:w-1/2 xl:w-auto overflow-x-hidden">
                <img
                  className="object-cover h-full lg:object-right"
                  width={800}
                  alt="Create Project"
                  height={730}
                  src={service3}
                />
              </div>

              <div className="relative z-1 w-1/2 h-full px-10  ml-auto overflow-y-scroll">
                <Formik
                  initialValues={details as any}
                  validationSchema={projectSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting, errors, handleSubmit }) => (
                    <form className="  flex flex-col space-y-4 " onSubmit={handleSubmit}>
                      <label htmlFor="Project Name" className="">
                        <span className="my-2">
                          Project Name
                        </span>
                        <Field
                          type="text"
                          name="projectName"
                          className={`${errors.projectName} ? " border-red-500 border-2" : "border-white" border  rounded-lg outline-none text-white w-full py-2 px-4 bg-transparent my-2`}
                        />
                        <ErrorMessage
                          name="projectName"
                          component="div"
                          className=" text-red-600"
                        />
                      </label>

                      <label htmlFor="gitHubUrl">
                        GitHub URL
                        <Field
                          type="text"
                          name="gitHubUrl"
                          className={`${errors.projectName} ? " border-red-500 border-2" : "border-white" border  rounded-lg outline-none text-white w-full py-2 px-4 bg-transparent my-2` }
                        />
                        <ErrorMessage
                          name="gitHubUrl"
                          component="div"
                          className=" text-red-600"
                        />
                      </label>

                      <label htmlFor="gitHubUrl">
                        Path
                        <Field
                          type="text"
                          name="gitHubUrl"
                          className={`${errors.projectName} ? " border-red-500 border-2" : "border-white" border  rounded-lg outline-none text-white w-full py-2 px-4 bg-transparent my-2` }
                        />
                        <ErrorMessage
                          name="gitHubUrl"
                          component="div"
                          className=" text-red-600"
                        />
                      </label>
                      {
                        env.map((e)=> <div className="flex flex-col space-y-2 w-full">
                          <div className="flex space-x-2">

                         
                            <label htmlFor="gitHubUrl">
                        Key
                        <Field
                          type="text"
                          name="gitHubUrl"
                          className={`${errors.projectName} ? " border-red-500 border-2" : "border-white" border  rounded-lg outline-none text-white w-full py-2 px-4 bg-transparent my-2` }
                        />
                        <ErrorMessage
                          name="gitHubUrl"
                          component="div"
                          className=" text-red-600"
                        />
                      </label>
                      <label htmlFor="gitHubUrl">
                        VaLue
                        <Field
                          type="text"
                          name="gitHubUrl"
                          className={`${errors.projectName} ? " border-red-500 border-2" : "border-white" border  rounded-lg outline-none text-white w-full py-2 px-4 bg-transparent my-2` }
                        />
                        <ErrorMessage
                          name="gitHubUrl"
                          component="div"
                          className=" text-red-600"
                        />
                      </label>
                      </div>
                     
                     
                        </div>)
                      }
                       <div className="w-full flex justify-end">
                      <button onClick={()=>{setEnv((prev)=>[...prev,{key:"",value:""}])}} className=" bg-purple-600 items-center py-2 px-4 justify-end ">Add another value</button>
                      </div>

                        <Button white={true}>
                          Submit
                        </Button>
                      
                      {/* <button type="submit" disabled={isSubmitting}>
                        Submit
                      </button> */}
                    </form>
                  )}
                </Formik>
              </div>
            </div>


          </div>
        </div>
      </Section>
      Login
      <h1 className="text-white">
        {" "}
        <Link to={deploymentUrl}>{deploymentUrl}</Link>
      </h1>
      <ul>
        {logs &&
          logs.map((log, ind) => (
            <li key={ind} className="text-white">
              {JSON.parse(log.log).log + " " + log.timestamp}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default CreateProject;
