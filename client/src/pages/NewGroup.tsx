import React, { useState, useEffect } from "react";
import "react-dropdown/style.css";

const NewGroup: React.FC = () => {
  const [price, setPrice] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [inputValue, setInputValue] = useState(""); // State for input box

  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!price || !category) {
      setErrorMessage("Please fill out both the name and description fields.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
  
    try {
      setSuccessMessage(true);
      setCategory("");
      setPrice("");
      setTimeout(() => setSuccessMessage(false), 3000);
    } catch (error) {
      setErrorMessage("An error occurred while submitting the expense.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  // Handle key press for numeric input
  const keyPressHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = event;
    setPrice((prevValue) =>
      key !== "Backspace"
        ? !Number.isNaN(parseInt(key)) || key === "," || key === "."
          ? prevValue + key
          : prevValue
        : prevValue.substring(0, prevValue.length - 1)
    );
  };

  const [isChecked, setIsChecked] = useState(false);

  const toggleSwitch = () => {
    setIsChecked(!isChecked);
  };
  const [items, setItems] = useState(["Item 1", "Item 2", "Item 3"]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: string) => {
    e.dataTransfer.setData("text/plain", item); // Store dragged item text
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const draggedItem = e.dataTransfer.getData("text/plain");
    setInputValue(draggedItem); // Set input value to dragged item text
  };
  

  return (
    <>
      {/* Success Popup */}
      {successMessage && (
        <>
          <div
            className="success-popup"
            style={{
              backgroundColor: "green",
              color: "white",
              padding: "10px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            Successfully submitted!
          </div>
          <br />
        </>
      )}

      {errorMessage && (
        <div
          className="error-popup"
          style={{
            backgroundColor: "red",
            color: "white",
            padding: "10px",
            borderRadius: "8px",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{  width: "96%", display: "flex", justifyContent: "space-between", margin: "auto", paddingTop: "6%"}}>
          <div style={{ fontSize: "130%", fontWeight: "600"}}>Name</div>
          <input
            name="amount"
            onKeyDown={keyPressHandler}
            value={price !== "" ? price : ""}
            style={{width: "80%", borderWidth: "2px", lineHeight: "20px"}}
          />
        </div>
        <div style={{width: "96%", paddingLeft: "2%", marginTop: "3%"}}>
            <div style={{ fontSize: "130%", fontWeight: "600" }}>Description</div>
            <input
                name="amount"
                onKeyDown={keyPressHandler}
                value={price !== "" ? price : ""}
                style={{width: "100%", borderWidth: "2px", lineHeight: "20px", marginTop: "1%"}}
            />
          </div>
          <div style={{ width: "96%", display: "flex", justifyContent: "space-between", margin: "auto", paddingTop: "3%" }}>
            <div style={{ fontSize: "130%", fontWeight: "600" }}>Owner: Ana (You)</div>
            <div style={{ display: "flex", alignItems: "center" }}>
                Closed: 
                <label
                    style={{
                        position: "relative",
                        display: "inline-block",
                        width: "60px",
                        height: "34px",
                        marginLeft: "8px", // Adds spacing between text and switch
                    }}
                >
                    <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={toggleSwitch}
                        style={{
                            opacity: 0,
                            width: 0,
                            height: 0,
                        }}
                    />
                    <span
                        style={{
                            position: "absolute",
                            cursor: "pointer",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: isChecked ? "#2196F3" : "#ccc",
                            transition: ".4s",
                            borderRadius: "34px",
                        }}
                    >
                        <span
                            style={{
                                position: "absolute",
                                height: "26px",
                                width: "26px",
                                left: "4px",
                                bottom: "4px",
                                backgroundColor: "white",
                                transition: ".4s",
                                borderRadius: "50%",
                                transform: isChecked ? "translateX(26px)" : "translateX(0)",
                            }}
                        />
                    </span>
                </label>
            </div>
        </div>
        <div style={{ fontSize: "130%", fontWeight: "600", width: "96%", margin: "auto", marginTop: "2%"}}>Drag and drop participants: </div>
        <div style={{ display: "flex", width: "96%", margin: "auto", marginTop: "3%", justifyContent: "space-between"}}> 
          <div  style={{ display: "block", width: "40%"}}> 
          {/* Draggable Items */}
          {items.map((item, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              style={{
                padding: "10px",
                margin: "5px",
                backgroundColor: "lightblue",
                cursor: "grab",
              }}
            >
              {item}
            </div>
          ))}
          </div>   
          <br />
          <div style={{display: "block"}}>
          <div style={{paddingLeft: "30%"}}>
          This Group
          </div>
          {/* Input Box (Drop Target) */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)} // Allows manual input
            onDragOver={(e) => e.preventDefault()} // Allow drop
            onDrop={handleDrop} // Handle drop
            style={{
              padding: "10px",
              width: "200px",
              fontSize: "16px",
              lineHeight: "5"
            }}
            placeholder="Drop here"
          />
        </div>
        </div>
        <div style={{display: "flex", width: "90%", marginLeft: "5%", marginRight: "5%", marginTop: "2%"}}>
        <button type="submit" color="primary" className="button" style={{flex: "1"}} >Confirm</button>
        <button type="submit" color="primary" className="button" style={{flex: "1"}}>Cancel</button>
        <button type="submit" color="primary" className="button" style={{flex: "1"}}>Delete</button>
        </div>
      </form>
      <h1>asd</h1>
    </>
  );
};
export default NewGroup; 