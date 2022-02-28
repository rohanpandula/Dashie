import React, { useState, useEffect, useMemo } from "react";
import { useTable, useRowSelect } from "react-table";
import styled from "styled-components";

//Utility Functions
const isRowDisabled = (row) => row.values.status == "offline";

//Styled Components
const TableRow = styled.tr`
  background-color: ${(props) =>
    props.selected ? "palevioletred" : "#C5C5C5"};
  &:hover {
    background-color: ${(props) => (props.selected ? "#FFA6C9" : "#EEEDE7")};
    transition: 0.3s ease-out;
    cursor: pointer;
  }
`;

const Button = styled.button`
  /* Adapt the colors based on primary prop */
  background: ${(props) => (props.downloadable ? "palevioletred" : "white")};
  color: ${(props) => (props.downloadable ? "white" : "palevioletred")};

  font-size: 1em;
  padding: 0.25em 1em;
  border: 2px solid palevioletred;
  border-radius: 3px;
`;

//Checkbox Component
const IndeterminateCheckbox = React.forwardRef(
  (
    {
      checked,
      indeterminate,
      onChange = () => undefined,
      isDisabled = false,
      ...rest
    },
    ref
  ) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <input
          type="checkbox"
          checked={checked}
          ref={resolvedRef}
          disabled={isDisabled}
          onChange={onChange}
          {...rest}
        />
      </>
    );
  }
);

//Table Status Component
const TableTopBar = ({ rows, selectedRowIds, downloadModal }) => {
  console.log("rows:", rows);
  console.log("selectedRowIds:", selectedRowIds);

  const selectedRows = rows.filter((row) => row.isSelected);
  console.log("selectedRows", selectedRows);
  console.log("selectedRows length", selectedRows.length);

  const disabled = selectedRows.length === 0;

  return (
    <div
      style={{
        marginTop: "1em",
        marginBottom: "1em",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>Selected: {!disabled ? selectedRows.length : "none"}</div>
      <Button
        downloadable={!disabled}
        disabled={disabled}
        onClick={() => downloadModal(true)}
      >
        View Online Lights
      </Button>
    </div>
  );
};

//Main Table Component
const FileTable = ({ data, columns }) => {
  const [showModal, setShowModal] = useState(false);
  //using selection row example from: https://react-table.tanstack.com/docs/examples/row-selection

  const tableDataMemoized = useMemo(() => data);
  const tableColumnsMemoized = useMemo(() => columns);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
    state: { selectedRowIds },
  } = useTable(
    {
      columns: tableColumnsMemoized,
      data: tableDataMemoized,
    },
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        // Let's make a column for selection
        {
          id: "selection",

          //pass in rows as a prop to force re-render when rows arrive from fetch call
          Header: ({ rows }) => {
            // algorithm taken from: https://github.com/TanStack/react-table/issues/2988
            // using custom props in header row to prevent select all from selecting disabled checkboxes
            // this allows us to not have to pass in getToggleAllRowsSelectedProps because we are overwriting onChange
            const changeableRows = !isRowDisabled
              ? [...rows]
              : rows.filter((row) => !!isRowDisabled && !isRowDisabled(row));

            const allSelected = changeableRows.every((row) => row.isSelected);
            const allUnselected = changeableRows.every(
              (row) => !row.isSelected
            );

            return (
              <div style={{}}>
                <IndeterminateCheckbox
                  checked={!allUnselected}
                  indeterminate={!allSelected && !allUnselected}
                  onChange={() => {
                    //console.log("CHANGEABLE ROWS", changeableRows);
                    //console.log("inside onchange:: ", selected);
                    changeableRows.forEach((row) =>
                      row.toggleRowSelected(!allSelected)
                    );
                  }}
                  // {...getToggleAllRowsSelectedProps()}
                />
              </div>
            );
          },
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
          Cell: ({ row }) => {
            //console.log(row.values.status == "offline");
            return (
              <div>
                <IndeterminateCheckbox
                  isDisabled={row.values.status == "offline"}
                  {...row.getToggleRowSelectedProps()}
                />
              </div>
            );
          },
        },
        ...columns,
      ]);
    }
  );

  return (
    <div
      style={{ display: "inline-block", position: "relative", margin: "1em" }}
      id="tablecontainer"
    >
      <TableTopBar
        rows={rows}
        selectedRowIds={selectedRowIds}
        downloadModal={setShowModal}
      />
      <table {...getTableProps()} style={{}}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps()}
                  style={{
                    //borderBottom: "solid 3px red",
                    // background: "aliceblue",
                    color: "black",
                    fontWeight: "bold",
                  }}
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            // Add property to inform if row is disabled
            const rowWithCustomProp = Object.assign(row, {
              isDisabled: !!isRowDisabled && isRowDisabled(row),
            });
            // Prepare the row for display
            prepareRow(rowWithCustomProp);
            //prepareRow(row);
            return (
              <TableRow
                selected={row.isSelected}
                {...row.getRowProps()}
                data-testid={`row-${i}`}
                key={`row-${i}`}
              >
                {row.cells.map((cell, j) => {
                  return (
                    <td
                      {...cell.getCellProps()}
                      data-testid={`row-${i}-cell-${j}`}
                      key={`row-${i}-cell-${j}`}
                      style={{
                        padding: "10px",
                        borderRadius: "3px",
                        color:
                          row.values.status === "available" &&
                          cell.value === "available"
                            ? "green"
                            : "black",
                      }}
                    >
                      {row.values.status === "available" &&
                        cell.value === "available" && (
                          <svg
                            width="10px"
                            height="10px"
                            style={{ display: "inline-block" }}
                          >
                            <circle cx={5} cy={5} r={4} fill="green" />
                          </svg>
                        )}
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </TableRow>
            );
          })}
        </tbody>
      </table>
      {showModal && (
        <div
          className="modal"
          style={{
            position: "absolute",
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.25)",
            top: 0,
            left: 0,
          }}
        >
          <div
            className="modal-content"
            style={{
              position: "relative",
              backgroundColor: "#fff",
              width: "700px",
              minHeight: "200px",
              borderRadius: "3px",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <button
              style={{ margin: "1em" }}
              onClick={() => {
                setShowModal(false);
              }}
            >
              close
            </button>
            <div style={{ marginBottom: "10px" }}>
              <h3 style={{ marginLeft: "0.75em" }}>Available Lights:</h3>
              <ul>
                {rows
                  .filter((row) => row.isSelected)
                  .map((row) => {
                    return <li>{row.values.name}</li>;
                  })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileTable;
