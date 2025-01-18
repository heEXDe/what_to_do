import { memo, Fragment } from "react";
import { createContext } from "react";
import Button from "./Btn";
import { useState } from "react";
import {useTask} from "./Task02";
import { useContext } from "react";

function Step({ index }) {
  const {
    state: { editingStep, dragging },
    actions: { startDrag },
  } = useStep();
  const isEditing = editingStep === index;
  const isDragging = dragging === index;

  const handleDragStart = (evt) => {
    evt.dataTransfer.dropEffect = "move";
    startDrag(index);
  };

  if (isDragging) {
    return <li className="step step-dragged" />;
  }

  return (
    <li draggable={!isEditing} className="step" onDragStart={handleDragStart}>
      {isEditing ? (
        <StepEdit index={index} />
      ) : (
        <>
          <Button
            as="span"
            className="step-button step-handle"
            icon="drag"
            label="Move"
          />
          <StepCheckbox index={index} />
          <StepControls index={index} />
        </>
      )}
    </li>
  );
}

const StepContext = createContext({ state: {}, actions: {} });

function StepAdd() {
  const {
    actions: { add },
  } = useStep();

  const handleAddStep = (evt) => {
    evt.preventDefault();
    add(evt.target.step.value);
    evt.target.reset();
  };

  return (
    <li className="step add-step">
      <form className="step-form" onSubmit={handleAddStep}>
        <input className="step-input" placeholder="Add new step" name="step" />
        <Button className="step-button" icon="plus" label="Add new step" />
      </form>
    </li>
  );
}

function StepCheckbox({ index }) {
  const {
    state: { steps },
    actions: { check },
  } = useStep();
  const { step, completed } = steps[index];

  return (
    <label className="step-label">
      <input
        type="checkbox"
        checked={completed}
        onChange={() => check(index)}
      />
      {completed ? <s>{step}</s> : step}
    </label>
  );
}

function StepButton(props) {
  return <Button className="step-button" {...props} />;
}

function StepControls({ index }) {
  const {
    actions: { moveUp, moveDown, remove, setEditingStep },
  } = useStep();

  return (
    <>
      <StepButton
        icon="pencil"
        label="Edit"
        onClick={() => setEditingStep(index)}
      />
      <StepButton icon="trash" label="Delete" onClick={() => remove(index)} />
      <StepButton icon="up" label="Move up" onClick={() => moveUp(index)} />
      <StepButton
        icon="down"
        label="Move down"
        onClick={() => moveDown(index)}
      />
    </>
  );
}

function StepDroppable({ id, position }) {
  const {
    actions: { moveTo },
  } = useStep();

  const handleDragLeave = (evt) => {
    evt.preventDefault();
    evt.target.classList.remove("step-droppable-hover");
  };

  const handleDragEnter = (evt) => {
    evt.preventDefault();
    evt.target.classList.add("step-droppable-hover");
  };

  const handleDragOver = (evt) => evt.preventDefault();

  const handleDrop = (evt) => {
    evt.preventDefault();
    moveTo(position);
  };

  return (
    <li
      className="step step-droppable"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    />
  );
}

function StepEdit({ index }) {
  const {
    state: { steps },
    actions: { edit },
  } = useStep();
  const oldText = steps[index].step;

  const handleEditStep = (evt) => {
    evt.preventDefault();
    edit(index, evt.target.step.value);
  };

  return (
    <form className="step-form" onSubmit={handleEditStep}>
      <input
        className="step-input"
        placeholder="Edit step"
        defaultValue={oldText}
        name="step"
      />
      <Button className="step-button" icon="check" label="Edit step" />
    </form>
  );
}

function StepList() {
  const {
    state: { dragging, steps },
  } = useStep();
  const stepNames = steps.map(({ step }) => step);
  const isDragging = dragging !== null;

  return (
    <section className="progress">
      <ol className="progress-steps">
        {isDragging && <StepDroppable position={0} />}
        {stepNames.map((step, index) => (
          <Fragment key={step}>
            <Step index={index} />
            {isDragging && <StepDroppable position={index + 1} />}
          </Fragment>
        ))}
        <StepAdd />
      </ol>
    </section>
  );
}

function StepProvider({ taskId, children }) {
  const {
    state: { tasks },
    actions: {
      editStep,
      checkStep,
      addStep,
      deleteStep,
      moveStepTo,
      moveStepUp,
      moveStepDown,
    },
  } = useTask();
  const steps = tasks.find((task) => task.id === taskId).steps;

  const [editingStep, setEditingStep] = useState(null);
  const [dragging, setDragging] = useState(null);

  const startDrag = (index) => {
    setTimeout(() => {
      setDragging(index);
      setEditingStep(null);
    });
  };

  const edit = (step, text) => {
    editStep({ taskId, step, text });
    setEditingStep(null);
  };
  const check = (step) => checkStep({ taskId, step });
  const add = (step) => addStep({ taskId, step });
  const remove = (step) => deleteStep({ taskId, step });
  const moveTo = (position) => {
    moveStepTo({ taskId, step: dragging, position });
    setDragging(null);
  };
  const moveUp = (step) => moveStepUp({ taskId, step });
  const moveDown = (step) => moveStepDown({ taskId, step });

  const value = {
    state: {
      steps,
      editingStep,
      dragging,
    },
    actions: {
      startDrag,
      setEditingStep,
      check,
      add,
      edit,
      remove,
      moveTo,
      moveUp,
      moveDown,
    },
  };
  return <StepContext.Provider value={value}>{children}</StepContext.Provider>;
}

function useStep() {
  return useContext(StepContext);
}

export { StepProvider, StepList };
