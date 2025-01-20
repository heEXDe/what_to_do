import { useState, useMemo } from "react";
import { createContext } from "react";
import { useContext } from "react";
import { useEffect, useReducer } from "react";
import { StepProvider, StepList } from "./Subtask.js";
import Button from "./Btn.js";

function Task({ id }) {
  const {
    state: { expandedId },
  } = useTask();
  const isExpanded = expandedId === id;

  const [isEditable, setEditable] = useState(false);

  const cardId = useMemo(() => `card-${Math.random()}`, []);
  const titleId = useMemo(() => `title-${Math.random()}`, []);

  return (
    <li className="card" id={cardId} aria-labelledby={titleId}>
      
      <TaskHeader
        id={id}
        isEditable={isEditable}
        setEditable={setEditable}
        cardId={cardId}
        titleId={titleId}
      />
      {isExpanded && (
        <>
          <TaskControls
            id={id}
            isEditable={isEditable}
            setEditable={setEditable}
          />
          <StepProvider taskId={id}>
            <StepList />
          </StepProvider>
        </>
      )}
    </li>
  );
}

const TaskContext = createContext({ state: {}, actions: {} });

const initialState = [
    {
      id: 1,
      title: "Your first task",
      steps: [
        { step: "subtask 1", completed: true },
        { step: "subtask 2", completed: true },
        { step: "subtask 3", completed: true },
        { step: "subtask 4", completed: false },
      ],
    },
  ];
  
  function TaskAdd() {
    const {
      actions: { addTask },
    } = useTask();
  
    const handleAddTask = (evt) => {
      evt.preventDefault();
      addTask(evt.target.title.value);
      evt.target.reset();
    };
  
    return (
      <li className="card">
        <header className="card-header card-header-new">
          <form className="card-title-form" onSubmit={handleAddTask}>
            <input
              className="card-title card-title-input"
              placeholder="Add new task"
              name="title"
            />
            <Button icon="plus" label="Add task" />
          </form>
        </header>
      </li>
    );
  }

  function TaskControls({ id, isEditable, setEditable }) {
    const {
      actions: { deleteTask },
    } = useTask();
  
    return (
      <ul className="card-controls">
        {!isEditable && (
          <li>
            <button className="card-control" onClick={() => setEditable(true)}>
              Edit
            </button>
          </li>
        )}
        <li>
          <button className="card-control" onClick={() => deleteTask(id)}>
            Delete
          </button>
        </li>
      </ul>
    );
  }

  function TaskHeader({ id, isEditable, setEditable, titleId, cardId }) {
    const {
      state: { tasks, expandedId },
      actions: { toggleExpand, editTask },
    } = useTask();
    const task = tasks.find((task) => task.id === id);
    const isExpanded = expandedId === id;
  
    const { title, steps } = task;
  
    const stepsTotal = steps.length;
    const stepsCompleted = steps.filter(({ completed }) => completed).length;
    const stepsCompletion = Math.round((100 * stepsCompleted) / stepsTotal);
  
    const handleEditTask = (evt) => {
      evt.preventDefault();
      editTask({ taskId: id, title: evt.target.title.value });
      setEditable(false);
    };
  
    if (isEditable) {
      return (
        <header className="card-header">
          <span
            className={`icon-button card-expand ${
              isExpanded ? "card-expanded" : ""
            } `}
          >
            <img src="icons/caret.svg" alt="Edit" />
          </span>
          <form className="card-title-form" onSubmit={handleEditTask}>
            <input
              id={titleId}
              className="card-title card-title-input"
              defaultValue={title}
              name="title"
            />
            <button className="icon-button">
              <img src="icons/check.svg" alt="Edit step" />
            </button>
          </form>
          <p className="card-percentage">
            {!isNaN(stepsCompletion) && `${stepsCompletion}%`}
          </p>
        </header>
      );
    }
  
    return (
      <button
        className="card-header"
        onClick={() => toggleExpand(id)}
        aria-expanded={isExpanded}
        aria-labelledby={titleId}
        aria-controls={cardId}
      >
        <span
          className={`icon-button card-expand ${
            isExpanded ? "card-expanded" : ""
          }`}
        >
          <img src="icons/caret.svg" alt="Collapse/Expand" />
        </span>
        <p className="card-title" id={titleId}>
          {title}
        </p>
        <p className="card-percentage">
          {!isNaN(stepsCompletion) && `${stepsCompletion}%`}
        </p>
      </button>
    );
  }
  
  function TaskList() {
    const {
      state: { tasks },
    } = useTask();
    const taskIds = tasks.map(({ id }) => id);
  
    return (
      <ol className="lane">
        {taskIds.map((taskId) => (
          <Task key={taskId} id={taskId} />
        ))}
        <TaskAdd />
      </ol>
    );
  }
/*
function TaskProgress({ id }) {
  const {
    state: { tasks },
  } = useTask();
  const steps = tasks.find((task) => task.id === id).steps;

  const stepsTotal = steps.length;
  const stepsCompleted = steps.filter(({ completed }) => completed).length;

  return (
    <progress
      className="progress-bar"
      max={stepsTotal}
      value={stepsCompleted}
    />
  );
}
*/

function TaskProvider({ children }) {
  const value = useTaskReducer();
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

function useTask() {
  return useContext(TaskContext);
}

function reducer(state, { type, payload }) {
  switch (type) {
    case "TOGGLE":
      return {
        ...state,
        expandedId: state.expandedId === payload ? null : payload,
      };
    case "ADD_TASK":
      return {
        ...state,
        tasks: state.tasks.concat([
          { id: Math.random() * 1000000, title: payload, steps: [] },
        ]),
      };
    case "EDIT_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id !== payload.taskId) {
            return task;
          }
          return { ...task, title: payload.title };
        }),
      };
    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== payload),
      };
    case "CHECK_STEP":
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id !== payload.taskId) {
            return task;
          }
          return {
            ...task,
            steps: [
              ...task.steps.slice(0, payload.step),
              {
                ...task.steps[payload.step],
                completed: !task.steps[payload.step].completed,
              },
              ...task.steps.slice(payload.step + 1),
            ],
          };
        }),
      };
    case "EDIT_STEP":
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id !== payload.taskId) {
            return task;
          }
          return {
            ...task,
            steps: [
              ...task.steps.slice(0, payload.step),
              {
                ...task.steps[payload.step],
                step: payload.text,
              },
              ...task.steps.slice(payload.step + 1),
            ],
          };
        }),
      };
    case "DELETE_STEP":
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id !== payload.taskId) {
            return task;
          }
          return {
            ...task,
            steps: [
              ...task.steps.slice(0, payload.step),
              ...task.steps.slice(payload.step + 1),
            ],
          };
        }),
      };
    case "ADD_STEP":
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id !== payload.taskId) {
            return task;
          }
          return {
            ...task,
            steps: task.steps.concat([
              { step: payload.step, completed: false },
            ]),
          };
        }),
      };
    case "MOVE_TO":
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id !== payload.taskId) {
            return task;
          }
          const newSteps = task.steps.concat();
          const item = task.steps[payload.step];
          if (payload.position > payload.step) {
            newSteps.splice(payload.position, 0, item);
            newSteps.splice(payload.step, 1);
          } else {
            newSteps.splice(payload.step, 1);
            newSteps.splice(payload.position, 0, item);
          }
          return {
            ...task,
            steps: newSteps,
          };
        }),
      };
    case "MOVE_UP":
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id !== payload.taskId || payload.step === 0) {
            return task;
          }
          const newSteps = task.steps.concat();
          const temp = newSteps[payload.step];
          newSteps[payload.step] = newSteps[payload.step - 1];
          newSteps[payload.step - 1] = temp;
          return {
            ...task,
            steps: newSteps,
          };
        }),
      };
    case "MOVE_DOWN":
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (
            task.id !== payload.taskId ||
            payload.step === task.steps.length - 1
          ) {
            return task;
          }
          const newSteps = task.steps.concat();
          const temp = newSteps[payload.step];
          newSteps[payload.step] = newSteps[payload.step + 1];
          newSteps[payload.step + 1] = temp;
          return {
            ...task,
            steps: newSteps,
          };
        }),
      };
    default:
      return state;
  }
}

function getInitialState() {
  const tasks =
    JSON.parse(localStorage.getItem("task-manager-items-dragging")) ||
    initialState;
  return {
    expandedId: null,
    tasks,
  };
}

function useTaskReducer() {
  const [state, dispatch] = useReducer(reducer, null, getInitialState);

  useEffect(() => {
    localStorage.setItem(
      "task-manager-items-dragging",
      JSON.stringify(state.tasks)
    );
  }, [state.tasks]);

  const toggleExpand = (payload) => dispatch({ type: "TOGGLE", payload });
  const addTask = (payload) => dispatch({ type: "ADD_TASK", payload });
  const editTask = (payload) => dispatch({ type: "EDIT_TASK", payload });
  const deleteTask = (payload) => dispatch({ type: "DELETE_TASK", payload });
  const checkStep = (payload) => dispatch({ type: "CHECK_STEP", payload });
  const editStep = (payload) => dispatch({ type: "EDIT_STEP", payload });
  const deleteStep = (payload) => dispatch({ type: "DELETE_STEP", payload });
  const addStep = (payload) => dispatch({ type: "ADD_STEP", payload });
  const moveStepTo = (payload) => dispatch({ type: "MOVE_TO", payload });
  const moveStepUp = (payload) => dispatch({ type: "MOVE_UP", payload });
  const moveStepDown = (payload) => dispatch({ type: "MOVE_DOWN", payload });

  return {
    state,
    actions: {
      toggleExpand,
      addTask,
      editTask,
      deleteTask,
      checkStep,
      editStep,
      deleteStep,
      addStep,
      moveStepTo,
      moveStepUp,
      moveStepDown,
    },
  };
}

export { TaskProvider, TaskList, useTask };
