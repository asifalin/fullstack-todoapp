"use client"
import { useState, useEffect } from "react";

export default function Home() {
  const [task, setTask] = useState("");
  const [todos, setTodos] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [image, setImage] = useState<string | null>(null); 
  const [imageLink, setImageLink] = useState("");

  // ✅ Fetch todos
  const fetchTodos = () => {
    fetch("http://localhost:3001/todos")
      .then(res => res.json())
      .then(data => setTodos(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // ✅ Convert file to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string); 
    };
    reader.readAsDataURL(file);
  };

  // ✅ Add or Update todo
  const handleSubmit = () => {
    if (!task) return;

    if (editingId) {
      // 👉 Update existing
      const todo = todos.find(t => t.id === editingId);
      if (!todo) return;

      fetch(`http://localhost:3001/todos/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          task: task,
          completed: todo.completed,
          image: imageLink || image || todo.image
        })
      }).then(() => {
        resetForm();
        fetchTodos();
      });

    } else {
      // 👉 Add new
      fetch("http://localhost:3001/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Date.now(),
          task: task,
          completed: false,
          image: imageLink || image
        })
      }).then(() => {
        resetForm();
        fetchTodos();
      });
    }
  };

  // ✅ Delete todo
  const handleDelete = (id: number) => {
    fetch(`http://localhost:3001/todos/${id}`, { method: "DELETE" })
      .then(() => fetchTodos());
  };

  // ✅ Toggle completed
  const handleToggle = (id: number) => {
    fetch(`http://localhost:3001/todos/${id}/toggle`, { method: "PUT" })
      .then(() => fetchTodos());
  };

  // ✅ Start editing
  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setTask(t.task);
    setImage(t.image || null);
    setImageLink(t.image || "");
  };

  // ✅ Search / Filter todos
  const handlefilter = (e: any) => {
    const search = e.target.value;
    if (search.trim() === "") {
      // agar input empty ho to sab todos wapas le aao
      fetch("http://localhost:3001/todos")
        .then(res => res.json())
        .then(data => setTodos(Array.isArray(data) ? data : []));
      return;
    }

    fetch(`http://localhost:3001/todos/search/${search}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTodos(data);
        } else {
          setTodos([]);  // agar galti se object aya
        }
      });
  }; // 🔴 yaha closing bracket zaroori tha

  // ✅ Reset form after add/update
  const resetForm = () => {
    setTask("");
    setImage(null);
    setImageLink("");
    setEditingId(null);
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen  text-white">
      <h1 className="text-3xl font-bold mb-4 text-center">My Fullstack Todo App</h1>
      {/* 🔹 Add / Edit Form */}
      <div className="flex flex-col space-y-2 mb-4 border p-4 rounded">
        <div className="flex space-x-3"> 
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            type="text"
            placeholder="Enter todo..."
            className="border border-gray-300 rounded p-2"
          />

          <input
            value={imageLink}
            onChange={(e) => setImageLink(e.target.value)}
            type="text"
            placeholder="Image link (optional)"
            className="border border-gray-300 rounded p-2"
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="border border-gray-300 p-1"
          />
        </div>

        {/* Preview selected image */}
        {(imageLink || image) && (
          <img
            src={imageLink || image || ""}
            alt="preview"
            className="w-52 h-52 object-cover rounded"
          />
        )}

        <div className="flex space-x-2">
          <button
            onClick={handleSubmit}
            className={`${
              editingId ? "bg-blue-500" : "bg-blue-500"
            } text-white px-4 py-2 rounded`}
          >
            {editingId ? "Update Todo" : "Add Todo"}
          </button>
          {editingId && (
            <button
              onClick={resetForm}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* 🔹 Filter */}
      <div className="mx-auto mb-4">
        <h1 className="text-2xl mb-4">Todo List filter</h1>
        <input
          onChange={handlefilter}
          type="text"
          placeholder="Search todos..."
          className="border border-gray-300 rounded p-2  "
        />
      </div>

      {/* 🔹 Todo list */}
      <ul className="space-y-2">
        {todos.map((t) => (
          <li
            key={t.id}
            className="flex justify-between items-center border p-2 rounded"
          >
            <div className="flex items-center space-x-3 flex-1">
              {t.image && (
                <img
                  src={t.image}
                  alt="todo"
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <span
                onClick={() => handleToggle(t.id)}
                className={`cursor-pointer flex-1 ${
                  t.completed ? "line-through text-gray-500" : ""
                }`}
              >
                {t.task}
              </span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(t)}
                className="bg-yellow-500 text-white px-2 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                className="bg-red-500 text-white px-2 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
