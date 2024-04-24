import { NavigationMenuDemo } from "./components/ui/navbar";
const App = () => {
  return (
    <section>
      <NavigationMenuDemo />
      <div className=" h-screen absolute top-[50px] inline-flex  inset-0 justify-center">
        <div className="absolute top-[50px] inline-flex  inset-0 justify-center">
          <div className="bg-shape1  opacity-50 bg-blur"></div>
          {/* <div className="bg-shape2 bg-blue-400 opacity-50 bg-blur"></div>
          <div className="bg-shape1 bg-purple-400 opacity-50 bg-blur"></div> */}
        </div>
        <div>
          <h1 className="text-xl  text-center" >Launch Pilot </h1>
          <h1 className="text-xl  text-center" >Launch Pilot </h1>
        </div>
      </div>
    </section>
  );
};

export default App;
