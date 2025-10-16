import { useEffect, useState, useRef, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber } from 'primereact/inputnumber';

function App() {
  const [data1, setData1] = useState([]);
  const [pagination, setPagination] = useState(1);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [numRows, setNumRows] = useState(0);
  const op = useRef(null);

  // Fetch data for current page
  useEffect(() => {
    fetch(`https://api.artic.edu/api/v1/artworks?page=${pagination}`)
      .then((res) => res.json())
      .then((data) => setData1(data.data))
      .catch((err) => console.error(err));
  }, [pagination]);

  // Handle selecting rows across pages
  const handleSelectRows = async () => {
    if (numRows <= 0) return;

    let selectedIds = [...selectedRowIds];
    let page = 1;

    while (selectedIds.length < numRows) {
      const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`);
      const data = await response.json();

      const ids = data.data.map((row) => row.id);
      const remaining = numRows - selectedIds.length;
      selectedIds.push(...ids.slice(0, remaining));

      if (data.data.length === 0) break; // no more rows
      page++;
    }

    setSelectedRowIds(selectedIds);
    op.current.hide();
  };

  // Overlay button in header
  const overlayButton = useMemo(
    () => <Button label="^" onClick={(e) => op.current.toggle(e)} />,
    []
  );

  return (
    <div>
      <OverlayPanel ref={op} showCloseIcon id="overlay_panel" dismissable>
        <div className="flex flex-col gap-2">
          <span>Enter number of rows to select:</span>
          <InputNumber value={numRows} onValueChange={(e) => setNumRows(e.value)} min={0} />
          <Button label="Select Rows" onClick={handleSelectRows} />
        </div>
      </OverlayPanel>

      <DataTable
        value={data1}
        paginator
        rows={12}
        totalRecords={10824}
        lazy
        first={(pagination - 1) * 12}
        onPage={(e) => setPagination(e.page + 1)}
        selection={data1.filter((row) => selectedRowIds.includes(row.id))}
        onSelectionChange={(e) => {
          const newSelected = e.value.map((row) => row.id);
          // merge with previous selection, removing deselected rows
          const updatedIds = selectedRowIds.filter((id) => !data1.some((r) => r.id === id));
          setSelectedRowIds([...updatedIds, ...newSelected]);
        }}
        dataKey="id"
        selectionMode="checkbox"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
        <Column header={overlayButton} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist Display" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Date Start" />
        <Column field="date_end" header="Date End" />
      </DataTable>
    </div>
  );
}

export default App;
