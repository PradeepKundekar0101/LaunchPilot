import { Link } from "react-router-dom";
import { NavigationMenuDemo } from "./components/ui/navbar";
import { FaGithub } from "react-icons/fa";
const App = () => {
  return (
    <section>
      <NavigationMenuDemo />
      <div className=" h-[80vh] absolute top-[50px] inline-flex  inset-0 justify-center">
        <div className="absolute top-[50px] inline-flex  inset-0 justify-center">
          <div className="bg-shape1  opacity-50 bg-blur"></div>
          {/* <div className="bg-shape2 bg-blue-400 opacity-50 bg-blur"></div>
          <div className="bg-shape1 bg-purple-400 opacity-50 bg-blur"></div> */}
        </div>
        <div className=" flex flex-col items-center justify-center">
          <h1 className="text-8xl font-bold  text-center hero-heading" >Launch Pilot </h1> 
          <h1 className="text-3xl  text-center" >Deploy your react application with ease </h1>
          <Link className="flex items-center bg-black p-2 rounded-md w-fit" to="https://github.com/PradeepKundekar0101/launchpilot"><FaGithub/>Star me on Github</Link>
        </div>
      </div>
    </section>
  );
};

export default App;
