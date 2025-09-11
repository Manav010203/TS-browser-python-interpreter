import { useState,useEffect, useRef } from 'react'

// import './App.css'
import { loadPyodide } from "pyodide";


import CodeMirror from 'codemirror'

import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";


// import "codemirror/mode/python/python";


declare global{
  interface Window{
    loadPyodide:any
  }
}
export default function App() {
  // const [count, setCount] = useState(0)
  
  const editorRef = useRef<HTMLDivElement>(null)

  const [pyodide,setPyodide] = useState<any>(null)

  const [userInput,setUserInput] = useState("")

  const [output,setOutput]= useState("waiting for code...")

  const [editor,setEditor] = useState<CodeMirror.Editor | null>(null)
  const [isLoading,setIsLoading] = useState(true);

//load pyodide
//   useEffect(()=>{
//     // let editor = CodeMirror(document.body)
//     const intialize = async()=>{
//       try {
//         const py =  loadPyodide();
//     setPyodide(py)

//     if(editorRef.current && !editor){
//       const cm = CodeMirror(editorRef.current,{
//         value:"name = input('What is your name? ')\nprint('Hello,', name)",
//         mode:"python",
//         theme:"dracula",
//         lineNumbers:true
//       });
//       setEditor(cm);
//     }
//     setOutput("Pyhton interperter is ready! Enter your code!");
//     setIsLoading(false);
//     }
//      catch (error){
//       console.error("Failed to intialize:",error);
//       setOutput("ERROR: failed to intialize the appilcation pls check your internet connection");
//       setIsLoading(false);
//      } 
//   };
// intialize();
//   },[]);
useEffect(() => {
  const initialize = async () => {
    try {
      const py = await loadPyodide({          // ✅ await here
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.28.2/full/"
      });
      setPyodide(py);                         // py is the interpreter now

      if (editorRef.current && !editor) {
        const cm = CodeMirror(editorRef.current, {
          value: "name = input('What is your name? ')\nprint('Hello,', name)",
          mode: "python",
          theme: "dracula",
          lineNumbers: true,
        });
        setEditor(cm);
      }

      setOutput("Python interpreter is ready! Enter your code!");
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to initialize:", error);
      setOutput("ERROR: failed to initialize the application.");
      setIsLoading(false);
    }
  };

  initialize();
}, []);


  const runCode = async () => {
  if (!pyodide || !editor){
    setOutput("INterpreter not ready. PLease wait.");
    return;
  }


  const code = editor.getValue();
  let accumaltedoutput = "";
  setOutput("");

  // Override print for this run
  pyodide.globals.set("print", (...args:any) => {
    accumaltedoutput+= args.join(" ") + "\n";
  });

  pyodide.globals.set("input", (prompt = "") => {
    if(prompt){
      accumaltedoutput+=prompt;
    }
    return userInput;
  });

  try {
      await pyodide.runPythonAsync(code);
      setOutput(accumaltedoutput);
    } catch (err) {
      setOutput(`Error: ${err}`);
    }
};

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center py-8">
      <h1 className="text-2xl font-bold mb-6">
        🐍 Python Runner (Pyodide + TS + Tailwind)
      </h1>

      <div className="w-full max-w-2xl space-y-4">
        {/* Editor */}
        <div
          ref={editorRef}
          className="border rounded-lg shadow bg-white min-h-[200px]"
        />

        {/* Input field */}
        <input
          type="text"
          placeholder="Enter your input here"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Run button */}
        <button
          onClick={runCode}
          disabled={isLoading}
          className={`px-6 py-2 font-semibold rounded-lg shadow-md transition ${
              isLoading
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            }`}
        >
          {isLoading ? "Loading..." :"▶ Run Code" }
          
        </button>

        {/* Output */}
        <pre className="bg-black text-green-400 p-4 rounded-lg shadow min-h-[150px] overflow-auto whitespace-pre-wrap">
          {output}
        </pre>
      </div>
    </div>
    );
  }  