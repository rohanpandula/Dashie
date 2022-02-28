import logo from "./logo.svg";
import "./App.css";
import React, { useEffect, useState } from "react";
import FileTable from "./components/FileTable";

const staticTableData = [
    {
      "name": "Living Room Lamp",
      "device": "Light",
      "feature": "Color Temp",
      "status": "available"
    },

    {
      "name": "TV Lights",
      "device": "Light",
      "feature": "Full Color",
      "status": "scheduled"
    },

    {
      "name": "Ambient Lights",
      "device": "Light",
      "feature": "Full Color",
      "status": "available"
    },

    {
      "name": "Kitchen Counter Lights",
      "device": "Light",
      "feature": "Full Color",
      "status": "scheduled"
    },
    {
      "name": "Garage asdfsa Opener",
      "device": "Switch",
      "feature": "Open/Closed",
      "status": "available"
    },

    {
      "name": "Kitchen Island Lights",
      "device": "Light",
      "feature": "Full Color",
      "status": "scheduled"
    }
];

const staticTableColumns = [
  { Header: "Name", accessor: "name" },
  { Header: "Device", accessor: "device" },
  { Header: "feature", accessor: "feature" },
  { Header: "Status", accessor: "status" },
];

function App() {
  const [tableDataFromServer, setTableDataFromServer] = useState([]);
  useEffect(() => {
    fetch("http://localhost:8000/tabledata.json")
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data);
        setTableDataFromServer(data.rows);
        //our columns are static, but theoretically its possible to derive the columns from this response
        //and then use that to derive the columns dynamically as well.
      });
  }, []);
  return (
    <FileTable
      data={tableDataFromServer}
      columns={staticTableColumns}
    ></FileTable>
  );
}

export default App;
