import { useMutation, useQuery } from "@tanstack/react-query";

import { Formik, Field, ErrorMessage, FormikValues } from "formik";
import { projectSchema } from "../../schema/project";
import useProjectApi from "../../hooks/useProject";
import { useEffect, useRef, useState } from "react";
import { initSocket } from "../../socket/initSocket";
import { Actions } from "../../socket/actions";
import { Link } from "react-router-dom";

interface ProjectDetails {
  projectName: string;
  gitHubUrl: string;
}
const CreateProject = () => {
  const socketRef = useRef<any>(null);
  const [logs, setLogs] = useState<{log:string,timestamp:string}[]>([]);
  const [deploymentUrl, setDeploymentUrl] = useState("");
  const [deploymentId, setDeploymentId] = useState("");
  const [projectName, setProjectName] = useState("");
  const details: ProjectDetails = {
    projectName: "",
    gitHubUrl: "",
  };

  const { createProject, deployProject,getLogs } = useProjectApi();

  // const {data:logData,refetch:refetchLogs} = useQuery({
  //   queryKey:["logs"],
  //   queryFn:async()=>{
  //     if(deploymentId==="")
  //       return null;
  //     const {data} = await getLogs(deploymentId);
      
  //     return data.data.logs;
  //   }
  // })


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
      setInterval(async()=>{
        const res = await getLogs(deploymentId);

        const tlogs= res.data.data.logs;
        const sortedLogs = [...tlogs].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        console.log(sortedLogs)
        setLogs(sortedLogs);


      },2000);
      // socketRef.current = await initSocket();
      // if (!socketRef.current) return alert("Socket connection failed");
      // socketRef.current.on("connect_error", (err: string) => {
      //   console.log("Connection error");
      //   console.log(err);
      //   alert(err);
      // });
      // socketRef.current.on("connect_failed", (err: string) => {
      //   console.log("Connection failed erro");
      //   console.log(err);
      //   alert(err);
      // });
      // console.log("Project name" + details.projectName);
      // console.log("New project name" + projectName);
      // socketRef.current.emit(Actions.SUBCRIBE, `logs:${deploymentId}`);
      // socketRef.current.on(Actions.MESSAGE, (message: any) => {
      //   setLogs((prevLogs) => [...prevLogs, JSON.parse(message).log]);
      //   console.log(logs);
      // });
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
  // useEffect(() => {
  //   refetchLogs();
  //   setLogs(logData);
  // }, [deploymentId])
  
  return (
    <div>
      Login
      <Formik
        initialValues={details as any}
        validationSchema={projectSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <label htmlFor="Project Name">
              Project Name:
              <Field
                type="text"
                name="projectName"
                className={`${errors.projectName} ? " border-red-500 border-2" : "" text-black`}
              />
              <ErrorMessage
                name="projectName"
                component="div"
                className=" text-red-600"
              />
            </label>

            <label htmlFor="gitHubUrl">
              GitHub URL:
              <Field
                type="text"
                name="gitHubUrl"
                className={`${errors.projectName} ? " border-red-500 border-2" : "" text-black`}
              />
              <ErrorMessage
                name="gitHubUrl"
                component="div"
                className=" text-red-600"
              />
            </label>

            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </form>
        )}
      </Formik>
      <h1 className="text-white">
        {" "}
        <Link to={deploymentUrl}>{deploymentUrl}</Link>
      </h1>
      <ul>
        {logs && logs.map((log, ind) => (
          <li key={ind} className="text-white">
             {JSON.parse(log.log).log+" "+log.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CreateProject;
