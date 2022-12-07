import React, { useEffect, useRef, useState, useContext } from "react";
import { DRAG_DATA_KEY, SHAPE_TYPES } from "./constants";
import { v4 as uuidv4 } from "uuid";
import Arrow from "./Arrow";
import context from "./context/context";

const handleDragOver = (event) => event.preventDefault();

const Canva = () => {
  const stageRef = useRef();
  const [arr, setArr] = useState([]);
  let a = useRef([]);

  const arrow = useContext(context);

  const pushArrow = (e, item, position) => {
    arrow.setArrows([
      ...arrow.arrows,
      {
        UUID: uuidv4(),
        featureAPosition: {
          x:
            position === "top"
              ? item.x + 75 - 9
              : position === "right"
              ? item.x + 150 - 12
              : position === "bottom"
              ? item.x + 75 - 9
              : item.x - 8,
          y:
            position === "top"
              ? item.y + 2
              : position === "right"
              ? item.y + 50
              : position === "bottom"
              ? item.y + 100 - 2
              : item.y + 50,
        },
        featureBPosition: {
          x:
            position === "top"
              ? item.x + 75 + 6
              : position === "right"
              ? item.x + 150 + 150
              : position === "bottom"
              ? item.x + 75 + 6
              : item.x - 100,
          y:
            position === "top"
              ? item.y - 100
              : position === "right"
              ? item.y + 50 + 3
              : position === "bottom"
              ? item.y + 100 + 100
              : item.y + 50 + 3,
        },
        Selected: false,
      },
    ]);
  };

  // useEffect(() => {
  //   fetch("http://localhost:5000/").then(async (res) => {
  //     const data = await res.json();
  //     if (data.data.arrows) {
  //       arrow.setArrows([...data.data.arrows]);
  //     }
  //     if (data.data.data) {
  //       setArr(data.data.data);
  //     }
  //   });
  // }, []);

  const [show, setShow] = useState(true);
  let fx = useRef(0);
  let fy = useRef(0);
  const handleDrop = (event) => {
    setShow(!show);
    const draggedData = event.nativeEvent.dataTransfer.getData(DRAG_DATA_KEY);
    if (draggedData) {
      const { offsetX, offsetY, type } = JSON.parse(draggedData);
      stageRef.current = {
        x: event.nativeEvent.offsetX,
        y: event.nativeEvent.offsetY,
      };

      if (type === SHAPE_TYPES.RECT) {
        setArr([
          ...arr,
          {
            x: stageRef.current.x - offsetX - 1,
            y: stageRef.current.y - offsetY - 3,
            SHAPE: SHAPE_TYPES.RECT,
            UUID: uuidv4(),
            Selected: false,
            STRING: "",
            Height: 100,
            width: 150,
            InputHeight: 88,
          },
        ]);
      } else if (type === SHAPE_TYPES.CIRCLE) {
        setArr([
          ...arr,
          {
            x: stageRef.current.x - offsetX - 1,
            y: stageRef.current.y - offsetY - 3,
            SHAPE: SHAPE_TYPES.CIRCLE,
            UUID: uuidv4(),
            Selected: false,
            STRING: "",
            Height: 100,
            width: 150,
            InputHeight: 88,
          },
        ]);
      }
    }
  };

  const handleDragStart = (event, Item) => {
    const type = event.target.dataset.shape;
    if (type) {
      const offsetX = event.nativeEvent.offsetX;
      const offsetY = event.nativeEvent.offsetY;
      fx.current = offsetX;
      fy.current = offsetY;
    }
    arr
      .filter((item) => item.UUID !== Item.UUID)
      .map((items) => {
        items.Selected = false;
        return null;
      });
  };

  const onDrag = (event, item) => {
    item.Selected = true;
    item.x = event.clientX - "174" - fx.current;
    item.y = event.clientY - fy.current;
  };

  const handleReset = () => {
    setArr([]);
    arrow.setArrows([]);
    setShow(!show);
    fetch("http://localhost:5000/reset", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [],
      }),
    });
  };

  const handleSave = () => {
    fetch("http://localhost:5000/save-data", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: arr,
        arrows: arrow.arrows,
      }),
    });
  };

  const selected = (Item) => {
    Item.Selected = !Item.Selected;
    arr
      .filter((item) => item.UUID !== Item.UUID)
      .map((items) => {
        items.Selected = false;
        return null;
      });
    setShow(!show);
    setShow(!show);
  };

  let bArrow = useRef([]);
  useEffect(() => {
    a.current = arr;
    bArrow.current = arrow.arrows;
  }, [arr, arrow.arrows]);

  useEffect(() => {
    const onDelete = (key) => {
      if (key === "Delete") {
        setArr(a.current.filter((item) => item.Selected !== true));
        arrow.setArrows([
          ...bArrow.current.filter((item) => item.Selected !== true),
        ]);
      }
    };
    window.addEventListener("keyup", (e) => onDelete(e.key), false);
    return () => {
      window.removeEventListener("keyup", (e) => onDelete(e.key));
    };
  }, []);

  const updateString = (e, Item) => {
    setArr(
      arr.map((item) =>
        item.UUID === Item.UUID ? { ...item, STRING: e.target.value } : item
      )
    );
  };

  const [initial, setInitial] = useState({
    active: false,
    offset: { x: 0, y: 0 },
  });
  const pointerDown = (e) => {
    const el = e.target;
    const bbox = e.target.getBoundingClientRect();
    const x = e.clientX - bbox.left;
    const y = e.clientY - bbox.top;
    el.setPointerCapture(e.pointerId);
    setInitial({
      ...initial,
      active: true,
      offset: { x: x, y: y },
    });
  };
  const pointerMove = (e, item) => {
    const shape = e.target.dataset.shape;
    const bbox = e.target.getBoundingClientRect();
    const x = e.clientX - bbox.left;
    const y = e.clientY - bbox.top;
    if (initial.active && shape === "top") {
      item.y = item.y + y - initial.offset.y;
      item.Height = item.Height - (y - initial.offset.y);
      setInitial({
        ...initial,
      });
    } else if (initial.active && shape === "right") {
      item.width = item.width + (x - initial.offset.x);
      setInitial({
        ...initial,
      });
    } else if (initial.active && shape === "bottom") {
      item.Height = item.Height + (y - initial.offset.y);
      setInitial({
        ...initial,
      });
    } else if (initial.active && shape === "left") {
      item.x = item.x + (x - initial.offset.x);
      item.width = item.width - (x - initial.offset.x);
      setInitial({
        ...initial,
      });
    }
  };
  const pointerUp = (event) => {
    setInitial({
      ...initial,
      active: false,
    });
  };

  return (
    <>
      <button
        onClick={handleSave}
        style={{ height: "21px", marginRight: "10px" }}
      >
        Save
      </button>
      <button onClick={handleReset} style={{ height: "21px", left: "73px" }}>
        Reset
      </button>
      <main className="Canvas" onDrop={handleDrop} onDragOver={handleDragOver}>
        <div style={{ visibility: show ? "visible" : "hiddden" }}>
          {arr.map((item, index) => (
            <div
              style={{
                margin: "0px",
                left: `${item.x}px`,
                top: `${item.y}px`,
                position: "absolute",
                height: `${item.Height + 10}px`,
                width: `${item.Width + 10}px`,
              }}
            >
              <div>
                <svg
                  height={item.Height}
                  width={item.width}
                  stroke="black"
                  style={{ position: "absolute", backgroundColor: "white" }}
                >
                  <foreignObject
                    x="0"
                    y="0"
                    width={item.width}
                    height={item.Height}
                  >
                    <div
                      style={{
                        top: "0",
                        left: "0",
                        right: "0",
                        height: "5px",
                        cursor: "n-resize",
                        backgroundColor: "black",
                      }}
                      data-shape={"top"}
                      onPointerDown={pointerDown}
                      onPointerMove={(e) => pointerMove(e, item)}
                      onPointerUp={pointerUp}
                    ></div>
                    <div
                      style={{
                        top: "0",
                        left: "0",
                        bottom: "0",
                        width: "5px",
                        cursor: "e-resize",
                        backgroundColor: "black",
                        position: "absolute",
                      }}
                      data-shape={"left"}
                      onPointerDown={pointerDown}
                      onPointerMove={(e) => pointerMove(e, item)}
                      onPointerUp={pointerUp}
                    ></div>
                    <div
                      style={{
                        top: "0",
                        right: "0",
                        bottom: "0",
                        width: "5px",
                        cursor: "w-resize",
                        backgroundColor: "black",
                        position: "absolute",
                      }}
                      data-shape={"right"}
                      onPointerMove={(e) => pointerMove(e, item)}
                      onPointerDown={pointerDown}
                      onPointerUp={pointerUp}
                    ></div>
                    <div
                      style={{
                        right: "0",
                        left: "0",
                        bottom: "0",
                        height: "5px",
                        cursor: "s-resize",
                        backgroundColor: "black",
                        position: "absolute",
                      }}
                      data-shape={"bottom"}
                      onPointerDown={pointerDown}
                      onPointerMove={(e) => pointerMove(e, item)}
                      onPointerUp={pointerUp}
                    ></div>

                    <textarea
                      draggable
                      onDragStart={(event) => handleDragStart(event, item)}
                      onDrag={(event) => onDrag(event, item)}
                      key={item.UUID}
                      data-shape={
                        item.SHAPE === SHAPE_TYPES.RECT
                          ? SHAPE_TYPES.RECT
                          : SHAPE_TYPES.CIRCLE
                      }
                      value={item.STRING}
                      style={{
                        outline: "none",
                        height: `${item.Height - 10}px`,
                        width: `${item.width - 10}px`,
                        cursor: "move",
                        textAlign: "center",
                        fontWeight: "600",
                        fontSize: "20px",
                        padding: "0px",
                        border: "0px",
                        marginLeft: "5px",
                        marginTop: "0px",
                        overflow: "hidden",
                        resize: "none",
                      }}
                      onClick={() => {
                        selected(item);
                      }}
                      onChange={(e) => {
                        updateString(e, item);
                      }}
                    />
                  </foreignObject>
                  {item.Selected && (
                    <>
                      <path
                        d="M0,1 L70,1"
                        stroke="black"
                        strokeDasharray="6,6"
                        strokeWidth="3"
                      />
                      <circle
                        cx="76"
                        cy="2"
                        r="4"
                        strokeWidth="1"
                        stroke="black"
                        fill="white"
                        onClick={(e) => pushArrow(e, item, "top")}
                        cursor="pointer"
                      />
                      <path
                        d="M81,1  L150,1"
                        stroke="black"
                        strokeDasharray="6,6"
                        strokeWidth="3"
                      />
                      <path
                        d="M149,5  L149,50"
                        stroke="black"
                        strokeDasharray="6,6"
                        strokeWidth="3"
                      />
                      <circle
                        cx="148"
                        cy="50"
                        r="4"
                        strokeWidth="1"
                        stroke="black"
                        fill="white"
                        cursor="pointer"
                        onClick={(e) => pushArrow(e, item, "right")}
                      />
                      <path
                        d="M149,58  L149,100"
                        stroke="black"
                        strokeDasharray="6,6"
                        strokeWidth="3"
                      />
                      <path
                        d="M148,99  L75,99"
                        stroke="black"
                        strokeDasharray="6,6"
                        strokeWidth="3"
                      />
                      <circle
                        cx="76"
                        cy="98"
                        r="4"
                        strokeWidth="1"
                        stroke="black"
                        fill="white"
                        cursor="pointer"
                        onClick={(e) => pushArrow(e, item, "bottom")}
                      />
                      <path
                        d="M2,99 L70,99"
                        stroke="black"
                        strokeDasharray="6,6"
                        strokeWidth="3"
                      />
                      <path
                        d="M1,98  L1,54"
                        stroke="black"
                        strokeDasharray="6,6"
                        strokeWidth="3"
                      />
                      <circle
                        cx="2"
                        cy="50"
                        r="4"
                        strokeWidth="1"
                        stroke="black"
                        fill="white"
                        cursor="pointer"
                        onClick={(e) => pushArrow(e, item, "left")}
                      />
                      <path
                        d="M1,45  L1,0"
                        stroke="black"
                        strokeDasharray="6,6"
                        strokeWidth="3"
                      />
                    </>
                  )}
                </svg>
              </div>
            </div>
          ))}
          {arrow.arrows.length > 0
            ? arrow.arrows.map((item) => {
                return (
                  <Arrow
                    startPoint={item.featureAPosition}
                    endPoint={item.featureBPosition}
                    config={{
                      strokeWidth: 2,
                    }}
                    UUID={item.UUID}
                    Selected={item.Selected}
                  />
                );
              })
            : null}
        </div>
      </main>
    </>
  );
};
export default Canva;
