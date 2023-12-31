import React, { useState, useContext, ChangeEvent } from "react";
import CenterSystemContext from "../../context/context";
import { CreateTaskDto } from "../../DTOS/createTask.dto";
import axios from "axios";
import { appendToUrl } from "../../consts/consts";

function CreateTask() {
  const [taskDescription, setTaskDescription] = useState("");
  const [errorText, setErrorText] = useState("Add description to your task");
  const [showResponseText, setShowResponseText] = useState(false);
  const [responseText, setResponseText] = useState("");

  const context = useContext(CenterSystemContext);
  const { user } = context;

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setTaskDescription(event.target.value);
    setErrorText("Add description to your task");
  };

  const getResponseText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Your task is in the front";
      case "doing":
        return "Your task is being processed";
      default:
        return "Your task is not in the front nor being processed";
    }
  };

  const createTask = async () => {
    if (taskDescription.length === 0) {
      setErrorText("Please fill out description");
      return;
    }

    try {
      if (user) {
        const newTaskDto = new CreateTaskDto(taskDescription, user.id);
        const response = await axios.post(
          appendToUrl("task/create-task"),
          newTaskDto
        );

        if (response.status === 200) {
          setShowResponseText(true);
          setResponseText(getResponseText(response.data.status));
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Server responded with an error:", error.response?.data);
        setErrorText(error.response?.data?.message || "An error occurred");
      } else {
        console.error("An unknown error occurred:", error);
        setErrorText("An unknown error occurred");
      }
    }
  };

  return (
    <div>
      <div>
        <label
          htmlFor="comment"
          className={`block text-sm font-medium leading-6 ${
            errorText !== "Add description to your task"
              ? "text-red-500 text-xl"
              : "text-gray-900"
          }`}
        >
          {errorText}
        </label>
        <div className="mt-2">
          <textarea
            rows={4}
            name="comment"
            id="comment"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 resize-none"
            value={taskDescription}
            onChange={handleDescriptionChange}
          />
        </div>
      </div>

      {!showResponseText && (
        <button
          onClick={createTask}
          type="button"
          className="rounded-md my-5 bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Create task
        </button>
      )}

      {showResponseText && (
        <div>
          <p className="text-2xl font-bold">{responseText}</p>
        </div>
      )}
    </div>
  );
}

export default CreateTask;
