import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import App from "./App";
import FileTable from "./components/FileTable";

// trying this test style: https://stackoverflow.com/questions/59892259/testing-api-call-inside-useeffect-using-react-testing-library

describe("fetch is called once and the table is rendered with the resulting data", () => {
  let originFetch;

  beforeEach(() => {
    originFetch = global.fetch;
  });
  afterEach(() => {
    global.fetch = originFetch;
  });

  it("should pass", async () => {
    const fakeResponse = {
      rows: [
    {
      "name": "Ambient Lights",
      "device": "Light",
      "feature": "Full Color",
      "status": "available"
    },
      ],
    };
    const mRes = { json: jest.fn().mockResolvedValueOnce(fakeResponse) };

    const mockedFetch = jest.fn().mockResolvedValueOnce(mRes);
    global.fetch = mockedFetch;
    const { getByTestId } = render(<App></App>);
    const firstPathCell = await waitFor(() => getByTestId("row-0-cell-3"));
    expect(firstPathCell).toHaveTextContent(
      "\\Device\\HarddiskVolume2\\Windows\\System32\\smss.exe"
    );
    expect(mockedFetch).toBeCalledTimes(1);
    expect(mRes.json).toBeCalledTimes(1);
  });
});
