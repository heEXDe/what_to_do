import "./style.css";
import { TaskProvider, TaskList } from "./Task02";

function App() {
  return (
    <main>
      <h1>What to do ...</h1>
      <h3>(your handy to-do list)</h3>
      <TaskProvider>
        <TaskList />
      </TaskProvider>
    </main>
  );
}

export default App;
